import pandas as pd  # handles datasets
import numpy as np  # matrix operations
import os  # for file checks
from sklearn.feature_extraction.text import TfidfVectorizer  # converts text data into numerical form
from sklearn.metrics.pairwise import cosine_similarity  # measures similarity between movie vectors
from sentence_transformers import SentenceTransformer  # loads the SBERT model to generate embeddings
from scipy.sparse import hstack # combines "sparse matrices"
from scipy.sparse import csr_matrix # used for working with sparse matrices

# loads the pre trained SBERT model (efficient encoding of movie plot summaries into embeddings (numeric representations of the text)
print("Loading SBERT model...")
model = SentenceTransformer('all-MiniLM-L6-v2')  # lightweight model for efficiency

# read the csv files
print("Reading CSV files...")
movies_plot = pd.read_csv("input_data/movies_cleaned_plot.csv")  # contains movie titles and cleaned plots
movies_features = pd.read_csv("input_data/movies_non_plot_features.csv")  # contains other attributes

# specifies the file path where the pre-computed SBERT embeddings will be stored
sbert_embeddings_path = "input_data/sbert_embeddings.npy"

if os.path.exists(sbert_embeddings_path): # checks if it already exists
    print("Loading precomputed SBERT embeddings...")
    sbert_embeddings = np.load(sbert_embeddings_path)  # if it does, the embeddings are loaded
else:
    print("Generating SBERT embeddings...")
    sbert_embeddings = model.encode(movies_plot['plot_cleaned'].fillna("").tolist(), convert_to_numpy=True)
    np.save(sbert_embeddings_path, sbert_embeddings)  # if it doesn't exist, generates new SBERT embeddings and saves them

# this adds the sbert embeddings as a new column
movies_plot['sbert_plot_embedding'] = list(sbert_embeddings)

print("SBERT embeddings successfully assigned to DataFrame.")

# convert all the non-plot features in file into a single text column
# allows TF-IDF to process all categorical metadata together
print("Processing combined features...")
movies_features["combined_features"] = (
    movies_features["Plot Kyeword"] + " " +
    movies_features["Director"] + " " +
    movies_features["Top 5 Casts"] + " " +
    movies_features["Generes"]
)

# apply the TF-IDF vectorization on the combined features
# converts the combined text features into a numerical matrix
print("Computing TF-IDF matrix...")
tfidf_vectorizer = TfidfVectorizer() 
tfidf_matrix = tfidf_vectorizer.fit_transform(movies_features["combined_features"].fillna(""))
# the fit_transform basically converts the data into a sparse matrix of values (each feature is a number that represents its importance in dataset)

# weight the SBERT plot and non-plot features
plot_weight = 0.7
non_plot_weight = 0.3

# ensure that the SBERT embeddings are in sparse format (if not already)
weighted_sbert_embeddings = csr_matrix(sbert_embeddings) * plot_weight
weighted_tfidf_matrix = tfidf_matrix * non_plot_weight

# combine the weighted matrices and ensure everything is in CSR format
print("Combining weighted features...")
# the hstack() stacks the embedding + matrix into one matrix
# the tocsr() converts it to a csr format which is more efficient for storing and processing sparse data
full_feature_matrix = hstack([weighted_sbert_embeddings, weighted_tfidf_matrix]).tocsr()

def find_movie_by_title(movie_input):
    # loop through the dataset to get the index and title of the inputted movie
    for index, row in enumerate(movies_plot["movie title"]):
        if movie_input.lower() == row.lower(): # compares the lowercase title
            print(f"Movie: {movie_input} found at index {index}.")
            return index
    
    # if movie not found
    print(f"Movie {movie_input} not found in the dataset. Try another movie.")
    return None

def get_similar_movies(movie_title, top_n = 3):
    # call function and get the index of desired movie
    input_movie_index = find_movie_by_title(movie_title)

    if input_movie_index is None:
        return None

    # calculate the cosine similarity between the input movie and all other movies
    similarity_scores = cosine_similarity(full_feature_matrix[input_movie_index], full_feature_matrix).flatten()

    # result is a 1D array of similarity scores

    # want to exclude the input movie (bc would always have highest score of 1)
    similarity_scores[input_movie_index] = -1

    # sort these similarity scores in descending order
    sorted_indexes = similarity_scores.argsort()[::-1]

    # get whatever top n we want
    top_movies = sorted_indexes[:top_n]

    # extract the movie titles that correspond to these indexes
    similar_movies = movies_plot['movie title'].iloc[top_movies]
    
    # extract the similarity score of the top movies
    similar_movies_score = similarity_scores[top_movies]

    return list(zip(similar_movies, similar_movies_score))

# example with a movie
print("Running movie recommendation system...")
similar_movies = get_similar_movies("Spider-Man: No Way Home", top_n=3)
print("Recommended movies:", similar_movies)
import pandas as pd  # handles datasets
import numpy as np  # matrix operations
import os  # for file checks
from sklearn.feature_extraction.text import TfidfVectorizer  # converts text data into numerical form
from sklearn.metrics.pairwise import cosine_similarity  # measures similarity between movie vectors
from sentence_transformers import SentenceTransformer  # loads the SBERT model to generate embeddings
from scipy.sparse import hstack  # combines "sparse matrices"
from scipy.sparse import csr_matrix  # used for working with sparse matrices
import requests

# get the absolute path to the project root (UltimateMovieRecommendation)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  

# define absolute paths for input data
MOVIES_PLOT_PATH = os.path.join(BASE_DIR, "backend", "input_data", "movies_cleaned_plot.csv")
MOVIES_FEATURES_PATH = os.path.join(BASE_DIR, "backend", "input_data", "movies_non_plot_features.csv")
SBERT_EMBEDDINGS_PATH = os.path.join(BASE_DIR, "backend", "input_data", "sbert_embeddings.npy")

# For movie api calls
base_url = "https://api.themoviedb.org/3"
tmdb_api_key = "9783354ee4a285168b36af0283b59f02"
# tmdb_api_key = os.getenv("TMDB_API_KEY")

# Load the pre-trained SBERT model
print("Loading SBERT model...")
model = SentenceTransformer('all-MiniLM-L6-v2')  # lightweight model for efficiency

# read the csv files here
print("Reading CSV files...")
movies_plot = pd.read_csv(MOVIES_PLOT_PATH)  # contains movie titles and cleaned plots
movies_features = pd.read_csv(MOVIES_FEATURES_PATH)  # contains other attributes

# Check for precomputed SBERT embeddings
if os.path.exists(SBERT_EMBEDDINGS_PATH):  
    print("Loading precomputed SBERT embeddings...")
    sbert_embeddings = np.load(SBERT_EMBEDDINGS_PATH)  
else:
    print("Generating SBERT embeddings...")
    sbert_embeddings = model.encode(movies_plot['plot_cleaned'].fillna("").tolist(), convert_to_numpy=True)
    np.save(SBERT_EMBEDDINGS_PATH, sbert_embeddings)  

# Add the SBERT embeddings as a new column
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
plot_weight = 0.5
non_plot_weight = 0.5

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

def get_movies(max_pages=1):
    """This function retrieves movies."""
    movies = []

    for page in range(1, max_pages + 1):
        url = f"{base_url}/discover/movie?api_key={tmdb_api_key}&language=en-US&page={page}"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json().get("results", [])
            for movie in data:
                movies.append({
                    "id": movie["id"],
                    "title": movie["title"],
                    "release_date": movie.get("release_date", "Unknown")
                })
        else:
            print(f"Failed to fetch page {page}: {response.status_code}")
            break

    return movies

def get_free_streaming_services(movie_id):
    """Fetch available streaming services for a given movie, including rent and buy options."""
    url = f"{base_url}/movie/{movie_id}/watch/providers?api_key={tmdb_api_key}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json().get("results", {})
        us_data = data.get("US", {})

        # This will show if a movie is available for free streaming
        streaming_services = [s["provider_name"] for s in us_data.get("flatrate", [])]

        # Return dictionary with streaming services
        return {"streaming": streaming_services if streaming_services else ["Not Available"]}
    else:
        print(f"Failed to fetch streaming services for movie ID {movie_id}: {response.status_code}")
        return {"streaming": ["Error"]}

def match_movie_to_streaming(streaming_services, movie_list):
    """Dynamically find up to 3 movies available on the given streaming services."""

    print("Raw movie list input:", movie_list)  # Debugging print
    print(streaming_services)

    three_movies = []
    added_movies = set()  # Track movies that have already been added

    # Extract only movie titles if tuples (title, similarity_score) are present
    clean_movie_list = [movie[0] if isinstance(movie, tuple) else movie for movie in movie_list]

    print("Cleaned movie list:", clean_movie_list)  # Debugging print

    for film in clean_movie_list:
        if film in added_movies:
            continue  # Skip duplicates

        print(f"Searching for movie: {film}")  # Debugging print

        # API call to search for the movie
        search_url = f"{base_url}/search/movie?api_key={tmdb_api_key}&query={film}&language=en-US"
        response = requests.get(search_url)

        if response.status_code != 200:
            print(f"Failed to search for movie '{film}': {response.status_code}")
            continue  # Skip this movie if there's an API issue

        search_results = response.json().get("results", [])
        if not search_results:
            print(f"Movie '{film}' not found.")
            continue  # Skip if the movie is not found

        movie_id = search_results[0]["id"]
        services = get_free_streaming_services(movie_id)

        # Extract available streaming services
        available_streaming = set(services.get("streaming", []))

        # Check if any streaming service matches user preferences
        matching_services = available_streaming.intersection(streaming_services)
        if matching_services:
            matched_service = list(matching_services)[0]  # Pick the first match
            three_movies.append({
                "movie": film,
                "streaming_service": matched_service
            })
            added_movies.add(film)  # Mark movie as added

            print(f"Match found: {film} on {matched_service}")  # Debugging print

            if len(three_movies) == 3:  # Stop as soon as 3 movies are found
                print("Found 3 movies. Stopping search.")  # Debugging print
                return three_movies

    print("Final matched movies:", three_movies)  # Debugging print

    return three_movies if three_movies else None  # Return None if no matches

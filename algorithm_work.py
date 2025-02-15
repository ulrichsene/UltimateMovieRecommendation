import pandas as pd
import string # this is used to remove punctuation -- helps to eliminate "noise"
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS # e.g. "the, is, and etc", keeps only meaningful words
import re # used to substitute [ ] in columns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# import torch # deep learning library (PyTorch) to run models and process data
# from transformers import DistilBertTokenizer, DistilBertModel
# # transformers is a library from Hugging Face 

# # here is where we will implement the content-based movie recommendation system

# # load the pre-trained BERT model and tokenizer
# tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
# model = DistilBertModel.from_pretrained('distilbert-base-uncased')
# # the tokenizer splits the input text (plot overview) into smaller chunks that BERT understands

# def get_bert_embedding(text):
#     inputs = tokenizer(text, return_tensors = 'pt', truncation = True, padding = True, max_length = 512)
#     # text = plot overview
#     # return_tensors = pt tells the tokenizer to return the output as a PyTorch tensor which Bert uses
#     # truncation = True if text is too long it shortens it to fit BERT's max input size

#     with torch.no_grad():
#         outputs = model(**inputs) # sends tokenized inputs into BERT model
    
#     embedding = outputs.pooler_output
#     # gives us the embedding for the entire input text (plot overview). 
#     # the pooler output represents a dense vector that summarizes the meaning of the input sentence.

#     return embedding.sqeeze().numpy() # convert tensor to numpy array and remove unnecessary dimensions

# sample_text = "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot and dodging the advancement in rank that would ground."
# embedding = get_bert_embedding(sample_text)
# print("Embedding shape:", embedding.shape)  # Should print something like (768,)
# print("First few values of the embedding:", embedding[:10])  # Prints first 10 elements


# step 3: convert this merged text data into numerical feature vectors
# apply the TF-IDF Vectorization on the merged text column.
# each movie will now be represented as a numerical vector.


# this allows us to compute the similarity between different movies.

# step 4: use cosine similarity to measure how similar movies are based on vectors
# return top 3 or something? closest matches

data = pd.read_csv("input_data/movies_cleaned_plot.csv")
data2 = pd.read_csv("input_data/movies_non_plot_features.csv")

def find_movie_by_title(movie_input):
    # loop through the dataset to get the index and title of the inputted movie
    for index, row in enumerate(data["movie title"]):
        if movie_input.lower() == row.lower(): # compares the lowercase title
            print(f"Movie: {movie_input} found at index {index}.")
            return index
    
    # if movie not found
    print(f"Movie {movie_input} not found in the dataset. Try another movie.")
    return None

known_movie = "iron man 2"
unknown_movie = "Vampire Diaries"

# test with both movies
find_movie_by_title(known_movie)
find_movie_by_title(unknown_movie)

def get_similar_movies(movie_title, top_n = 3):
    # call function and get the index of desired movie
    input_movie_index = find_movie_by_title(movie_title)

    if input_movie_index is None:
        return None
    
    # get the vector for the input movie
    vectorizer = TfidfVectorizer()
    movie_vectors = vectorizer.fit_transform(data2)
    input_movie_vector = movie_vectors[input_movie_index]

    # calculate the cosine similarity between the input movie and all other movies
    similarity_scores = cosine_similarity(input_movie_vector, movie_vectors).flatten()
    # resul is a 1D array of similarity scores

    # want to exclude the input movie (bc would always have highest score of 1)
    similarity_scores[input_movie_index] = -1

    # sort these similarity scores in descending order
    sorted_indexes = similarity_scores.argsort()[::-1]

    # get whatever top n we want
    top_movies = sorted_indexes[:top_n]

    # extract the movie titles that correspond to these indexes
    similar_movies = data['movie title'].iloc[top_movies]
    
    # extract the similarity score of the top movies
    similar_movies_score = similarity_scores[top_movies]

    return list(zip(similar_movies, similar_movies_score))

# step 5: for the actual recommendation function we could do something like this:
# take the movie title as input from the user
# find the movie in the dataset (if not found, return error message)
# extract its feature vector
# cocmpute similarity scores between this movie and all other movies
# sort the movies based on similarity scores (descending order?)


# example
known_movie = "Top Gun: Maverick"
similar_movies = get_similar_movies(known_movie, top_n=3)
print(similar_movies)
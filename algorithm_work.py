# here is where we will implement the content-based movie recommendation system

# step 1: preprocess the overview column (provides context and better descriptions rather than just using plot keywords)
# convert all text to lowercase
# remove punctuation
# remove stop words (e.g., "the", "is", "and") to keep only meaningful words.
# tokenize and normalize the text 

import pandas as pd

data = pd.read_csv("input_data/final_cleaned_IMDb_dataset.csv")
print(data.head())

# extract the overview column
if 'Overview' in data.columns:
    print("\nOverview column found. Displaying first few overviews:\n")
    print(data['Overview'].head(10))
else:
    print("\nError: 'Overview' column not found in dataset!")


# start preprocessing this column
import string # this is used to remove punctuation -- helps to eliminate "noise"
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS # e.g. "the, is, and etc", keeps only meaningful words

def preprocess_text(text): # takes in text (i.e. a movie overview)
    if isinstance(text, str): # checks if text is a string (only want to process valid strings)
        text = text.lower() # converts all characters to lowercase for consistency
        text = text.translate(str.maketrans('', '', string.punctuation)) # removes punctuation (replaces with empty string)

        words = text.split() # split into words
        filtered_words = []

        for word in words:  
            if word not in ENGLISH_STOP_WORDS or word in {"who", "as", "is", "are", "one", "new"}:
                filtered_words.append(word)  # keeps meaningful stopwords  
        
        text = " ".join(filtered_words) # rejoin non stop words into a single string
        return text.strip() # remove any extra spaces
    return "" # just return empty string 

# apply this function to the overview column
data['Cleaned_Overview'] = data['Overview'].apply(preprocess_text)

# Debugging: Print before/after comparison
print("\nOriginal vs Cleaned Overview:\n")
for i in range(5):  # Show first 5 rows
    print(f"Original: {data['Overview'].iloc[i]}")
    print(f"Cleaned: {data['Cleaned_Overview'].iloc[i]}\n")

# NOTE: NEED TO MAKE SURE NOT OVER PROCESSING AND PLOT SUMMARY ISN'T READABLE!

# step 2: merge all the relevant features into a single text field (will allow the vectorizer to compare information effectively)
# use title, genres, overview, plot keywords, director, top 5 cast members

data["combined_features"] = (
    data["movie title"] + " " +
    data["Generes"] + " " +
    data["Overview"] + " " +
    data["Plot Kyeword"] + " " +
    data["Director"] + " " + 
    data["Top 5 Casts"]
)

# print a sample to verify
print("\nSample Combined Feature Text:\n")
print(data["combined_features"].iloc[0])  # prints the full text for the first movie

# NOTE: TO DO -- remove the genres/top 5 cast so it's just one single text field for each movie will work well for TF-IDF
# for some reason my cleaned overview isn't showing up?? fix later 

# step 3: convert this merged text data into numerical feature vectors
# apply the TF-IDF Vectorization on the merged text column.
# each movie will now be represented as a numerical vector.
# this allows us to compute the similarity between different movies.

# step 4: use cosine similarity to measure how similar movies are based on vectors
# return top 3 or something? closest matches

# step 5: for the actual recommendation function we could do something like this:
# take the movie title as input from the user
# find the movie in the dataset (if not found, return error message)
# extract its feature vector
# compute similarity scores between this movie and all other movies
# sort the movies based on similarity scores (descending order?)
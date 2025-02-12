import pandas as pd
import string # this is used to remove punctuation -- helps to eliminate "noise"
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS # e.g. "the, is, and etc", keeps only meaningful words

# here is where we will implement the content-based movie recommendation system

# step 1: preprocess the overview column (provides context and better descriptions rather than just using plot keywords)
# convert all text to lowercase, remove punctuation, remove stop words (e.g., "the", "is", "and") to keep only meaningful words.

# read the file
data = pd.read_csv("input_data/final_cleaned_IMDb_dataset.csv")
print(data.head())

# extract the overview column
if 'Overview' in data.columns:
    print("\nOverview column found. Displaying first few overviews:\n")
    print(data['Overview'].head(10))
else:
    print("\nError: 'Overview' column not found in dataset!")


# helper function to start preprocessing this column
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

# want to create a new dataframe with movie title and cleaned overview
output_data = data[['movie title', 'Cleaned_Overview']]

# save this to a new CSV file
output_data.to_csv('movies_with_cleaned_overview.csv', index=False)

# debugging: print before/after for comparison
print("\nOriginal vs Cleaned Overview:\n")
for i in range(5): # just display first 5 movies
    print(f"Original: {data['Overview'].iloc[i]}")
    print(f"Cleaned: {output_data['Cleaned_Overview'].iloc[i]}\n")

# NOTE: NEED TO MAKE SURE NOT OVER PROCESSING AND PLOT SUMMARY ISN'T READABLE!

# step 2: merge all the relevant features into a single text field (will allow the vectorizer to compare information effectively)
# use title, genres, overview, plot keywords, director, top 5 cast members

# print a sample to verify
print("\nSample Combined Feature Text:\n")

# helper function to convert lists into space-separated strings (e.g. Genre, Actors, Plot Keywords)
def list_to_string(lst):  # takes one argument (list that we want to convert to a string)
    if isinstance(lst, list):  # checks if the argument is actually a list
        # converts each element to string and join them with a space
        return " ".join(str(i) for i in lst)  # Using generator expression to convert and join
    return str(lst)  # If it's not a list, just return the string version of it

# apply this helper function to each column that may contain lists
data['Generes'] = data['Generes'].apply(list_to_string)
data['Plot Kyeword'] = data['Plot Kyeword'].apply(list_to_string)
data['Top 5 Casts'] = data['Top 5 Casts'].apply(list_to_string)

# in order of importance?
data["combined_features"] = (
    "Plot: " + output_data["Cleaned_Overview"] + " " + 
    "Keywords: " + data["Plot Kyeword"] + " " +
    "Actors: " + data["Top 5 Casts"] + " " +
    "Director: " + data["Director"] + " " +
    "Genres: " + data["Generes"] 
)

# create a new dataframe with both the movie title and the combined features
output_data2 = data[['movie title', 'combined_features']]

# save this to a new CSV
output_data2.to_csv('movies_with_combined_features.csv', index=False)

# NOTE: NEED TO FIX THE LIST TO STRING (not working right now)

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
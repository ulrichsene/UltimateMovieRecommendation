import pandas as pd
import re

# load dataset
data = pd.read_csv("input_data/25k IMDb movie Dataset.csv")
print(data.head(2))

# make a copy of original for cleaned dataset
data_cleaned = data.copy()

# remove incorrect/unncessary columns
data_cleaned = data_cleaned.drop(columns = ['Run Time', 'Rating', 'User Rating', 'path'])
print(data_cleaned.head(2))

# now need to clean the year column because weird formatting
def extract_year(value):
    if isinstance(value, str):
        cleaned_value = re.sub(r'[^\d]', '', value) # so what this does is match any character that is NOT a digit and replace it with an empty string
        
        # here we check if the year is valid
        if cleaned_value.isdigit() and 1000 <= int(cleaned_value) <= 3000:
            return int(cleaned_value)  # make sure to return the year as an integer
    return None  # if no valid year is found

# we apply this function to the year column
data_cleaned['year'] = data_cleaned['year'].apply(extract_year)

# this ensures that the year will be a integer
data_cleaned['year'] = data_cleaned['year'].astype('Int64')  # Using Int64 for handling None values

print(data_cleaned.head(2))

# save to a new file
data_cleaned.to_csv("final_cleaned_IMDb_dataset.csv", index=False)


import os
import requests

# For movie api calls
BASE_URL = "http://www.omdbapi.com/?apikey="
OMDB_API_KEY = "3d4cafcf"

def get_movie_poster_url(movie_title, year=None):
    # Build the URL to fetch movie
    url = f"{BASE_URL}{OMDB_API_KEY}&t={movie_title}"
    if year:
        url += f"&y={year}"

    # Send the request
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        if data.get('Response') == 'True' and 'Poster' in data:
            return data['Poster']

    # Return None if no poster was found
    return None

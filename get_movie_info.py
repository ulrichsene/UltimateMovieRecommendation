
import requests
import json

# Declare the API keys and base URLs
watchmode_api_key = "C9jD5sQKfD7UMfht2vFXmTIdJKzZHzJkV0TmsiDn"
watchmode_base_url = "https://api.watchmode.com/v1"
tmdb_api_key = "9783354ee4a285168b36af0283b59f02"
tmdb_base_url = "https://api.themoviedb.org/3"

def get_movies(limit=25):
    """This function fetches a list of movies from the Watchmode API, specifies how many movies to retrieve"""
    url = f"{watchmode_base_url}/list-titles/?apiKey={watchmode_api_key}&limit={limit}"
    response = requests.get(url)

    if response.status_code == 200:
        movies = response.json().get("titles", [])
        return movies  # Returns the list of movies
    else:
        print(f"Failed to fetch movies: {response.status_code}")
        return []

def get_movie_details(tmdb_id):
    """This function fetches more detailed information about a specific movie from TMDb using its id"""
    url = f"{tmdb_base_url}/movie/{tmdb_id}?api_key={tmdb_api_key}"
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch details for TMDB ID {tmdb_id}: {response.status_code}")
        return None

def get_movie_credits(tmdb_id):
    """This function fetches the cast and crew information for a specific movie from TMDb using TMDB ID."""
    url = f"{tmdb_base_url}/movie/{tmdb_id}/credits?api_key={tmdb_api_key}"
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch credits for TMDB ID {tmdb_id}: {response.status_code}")
        return {}

def fetch_and_save_movie_data():
    """This function fetches movie IDs, retrieves their details and cast information, and saves them to a JSON file."""
    movies = get_movies(limit=25) # calls get_movies to first get the movies
    movie_list = [] # initializes an empty list to store the movie data

    for movie in movies: # loop over the list of fetched movies
        tmdb_id = movie.get("tmdb_id") # retrieves the tmdb_id (from watchmode) of each movie
        
        if not tmdb_id:
            continue  # if the movie does not have a tmdb_id, it is skipped 
        
        details = get_movie_details(tmdb_id) # calls the get_movie_details function to fetch more details using id found
        
        if not details:
            print(f"Skipping movie with TMDB ID {tmdb_id} due to missing details.")
            continue  # this is supposed to skip the movies whose details are not available but some movies still are outputted even without actors
        
        credits = get_movie_credits(tmdb_id) # gets cast and crew info
        cast = credits.get("cast", []) # extracts the cast and crew lists from the credits data
        crew = credits.get("crew", [])
        
        actors = [member["name"] for member in cast if member["known_for_department"] == "Acting"]
        # this creates a list of actor names by filtering the cast list for members with known_for_department set to Acting
        directors = [member["name"] for member in crew if member["job"] == "Director"]
        # this creates a list of director names by filtering the crew list for members with job set to director

        movie_data = { # this constructs a dictionary containing each movie's id, title, genre, plot summary, actors and directors
            "id": movie["id"],
            "title": details.get("title"),
            "genres": [genre["name"] for genre in details.get("genres", [])],
            "plot_summary": details.get("overview"),
            "actors": actors,
            "directors": directors
        }
        movie_list.append(movie_data) # adds each movie data dictionary to the list of movies

    # opens a new file in write mode and saves this movie data list to the file as a json
    with open("movie_detailed_info.json", "w") as outfile:
        json.dump(movie_list, outfile, indent=4)

    print("All movie data saved to movie_detailed_info.json")

if __name__ == "__main__":
    fetch_and_save_movie_data()

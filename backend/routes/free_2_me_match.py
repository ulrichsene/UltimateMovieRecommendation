import requests
import json
import os

# tmdb api info
# tmdb_api_key = os.getenv("TMDB_API_KEY")
tmdb_api_key = "9783354ee4a285168b36af0283b59f02"
base_url = "https://api.themoviedb.org/3"

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

def get_movie_id(movie_title):
    """Searches TMDB for the movie id based on the title"""
    url=f"{base_url}/search/movie?api_key={tmdb_api_key}&query={movie_title}" # constructs a url for tmdbs search api
    response = requests.get(url) # sends request to tmdb

    if response.status_code != 200: # check if request was successful
        print(f"Error: Unable to fetch data ({response.status_code})")
        return None
    
    data = response.json() # converts response to json

    if data["results"]:
        return data["results"][0]["id"] # returns first matching movie's id
    else:
        print(f"No movie found for '{movie_title}")
        return None
    
def get_movie_details(movie_id):
    """This function will return general movie details (plot, actors, director, rating)"""
    # get plot and imdb rating
    url=f"{base_url}/movie/{movie_id}?api_key={tmdb_api_key}"
    response= requests.get(url)

    if response.status_code != 200:
        print(f"Error: Unable to fetch movie details ({response.status_code})")
        return None
    
    details_data = response.json()
    # from the movie credits we can get the director and cast info
    credits_url = f"{base_url}/movie/{movie_id}/credits?api_key={tmdb_api_key}"
    credits_response = requests.get(credits_url)

    if credits_response.status_code != 200:
        print(f"Error: Unable to fetch credits ({credits_response.status_code})")
        return None
    
    credits_data = credits_response.json()

    # get director
    director = "N/A" # default
    for crew_member in credits_data['crew']:
        if crew_member['job'] == 'Director':
            director = crew_member['name']
            break # stop once director is identified

    # get cast members (top 5?)
    top_cast = []
    for i, cast_member in enumerate(credits_data['cast']):
        if i >= 5: # stop looping after get to top 5 (can change)
            break
        top_cast.append(cast_member['name'])
    
    # combine details and return in easy to read format
    return {
        "Plot Summary": details_data.get("overview", "N/A"),
        "IMDb Rating": details_data.get("vote_average", "N/A"),
        "Director": director,
        "Top Cast": top_cast
    }
    
    
def get_movie_trailer(movie_id):
    """For a given movie id, gets the youtube trailer link"""
    url=f"{base_url}/movie/{movie_id}/videos?api_key={tmdb_api_key}"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: Unable to fetch trailers ({response.status_code})")
        return None

    data = response.json()

    if data["results"]:
        for video in data["results"]:
            if video["type"] == "Trailer" and video["site"] == "YouTube":
                return f"https://www.youtube.com/watch?v={video['key']}"

    print("No trailer found for this movie.")
    return None

def get_trailer_link(movie_title):
    """Ties together above two functions (gets movie id and then trailer link)"""
    movie_id = get_movie_id(movie_title)
    if not movie_id:
        return None
    
    return get_movie_trailer(movie_id)

def get_free_streaming_services(movie_id):
    """Fetch available streaming services for a given movie, including rent and buy options."""
    url = f"{base_url}/movie/{movie_id}/watch/providers?api_key={tmdb_api_key}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json().get("results", {})
        us_data = data.get("US", {})

        # this will show if a movie is available for free streaming
        streaming_services = [s["provider_name"] for s in us_data.get("flatrate", [])]

        # returns dictionary with streaming services
        return {"streaming": streaming_services if streaming_services else ["Not Available"]}
    else:
        print(f"Failed to fetch streaming services for movie ID {movie_id}: {response.status_code}")
        return {"streaming": ["Error"]}

def match_movie_to_streaming(streaming_services, movie_list):
    """Match movies from the list to their available streaming services."""
    three_movies = []
    added_movies = set()

    print(f"🎯 Matching {len(movie_list)} movies to services: {streaming_services}")

    for film in movie_list:
        if isinstance(film, str): # case where film is a string (just a title)
            movie_title = film
            movie_id = get_movie_id(movie_title)
        else:
            movie_title = film.get("movie")
            movie_id = film.get("movie_id")

        if not movie_title or not movie_id:
            print(f"❌ Skipping invalid or unresolvable movie: {film}")
            continue

        if movie_title in added_movies:
            continue

        services = get_free_streaming_services(movie_id) # gets available streaming services
        if services is None:
            print(f"⚠️ No streaming info found for: {movie_title}")
            continue

        available_streaming = services.get("streaming", [])
        if not available_streaming:
            print(f"⚠️ No streaming services for {movie_title}")
        
        print(f"🔎 {movie_title} available services: {available_streaming}")

        # check if any available services match the user's selected services
        for provider in available_streaming:
            if provider in streaming_services:
                print(f"✅ Match found: {movie_title} on {provider}")
                three_movies.append({
                    "movie": movie_title,
                    "movie_id": movie_id,
                    "streaming_service": provider
                })
                added_movies.add(movie_title)
                if len(three_movies) >= 3:
                    print(f"🎉 Found 3 matching movies!")
                    return three_movies

    # check how many matches were found
    if len(three_movies) < 3:
        print("❌ Less than 3 movies found:", three_movies)
        return []

    print("📺 Matching movies to user-selected services...")
    for movie in three_movies:
        print(f"✅ Matched Movie: {movie['movie']} — Streaming on: {movie['streaming_service']}")

    return three_movies


if __name__ == "__main__":
    list_of_movies = ["Inception", "The Matrix", "Pulp Fiction", "The Lord of the Rings: The Return of the King",
                      "The Departed", "Forrest Gump", "The Godfather: Part II", "The Social Network", "Fight Club",
                      "The Prestige", "The Empire Strikes Back", "The Green Mile", "Avengers: Endgame",
                      "The Lion King", "Interstellar", "The Godfather", "The Shawshank Redemption", "Gladiator",
                      "Schindler's List", "The Dark Knight"]
    
    list_of_streaming = ["Amazon Prime Video", "Netflix", "Youtube"]

    matched_movies = match_movie_to_streaming(list_of_streaming, list_of_movies)
    if matched_movies:
        print("Found 3 matching movies:")
        for movie in matched_movies:
            print(f"Movie: {movie['movie']}, Streaming on: {movie['streaming_service']}")

    # testing trailer here
    movie_title = "The Parent Trap"
    trailer_link=get_trailer_link(movie_title)
    print(f"Trailer for {movie_title}: {trailer_link}")

    # testing combined movie details here
    print("THIS IS WHERE I AM TESTING ALL OF IT TOGETHER")
    movie_id = get_movie_id("Avengers: Endgame")
    details = get_movie_details(movie_id)
    if details:
        print("Movie Details:")
        for key, value in details.items():
            print(f"{key}: {value}")
    else:
        print("Failed to fetch movie details.")

    matched_movies = match_movie_to_streaming(["Amazon Prime Video", "Netflix"], list_of_movies)

    if matched_movies:
        print("\n✅ Matched Movies Test Passed!")
        for movie in matched_movies:
            print(f"Movie: {movie['movie']}, ID: {movie['movie_id']}, Streaming Service: {movie['streaming_service']}")
    else:
        print("\n❌ No movies matched streaming services.")

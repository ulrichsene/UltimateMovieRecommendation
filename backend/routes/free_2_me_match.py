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
    """Match movies from the list to their available streaming services."""
    three_movies = []
    added_movies = set()  # To track movies that have already been added

    for film in movie_list:
        # Skip movies that have already been added
        if film in added_movies:
            continue

        search_url = f"{base_url}/search/movie?api_key={tmdb_api_key}&query={film}&language=en-US"
        response = requests.get(search_url)

        if response.status_code == 200:
            search_results = response.json().get("results", [])
            if search_results:
                movie_id = search_results[0]["id"]
                services = get_free_streaming_services(movie_id)

                # Access the 'streaming' key from the returned dictionary
                available_streaming = services.get("streaming", [])

                # Check if any of the streaming services exactly match
                for provider in available_streaming:
                    if provider in streaming_services:
                        three_movies.append({
                            "movie": film,
                            "streaming_service": provider
                        })
                        added_movies.add(film)  # Mark movie as added
                        if len(three_movies) >= 3:
                            return three_movies  # Return first 3 matching movies
            else:
                print(f"Movie '{film}' not found.")
        else:
            print(f"Failed to search for movie '{film}': {response.status_code}")

    # If less than 3 movies found, return an error
    if len(three_movies) < 3:
        print("Movies found...: ", three_movies)
        print("Error: Could not find 3 matching movies.")
        return None

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

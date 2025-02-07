import requests # allows us to make API calls
import json # saves data in a structured format

# tmdb api info here
tmdb_api_key = "9783354ee4a285168b36af0283b59f02"
base_url = "https://api.themoviedb.org/3"

def get_movies(max_pages=1): # can limit to how many pages of movies (1 page = 20 movies)
    """This function retrieves movies"""
    movies = [] # stores the movie data

    for page in range(1, max_pages + 1): # loop through pages
        url = f"{base_url}/discover/movie?api_key={tmdb_api_key}&language=en-US&page={page}"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json().get("results", [])
            for movie in data: # loop through the movies and extract the movie id, title, release date
                movies.append({
                    "id": movie["id"],
                    "title": movie["title"],
                    "release_date": movie.get("release_date", "Unknown")
                })
        else:
            print(f"Failed to fetch page {page}: {response.status_code}")
            break

    return movies # returns list of movies

def get_streaming_services(movie_id):
    """Fetch available streaming services for a given movie, including rent and buy options."""
    url = f"{base_url}/movie/{movie_id}/watch/providers?api_key={tmdb_api_key}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json().get("results", {})
        us_data = data.get("US", {})

        # this will show if a movie is free, rent, or need to buy
        streaming_services = [s["provider_name"] for s in us_data.get("flatrate", [])]
        rental_services = [s["provider_name"] for s in us_data.get("rent", [])]
        purchase_services = [s["provider_name"] for s in us_data.get("buy", [])]

        return {
            "streaming": streaming_services if streaming_services else ["Not Available"],
            "rent": rental_services if rental_services else ["Not Available"],
            "buy": purchase_services if purchase_services else ["Not Available"]
        }
    else:
        print(f"Failed to fetch streaming services for movie ID {movie_id}: {response.status_code}")
        return {"streaming": ["Error"], "rent": ["Error"], "buy": ["Error"]}


def fetch_movies_and_providers():
    """Fetch movies and their streaming platforms, then save to a JSON file."""
    movies = get_movies(max_pages=1) # calls get_movies to fetch movies
    movie_list = [] # this will store final movie data

    for movie in movies: # loop through each movie, gets streaming services, and adds them to the dictionary
        services = get_streaming_services(movie["id"])
        movie["streaming_services"] = services  # adds streaming services to movie data
        movie_list.append(movie)

    # save to a JSON file
    with open("tmdb_movies_with_streaming.json", "w") as outfile:
        json.dump(movie_list, outfile, indent=4)

    print(f"Saved {len(movie_list)} movies to tmdb_movies_with_streaming.json")

if __name__ == "__main__":
    fetch_movies_and_providers()


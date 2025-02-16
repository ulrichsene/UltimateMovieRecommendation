import requests # allows us to make API calls
import json # saves data in a structured format

# tmdb api info here
tmdb_api_key = "9783354ee4a285168b36af0283b59f02"
base_url = "https://api.themoviedb.org/3"

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

def single_movie_stream(movie):
    """ Accepts a movie title (or id num??) and returns a list of streaming options:
    Free streaming, rent, buy. """
    search_url = f"{base_url}/search/movie?api_key={tmdb_api_key}&query={movie}&language=en-US"
    response = requests.get(search_url)

    if response.status_code == 200:
        search_results = response.json().get("results", [])
        if search_results:
            movie_id = search_results[0]["id"]
            return get_streaming_services(movie_id)
        else:
            print("Movie not found.")
            return None
    else:
        print(f"Failed to search for movie: {response.status_code}")
        return None

if __name__ == "__main__":
    movie_title = "Inception"
    streaming_options = single_movie_stream(movie_title)
    if streaming_options:
        print(f"Streaming options for {movie_title}: {streaming_options}")

import requests
import json # allows us to parse API responses and save results to a json file

# declare the key and starting point for all api calls here (global)
api_key = "C9jD5sQKfD7UMfht2vFXmTIdJKzZHzJkV0TmsiDn"
base_url = "https://api.watchmode.com/v1"

def get_movies(limit=25):
    """This function fetches a list of movies from Watchmode API."""
    url = f"{base_url}/list-titles/?apiKey={api_key}&limit={limit}"
    # this url is basically built using the base url with the list-titles endpoint, the api key, and only wanted 5 to be returned (parameter)
    response = requests.get(url) # sends get request to watchmode api to retrieve the movie data

    if response.status_code == 200: # means response was successful
        movies = response.json().get("titles", [])
        if movies:
            return movies  # Returns the list of movies
    print(f"Failed to fetch movies: {response.status_code}")
    return [] # if movies are not found, returns empty list

def get_streaming_services(movie_id):
    """This function fetches the streaming platforms for a given movie based on its movie_id."""
    url = f"{base_url}/title/{movie_id}/sources/?apiKey={api_key}"
    # this url is built in a similar way but passes in a specific movie id
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        us_platforms = [ # for each platform it collects the name, price to rent/buy, direct url to watch
            {
                "name": service["name"], 
                "price": service["price"],
                "web_url": service["web_url"]
            }
            for service in data if service.get("region") == "US" # makes sure that it only includes platforms available in the US
        ]
        return us_platforms
    else:
        print(f"Failed to fetch streaming sources for {movie_id}: {response.status_code}")
        return []

def fetch_movies_with_platforms():
    """This function fetches multiple (5 in this case) movies, retrieves their streaming platforms, and saves to a json file."""
    movies = get_movies(limit=25)  # calls the get_movies function to fetch 5 movie -> results in a list of movie objects
    movie_list = []

    for movie in movies: # function loops through each movie in movie list and gets the id and calls the get_streaming service function to get platforms
        movie_id = movie["id"]
        platforms = get_streaming_services(movie_id)

        movie_data = { # for each movie, creates a dictionary containing relevant information
            "id": movie_id,
            "title": movie["title"],
            "platforms": platforms
        }
        movie_list.append(movie_data)  

    # saves all movie data to a JSON file
    with open("movies_data.json", "w") as outfile:
        json.dump(movie_list, outfile, indent=4)

    print("All movie data saved to movies_data.json")

if __name__ == "__main__":
    fetch_movies_with_platforms()

# note: this code just outputs one movie with the following information (found on movies_data.json)
# id, title, platforms available, price, web_url (direct link to watch)

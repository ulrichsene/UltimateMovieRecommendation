import requests
import json

api_key = "C9jD5sQKfD7UMfht2vFXmTIdJKzZHzJkV0TmsiDn"
api_url = f"https://api.watchmode.com/v1/list-titles/?apiKey={api_key}"

def get_all_movies():
    response = requests.get(api_url)

    print("Status Code:", response.status_code)
    print("Response Text:", response.text[:500])  
    if response.status_code == 200:
        try:
            data = response.json()

            if "titles" in data:
                movie_titles = data["titles"]

                # view a sample of the data from the API
                print("Sample Movie Titles:", [movie["title"] for movie in movie_titles[:5]])

                # saves the movie info to a json file
                with open("all_movies.json", "w") as file:
                    json.dump(movie_titles, file, indent=4)

            else:
                print("Unexpected response format:", data)

        except json.JSONDecodeError:
            print("Error: Response is not valid JSON")
    else:
        print(f"Failed to fetch movies: {response.status_code} - {response.text}")

if __name__ == "__main__":
    get_all_movies()


# basic output
#  {
#   "id": 3217677,
#   "title": "Paradise",
#   "year": 2025,
#   "imdb_id": "tt27444205",
#   "tmdb_id": 245927,
#   "tmdb_type": "tv",
#   "type": "tv_series"
# }

# see is a list of titles available, but does not show streaming platform info (like Netflix, Hulu, etc.)
# i think what we need to do is use the title details endpoint which has more info
# think we can modify the script to make a second request for each movie/TV series to get streaming platform info.
# Fetches movie titles from the list-titles endpoint.
# For each movie, it makes a request to the title/{title_id}/details/ endpoint to fetch streaming platforms.
# Prints out the platforms available for each movie.


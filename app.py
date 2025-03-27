import os
import json
from flask import Flask, request, jsonify, render_template
from jinja2 import FileSystemLoader, Environment
from backend.models.algorithm_work import get_similar_movies, match_movie_to_streaming
from backend.routes.movie_stream_options import single_movie_stream
from dotenv import load_dotenv
import utils

def create_app():
    app = Flask(__name__)
    # server=app.server
    return app
app = create_app()

# load environmental variables (like tmdb key) from the .env file
load_dotenv()

# get the API key from the environment
tmdb_api_key = os.getenv('TMDB_API_KEY')

# set up the Jinja2 template loader explicitly
template_folder_path = os.path.join(os.getcwd(), 'templates')
app.jinja_env.loader = FileSystemLoader(template_folder_path)

# note: for autocomplete -- load the movie titles into memory once the app starts (so don't need to reload everytime)
MOVIES_FILE_PATH = os.path.join(os.getcwd(), 'backend', 'input_data', 'movies.json')

with open(MOVIES_FILE_PATH, 'r', encoding = 'utf-8') as file:
    movie_titles = json.load(file) # read movie_list and store it as a list

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/createUser')
def create_user():
    return render_template('createUser.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/initializeUser')
def initialize_user():
    return render_template('initializeUser.html')

@app.route('/save_preferences', methods=['POST'])
def save_preferences():
    """Store user's streaming preferences in Firestore."""
    print("Saving preferences...")
    data = request.json
    user_id = data.get('user_id')
    services = data.get('services', [])
    
    if not user_id:
        print("Error: Missing user_id")
        return jsonify({'error': 'User ID is required'}), 400

    db = utils.init_firestore_client()
    
    try:
        db.collection('users').document(user_id).set({'services': services}, merge=True)
        print(f"Preferences saved for user: {user_id}, services: {services}")
        return jsonify({"message": "Preferences saved successfully"})
    except Exception as e:
        print(f"Error saving preferences: {str(e)}")
        return jsonify({'error': 'Failed to save preferences'}), 500


@app.route('/get_similar_movies', methods=['POST'])
def get_movie_recs():
    movie_title = request.json.get('movie_title')

    if not movie_title:
        return jsonify({'error': 'No movie title provided'}), 400

    recommendations = get_similar_movies(movie_title)

    if not recommendations:
        return jsonify({'recommendations': [], 'scores': []})

    movie_titles = [movie[0] for movie in recommendations]
    movie_scores = [movie[1] for movie in recommendations]

    return jsonify({
        'recommendations': movie_titles,
        'scores': movie_scores
    })

@app.route('/get_streaming_info', methods=['POST'])
def get_streaming_info():
    movie_title = request.json.get('movie_title')
    print("Received movie title:", movie_title)  #debug statement

    if not movie_title:
        print("Error: No movie title provided")  #debug statement
        return jsonify({'error': 'No movie title provided'}), 400

    streaming_services = single_movie_stream(movie_title)
    print("Streaming services:", streaming_services)  #debug statement

    if not streaming_services:
        print("Error: Streaming information not found")  #debug statement
        return jsonify({'error': 'Streaming information not found'}), 404

    return jsonify({'streaming_services': streaming_services})

@app.route('/get_movie_recommendations', methods=['POST'])
def get_movie_recommendations():
    data = request.json
    print("Received Data:", data)  # 🔍 Debugging step

    streaming_services = data.get("services", [])
    print("Streaming services: ", streaming_services)
    movie_title = data.get("movie_title", "")

    if not movie_title:
        return jsonify({"error": "Movie title is required"}), 400

    similar_movies = get_similar_movies(movie_title, top_n=50)
    if not similar_movies:
        return jsonify({"error": "No similar movies found"}), 400

    recommended_movies = match_movie_to_streaming(streaming_services, similar_movies)

    if recommended_movies:
        return jsonify(recommended_movies)
    else:
        return jsonify({"error": "No movies found matching your services"}), 400

# NEW AUTOCOMPLETE ROUTE
@app.route('/autocomplete', methods = ['GET'])
def autocomplete():
    """This returns movie titles that matches the user's input"""

    query = request.args.get('query', '').lower()

    if not query:
        return jsonify([])
    
    # here we filter movie titles that start with the input query
    matches = [] # will eventually store matching movie titles
    for title in movie_titles:
        if title.lower().startswith(query): # converts current title to lowercase and match only titles that start with the query
            matches.append(title)
    matches = matches[:10] # get first 10 results
    return jsonify(matches)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5002))
    app.run(host='0.0.0.0', port=port, debug=True)

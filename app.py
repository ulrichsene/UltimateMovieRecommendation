import os
import json
from flask import Flask, request, jsonify, render_template
from jinja2 import FileSystemLoader, Environment
from backend.models.algorithm_work import get_similar_movies
import utils

app = Flask(__name__)

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
    data = request.json
    user_id = data.get('user_id')
    services = data.get('services', [])
    print(f'received data: {data}')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    db = utils.init_firestore_client()
    db.collection('users').document(user_id).set({'services': services}, merge=True)

    return jsonify({data})


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
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
import os
from flask import Flask, request, jsonify, render_template, send_from_directory
from algorithm_work import get_similar_movies

# Set the folder for static files to be served
app = Flask(__name__, static_folder='public', template_folder='templates')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/get_similar_movies', methods=['POST'])
def get_movie_recs():
    # Get the movie title from the request
    movie_title = request.json.get('movie_title')

    # Get recommendations based on the movie title
    recommendations = get_similar_movies(movie_title)

    # Extract movie titles and scores separately
    movie_titles = [movie[0] for movie in recommendations]
    movie_scores = [movie[1] for movie in recommendations]

    # Return both titles and scores in a format that your JavaScript can process
    return jsonify({
        'recommendations': movie_titles,
        'scores': movie_scores
    })

# Serve the static files (JS, CSS, etc.) from the public folder
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.join(app.root_path, 'public'), filename)

if __name__ == '__main__':
    app.run(debug=True)


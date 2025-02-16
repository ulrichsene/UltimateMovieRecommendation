# import the necessary libraries 
from flask import Flask, render_template, request, jsonify
from algorithm_work import find_movie_by_title, get_similar_movies

# this initializes and creates an instance of the flask app (main entry point for the web server)
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('home.html') # this is where we render the existing html form

@app.route('/get_similar_movies', methods = ['POST'])
def get_movies():
    movie_title = request.form['movie_title'] # this line fetches the value from the input field in form
    similar_movies, similar_movies_score = get_similar_movies(movie_title)

    reccomendations = []
    for i, (movie, score) in enumerate(zip(similar_movies, similar_movies_score)):
        rec = f"Recommendation #{i+1}: {movie}"
        reccomendations.append(rec)

    return jsonify(similar_movies)

if __name__ == '__main__':
    app.run(debug = True)
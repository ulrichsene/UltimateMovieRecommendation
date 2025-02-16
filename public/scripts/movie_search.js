
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("movie-form");
    const recommendationsList = document.getElementById("recommendations-list");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const movieTitle = document.getElementById("movie_title").value;
        console.log(movieTitle)

        fetch('/get-movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: movieTitle})
        });
        const data = await response.json();

    });
});
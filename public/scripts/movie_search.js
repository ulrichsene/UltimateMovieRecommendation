document.addEventListener("DOMContentLoaded", function () {
    console.log("message")
    const form = document.getElementById("movie-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const movieTitle = document.getElementById("movie_title").value;
        console.log(movieTitle)

        fetch("http://127.0.0.1:5000/get-movies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: movieTitle })
        })
            .then(response => response.json())
            .then(data => console.log(data));
    });
});
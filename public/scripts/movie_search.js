
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("movie-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const movieTitle = document.getElementById("movie_title").value;
        console.log(movieTitle)

        fetch("/get-movies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({data: movieTitle})
        })
        .then(response => response.json())
        .then(data => console.log(data));
    });
});
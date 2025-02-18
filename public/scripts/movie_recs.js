document.getElementById("get-recs-button").addEventListener("click", async function (event) {
    event.preventDefault(); // prevents the page from refreshing

    const movieTitle = document.getElementById("movie_title").value; // gets the movie title entered by the user

    // sends a POST request to Flask with the movie title
    const response = await fetch("/get_similar_movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_title: movieTitle })
    });

    const data = await response.json(); // parses the JSON response from Flask

    // finds the elements to display the recommendations
    const recommendationsHeading = document.getElementById("recommendations-heading");
    const recommendationsList = document.getElementById("recommendations-list");

    // Check if there are recommendations
    if (data.recommendations.length > 0) {
        recommendationsHeading.style.display = "block"; // Show recommendations heading
        recommendationsList.innerHTML = data.recommendations
            .map((movie, index) => {
                // Display movie with score
                return `<li>${movie} (Score: ${data.scores[index].toFixed(2)})</li>`;
            })
            .join(""); // Join the list items as a string
    } else {
        recommendationsHeading.style.display = "block"; // Show recommendations heading
        recommendationsList.innerHTML = "<li>No recommendations found.</li>";
    }
});

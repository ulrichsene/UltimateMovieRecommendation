document.getElementById("get-recs-button").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevents the page from refreshing

    const movieTitle = document.getElementById("movie_title").value.trim(); // Trim whitespace
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    try {
        const response = await fetch("/get_similar_movies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movie_title: movieTitle })
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        // Finds the elements to display the recommendations
        const recommendationsHeading = document.getElementById("recommendations-heading");
        const recommendationsList = document.getElementById("recommendations-list");

        // Check if there are recommendations
        if (data.recommendations && data.recommendations.length > 0) {
            recommendationsHeading.style.display = "block"; // Show recommendations heading
            recommendationsList.innerHTML = data.recommendations
                // .map((movie, index) => {
                //     return `<li>${movie} (Score: ${data.scores[index].toFixed(2)})</li>`;
                // })
                // .join(""); // Join the list items as a string
            data.recommendations.forEach(movieTitle, index => {
                const movieCard = document.createElement("div");
                movieCard.classList.add("movie-card");
                movieCard.innerHTML = `
                    <h3>${movieTitle}</h3>
                    <p>Similarity Score: ${data.scores[index].toFixed(2)}</p>
                `;
            });
        } else {
            recommendationsHeading.style.display = "block";
            recommendationsList.innerHTML = "<li>No recommendations found.</li>";
        }
    } catch (error) {
        console.error("Error fetching recommendations:", error);
    }
});

document.getElementById("get-streaming-info-button").addEventListener("click", async function (event) {
    console.log("Fetching streaming info...");
    event.preventDefault();

    document.getElementById("recommendations-list").innerHTML = ""; // clears recommendations list
    document.getElementById("buy-list").innerHTML = "";
    document.getElementById("rent-list").innerHTML = "";
    document.getElementById("stream-list").innerHTML = "";

    const movieTitle = document.getElementById("movie_title").value.trim();
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    try {
        const response = await fetch("/get_streaming_info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movie_title: movieTitle })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        // Show the streaming info container
        document.getElementById("streaming-info-container").style.display = "flex";

        // Populate each category
        document.getElementById("buy-list").innerHTML = data.streaming_services.buy
            ? data.streaming_services.buy.map(service => `<li>${service}</li>`).join("")
            : "<li>No services available for purchase.</li>";

        document.getElementById("rent-list").innerHTML = data.streaming_services.rent
            ? data.streaming_services.rent.map(service => `<li>${service}</li>`).join("")
            : "<li>No services available for rent.</li>";

        document.getElementById("stream-list").innerHTML = data.streaming_services.streaming
            ? data.streaming_services.streaming.map(service => `<li>${service}</li>`).join("")
            : "<li>No services available for streaming.</li>";
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch streaming information.");
    }
});

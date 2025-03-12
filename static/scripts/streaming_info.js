document.getElementById("get-streaming-info-button").addEventListener("click", async function (event) {
    event.preventDefault(); // prevents page refresh when button clicked

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
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        // finds the elements to display the streaming info (in home.html file)
        const streamingInfoHeading = document.getElementById("streaming-info-heading");
        const streamingInfoList = document.getElementById("streaming-info-list");

        // clears previous results
        streamingInfoList.innerHTML = "";

        if (data.streaming_services) {
            streamingInfoHeading.style.display = "block"; // shows heading
            streamingInfoList.innerHTML = Object.entries(data.streaming_services)
                .map(([category, services]) => {
                    return `<li><strong>${category}:</strong> ${services.join(", ")}</li>`;
                })
                .join(""); // formats the streaming info
        } else {
            streamingInfoHeading.style.display = "block";
            streamingInfoList.innerHTML = "<li>No streaming information found.</li>";
        }
    } catch (error) {
        console.error("Error fetching streaming info:", error);
        alert("An error occurred while fetching streaming information. Please try again later.");
    }
});

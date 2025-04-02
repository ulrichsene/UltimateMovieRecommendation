import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from './app.js';

const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;
let services = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        uid = user.uid;

        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            services = userDoc.data().services || [];
            console.log("✅ Loaded services from Firestore:", services);
        } else {
            console.log("⚠️ No preferences found in Firestore.");
            services = [];  // Clear services if no data found
        }
    } else {
        console.log("🚪 User signed out");
        uid = null;
        services = [];
    }
});

// function displayRecommendations(movies) {
//     const recommendationsList = document.getElementById("recommendations-list");
//     recommendationsList.innerHTML = ""; // Clear previous results

//     movies.forEach(movie => {
//         const movieBlock = document.createElement("li");
//         movieBlock.classList.add("movie-block"); // Apply the new styling
//         movieBlock.textContent = movie; // Replace with actual movie details if available
//         recommendationsList.appendChild(movieBlock);
//     });

//     document.getElementById("recommendations-heading").style.display = "block";
// }

// logic for making title of movie a clickable link
// takes one argument (name of movie we want to find a trailer for)
async function getTrailerLink(movieTitle) {
    const response = await fetch(`/get_trailer_link?movie_title=${encodeURIComponent(movieTitle)}`); // makes request to backend for link
    if (!response.ok) { // if response failed -> log an error
        console.error(`Error fetching trailer for ${movieTitle}`);
        return null;
    }

    const data = await response.json(); // extracts the response data as json
    return data.trailer_link || null;

}

async function displayMovies(movies) {
    const resultsContainer = document.getElementById("recommendations-list");

    if (!resultsContainer) {
        console.error("❌ Movie results container not found!");
        return;
    }

    resultsContainer.innerHTML = ""; // clears previous results

    if (movies.length === 0) {
        resultsContainer.innerHTML = "<p>No recommendations found.</p>";
        return;
    }

    // group movies by their title to combine streaming services
    const movieMap = new Map();

    for (const movie of movies) {
        const title = movie.movie || "Unknown Title";
        const service = movie.streaming_service || "No service available";

        // get trailer link dynamically
        const trailerLink = await getTrailerLink(title);

        if (!movieMap.has(title)) {
            movieMap.set(title, { services: [], trailerLink });
        }
        movieMap.get(title).services.push(service);
    }


    // display the grouped movies with their services
    movieMap.forEach(({ services, trailerLink }, title) => {
        const movieItem = document.createElement("li");
        movieItem.classList.add("movie-item");

        // fix: if there is no trailer, default to link to the tmdb page instead (so recs still displayed)
        const movieLink = trailerLink ? trailerLink : `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`;

        const uniqueServices = Array.from(new Set(services)).join(", ");  // Ensure no duplicate services
        // here is the logic for making the title a clickable link to trailer
        movieItem.innerHTML = `
        <a href="${movieLink}" target="_blank"><strong>${title}</strong></a><br>
        Available on: ${uniqueServices}
        `;

        resultsContainer.appendChild(movieItem);
    });
}

function formatServiceName(service) {
    return service
        .split(" ") // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(" "); // Join back into a single string
}

async function fetchMoviesForUser(movieTitle) {
    if (!uid) {
        alert("User not authenticated. Please log in.");
        return;
    }

    if (services.length === 0) {
        console.warn("🚨 No streaming services available!");
        return alert("Please select at least one streaming service.");
    }

    // 🔥 Convert lowercase services to proper format
    const formattedServices = services.map(formatServiceName);
    console.log("📤 Sending request with:", JSON.stringify({ services: formattedServices, movie_title: movieTitle }));

    try {
        const response = await fetch('/get_movie_recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ services: formattedServices, movie_title: movieTitle })
        });

        const result = await response.json();
        console.log("✅ Recommended Movies:", result);
        displayMovies(result);
    } catch (error) {
        console.error("❌ Error fetching movies:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const movieForm = document.getElementById('movie-form');
    if (movieForm) {
        movieForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const movieTitle = document.getElementById('movie_title').value.trim();

            if (!movieTitle) {
                alert("Please enter a movie title.");
                return;
            }

            console.log("🎬 Fetching recommendations for:", movieTitle);
            fetchMoviesForUser(movieTitle);  // ✅ Corrected: Pass only movieTitle here
        });
    } else {
        console.error("Form element 'movie-form' not found.");
    }
});

document.getElementById("get-recs-button").addEventListener("click", async function (event) {
    event.preventDefault();

    // this part directly clear both buttons before getting new recs (both buttons tied together)
    document.getElementById("recommendations-list").innerHTML = "";
    document.getElementById("streaming-info-list").innerHTML = "";

    document.getElementById("streaming-info-heading").style.display = "none"; // this hides the Streaming Availability heading

    const movieTitle = document.getElementById("movie_title").value.trim();
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    await fetchMoviesForUser(movieTitle);
});

// Add CSS styles dynamically
const style = document.createElement('style');
style.innerHTML = `
    .movie-item {
        background-color: black;
        color: white;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
    }
    #recommendations-list {
        list-style-type: none;
        padding: 0;
    }
`;
document.head.appendChild(style);
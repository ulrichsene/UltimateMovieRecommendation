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

function displayMovies(movies) {
    const resultsContainer = document.getElementById("recommendations-list");

    if (!resultsContainer) {
        console.error("❌ Movie results container not found!");
        return;
    }

    resultsContainer.innerHTML = ""; // Clear previous results

    if (movies.length === 0) {
        resultsContainer.innerHTML = "<p>No recommendations found.</p>";
        return;
    }

    // Group movies by their title to combine streaming services
    const movieMap = new Map();

    movies.forEach(movie => {
        const title = movie.movie || "Unknown Title";  // Title of the movie
        const service = movie.streaming_service || "No service available"; // Streaming service for the movie

        if (!movieMap.has(title)) {
            movieMap.set(title, []);
        }
        movieMap.get(title).push(service);
    });

    // Display the grouped movies with their services
    movieMap.forEach((services, title) => {
        const movieItem = document.createElement("li");
        movieItem.classList.add("movie-item");

        const uniqueServices = Array.from(new Set(services)).join(", ");  // Ensure no duplicate services
        movieItem.innerHTML = `<strong>${title}</strong><br>Available on: ${uniqueServices}`;
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

    const movieTitle = document.getElementById("movie_title").value.trim();
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    await fetchMoviesForUser(movieTitle);
});

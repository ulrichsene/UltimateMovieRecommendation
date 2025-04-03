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

    resultsContainer.innerHTML = ""; // Clear previous results

    if (movies.length === 0) {
        resultsContainer.innerHTML = "<p>No recommendations found.</p>";
        return;
    }

    // Group movies by title to combine streaming services
    const movieMap = new Map();

    for (const movie of movies) {
        const title = movie.movie || "Unknown Title"; 
        const service = movie.streaming_service || "No service available"; 
        const posterUrl = movie.poster_url || "static/images/image-not-found.jpg";
        const trailerLink = await getTrailerLink(title);
        
        if (!movieMap.has(title)) {
            movieMap.set(title, {
                services: [],
                poster: posterUrl,
                trailerLink: trailerLink
            });
        }
        movieMap.get(title).services.push(service);
    }

    // Ensure there's a container to append movie cards
    const moviesContainer = document.createElement("div");
    moviesContainer.id = "movies-container";
    resultsContainer.appendChild(moviesContainer);

    // Display the grouped movies with their services
    movieMap.forEach((movieData, title) => {
        const movieItem = document.createElement("div");
        movieItem.classList.add("movie-card");
        const uniqueServices = Array.from(new Set(movieData.services)).join(", "); 
        
        // Default to TMDB search page if no trailer is available
        const movieLink = movieData.trailerLink ? movieData.trailerLink : `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`;

        // Movie card content
        movieItem.innerHTML = `
            <div class="movie-poster-container">
                <a href="${movieLink}" target="_blank">
                    <img src="${movieData.poster}" alt="${title} poster" class="movie-poster">
                </a>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">
                    <a href="${movieLink}" target="_blank">${title}</a>
                </h3>
                <p class="streaming-service">Available on: ${uniqueServices}</p>
            </div>
        `;

        // Append to movies container
        moviesContainer.appendChild(movieItem);
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
            fetchMoviesForUser(movieTitle);
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

const style = document.createElement('style');
style.innerHTML = `
    #recommendations-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: flex-start;
        gap: 20px;
        padding: 20px;
        list-style-type: none;
    }
    
    .movie-card {
        width: 220px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
        background-color: #000;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .movie-card:hover {
        transform: translateY(-5px);
    }
    
    .movie-poster-container {
        width: 100%;
        height: 330px;
        overflow: hidden;
    }
    
    .movie-poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .movie-card:hover .movie-poster {
        transform: scale(1.05);
    }
    
    .movie-info {
        width: 100%;
        text-align: center;
        padding: 15px;
    }
    
    .movie-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
    }
    
    .streaming-service {
        font-size: 14px;
        color: #ccc;
    }
`;
document.head.appendChild(style);

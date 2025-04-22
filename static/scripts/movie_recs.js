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

async function fetchMovieDetails(movieId, movieTitle) {
    console.log("Fetching details for Movie ID:", movieId);
    try {
        const response = await fetch(`/get_movie_details?movie_id=${movieId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch movie details for movie ID: ${movieId}`);
        }

        const movieDetails = await response.json();
        console.log("Movie Details fetched successfully:", movieDetails);
        console.log(movieDetails);

        alert(`
            Title: ${movieTitle || "N/A"}
            Plot Summary: ${movieDetails['Plot Summary'] || "N/A"}
            IMDb Rating: ${movieDetails['IMDb Rating'] || "N/A"}
            Director: ${movieDetails['Director'] || "N/A"}
            Top Cast: ${movieDetails['Top Cast'] ? movieDetails['Top Cast'].join(", ") : "N/A"}
        `);
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
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

    // groups movies by title to combine streaming services
    const movieMap = new Map();

    for (const movie of movies) {
        const title = movie.movie || "Unknown Title";
        console.log("Movie Object:", movie); // debuggin the incoming data
        console.log(`🎬 Processing movie "${title}" with ID: ${movie.movie_id || 'N/A'}`);

        const service = movie.streaming_service || "No service available";
        const posterUrl = movie.poster_url || "static/images/image-not-found.jpg";
        const trailerLink = await getTrailerLink(title);

        if (!movieMap.has(title)) {
            movieMap.set(title, {
                services: [],
                poster: posterUrl,
                trailerLink: trailerLink,
                movieId: movie.movie_id || "undefined"
            });
        }
        movieMap.get(title).services.push(service);
    }

    // makes sure there's a container to append movie cards
    const moviesContainer = document.createElement("div");
    moviesContainer.id = "movies-container";
    resultsContainer.appendChild(moviesContainer);

    // displays the grouped movies with their services
    movieMap.forEach((movieData, title) => {
        console.log("Movie Data for:", title, movieData);

        const movieItem = document.createElement("div");
        movieItem.classList.add("movie-card");
        const uniqueServices = Array.from(new Set(movieData.services)).join(", ");

        // default to TMDB search page if no trailer is available
        const movieLink = movieData.trailerLink ? movieData.trailerLink : `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`;

        // movie card content
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

        // here we can create a "find out more" button when the movies are displayed
        const findOutMoreButton = document.createElement("button");
        findOutMoreButton.textContent = "Find Out More";
        findOutMoreButton.classList.add("find-out-more-button");

        findOutMoreButton.addEventListener("click", () => {
            console.log("Movie ID passed to fetchMovieDetails:", movieData.movieId);
            fetchMovieDetails(movieData.movieId, title);
        });

        movieItem.appendChild(findOutMoreButton);

        // append to movies container
        moviesContainer.appendChild(movieItem);

    });
}

const properServiceNames = {
    "fubotv": "fuboTV",
    "appletv+": "AppleTV+",
    "mubi": "MUBI",
    "peacock premium": "Peacock Premium",
    "philo": "Philo",
    "hulu": "Hulu",
    "amazon prime video": "Amazon Prime Video",
    "disney+": "Disney+",
    "netflix": "Netflix",
    "paramount+": "Paramount+",
    "youtube": "YouTube",
    "plex": "Plex",
    "max": "Max",
    "starz": "Starz",
    "amc+": "AMC+"
};

function formatServiceName(service) {
    const key = service.toLowerCase();
    if (key in properServiceNames) {
        return properServiceNames[key];
    }
    // fallback: capitalize each word
    return service
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
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

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'flex';
    
    // Hide any previous results while loading
    document.getElementById('recommendations-heading').style.display = 'none';
    document.getElementById('recommendations-list').innerHTML = '';

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
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Display the results
        displayMovies(result);
    } catch (error) {
        console.error("❌ Error fetching movies:", error);
        
        // Hide loading indicator even if there's an error
        loadingIndicator.style.display = 'none';
        
        // Show error message
        const resultsContainer = document.getElementById("recommendations-list");
        resultsContainer.innerHTML = "<p>Sorry, there was an error getting recommendations.</p>";
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

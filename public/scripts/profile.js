import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase Auth
const auth = getAuth();

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("user-email").textContent = user.email;

        // Load stored streaming preferences
        const preferences = JSON.parse(localStorage.getItem("streamingPreferences")) || [];
        const listElement = document.getElementById("streaming-list");
        listElement.innerHTML = preferences.length ? preferences.map(service => `<li>${service}</li>`).join('') : "<li>No preferences selected</li>";
    } else {
        // Redirect to login if not logged in
        window.location.href = "login.html";
    }
});

// Logout Functionality
document.getElementById("logout").addEventListener("click", async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("streamingPreferences"); // Clear local data
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

// Edit Preferences (Redirect to initializeUser.html)
document.getElementById("edit-preferences").addEventListener("click", () => {
    window.location.href = "initializeUser.html";
});

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();
const userEmailElement = document.getElementById("user-email");
const logoutButton = document.getElementById("logout-button");

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Display user email
        userEmailElement.textContent = `Logged in as: ${user.email}`;
    } else {
        // Redirect to login page if not authenticated
        window.location.href = "login.html";
    }
});

// Logout Functionality
logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html"; // Redirect to login page after logout
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
});

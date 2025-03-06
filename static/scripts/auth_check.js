import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your web app's Firebase configuration
const app = initializeApp({
    apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
    authDomain: "free2memovies.firebaseapp.com",
    projectId: "free2memovies",
    storageBucket: "free2memovies.firebasestorage.app",
    messagingSenderId: "496384632960",
    appId: "1:496384632960:web:592102ff928d855fb5de65",
    measurementId: "G-Y9DXZB6P2W"
  });
  
const auth = getAuth(app);
const userEmailElement = document.getElementById("user-email");
const logoutButton = document.getElementById("logout-button");

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Display user email
        userEmailElement.textContent = `Logged in as: ${user.email}`;
    } else {
        // Redirect to login page if not authenticated
        window.location.href = "/";
    }
});

// Logout Functionality
logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "/"; // Redirect to login page after logout
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
});

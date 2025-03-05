import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';

// Firebase configuration
const firebaseConfig = ({
    apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
    authDomain: "free2memovies.firebaseapp.com",
    projectId: "free2memovies",
    storageBucket: "free2memovies.firebasestorage.app",
    messagingSenderId: "496384632960",
    appId: "1:496384632960:web:592102ff928d855fb5de65",
    measurementId: "G-Y9DXZB6P2W"
  });

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("user-email").innerHTML = user.email;
        const services = user.services;

        console.log('email:', user.email);
        console.log('services:', services);
        // Load stored streaming preferences
        const preferences = JSON.parse(localStorage.getItem("streamingPreferences")) || [];
        const listElement = document.getElementById("streaming-list");
        listElement.innerHTML = preferences.length ? preferences.map(service => `<li>${service}</li>`).join('') : "<li>No preferences selected</li>";
    } else {
        // Redirect to login if not logged in
        window.location.href = "index.html";
    }
});

let uid = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      // Use the UID
      console.log("UID:", uid);
    } else {
      // User is signed out
      console.log("User is signed out");
    }
  });

// Logout Functionality
document.getElementById("logout").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

// Edit Preferences (Redirect to initializeUser.html)
document.getElementById("edit-preferences").addEventListener("click", () => {
    window.location.href = "initializeUser.html";
});

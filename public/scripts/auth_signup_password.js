import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
    authDomain: "https://free2memovies.firebaseapp.com/",
    projectId: "free2memovies",
    storageBucket: "free2memovies.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "1:496384632960:web:592102ff928d855fb5de65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle Signup Form Submission
document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("signup-error-message");

    // Check if passwords match
    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        return;
    }

    // Create User in Firebase
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "welcome.html"; // Redirect to welcome page
        })
        .catch((error) => {
            errorMessage.textContent = "Error: " + error.message;
        });
});

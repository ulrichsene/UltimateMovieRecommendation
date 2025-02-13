// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
  authDomain: "free2memovies.firebaseapp.com",
  projectId: "free2memovies",
  storageBucket: "free2memovies.firebasestorage.app",
  messagingSenderId: "496384632960",
  appId: "1:496384632960:web:592102ff928d855fb5de65",
  measurementId: "G-Y9DXZB6P2W"
};

// Initialize Firebase
const auth = getAuth();
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

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

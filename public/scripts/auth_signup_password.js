// ✅ Import Firebase SDK (Use correct paths for modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js"; // Corrected import
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
  authDomain: "free2memovies.firebaseapp.com",
  projectId: "free2memovies",
  storageBucket: "free2memovies.firebasestorage.app",
  messagingSenderId: "496384632960",
  appId: "1:496384632960:web:592102ff928d855fb5de65",
  measurementId: "G-Y9DXZB6P2W"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// ✅ Handle Signup Form Submission
document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMessage = document.getElementById("signup-error-message");

    errorMessage.textContent = ""; // Clear previous errors

    // ✅ Validate input fields
    if (!email || !password || !confirmPassword) {
        errorMessage.textContent = "All fields are required!";
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        errorMessage.textContent = "Please enter a valid email address.";
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = "Password must be at least 6 characters long.";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ User created:", userCredential.user);
        window.location.href = "home.html"; // Redirect to welcome page
    } catch (error) {
        console.error("❌ Signup Error:", error.message);
        errorMessage.textContent = "Error: " + error.message;
    }
});

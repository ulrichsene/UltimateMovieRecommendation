import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = ""; // Clear any previous errors

    // ✅ **Simple Validation**
    if (!email || !password) {
        errorMessage.textContent = "Email and password are required.";
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        errorMessage.textContent = "Please enter a valid email address.";
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        window.location.href = "home.html"; // Redirect on success
    } catch (error) {
        console.error("Login Error:", error.message);
        errorMessage.textContent = "Error: " + error.message;
    }
});

// Handle Google Sign-In
document.getElementById("google-signin-btn").addEventListener("click", function() {
  signInWithPopup(auth, provider)
      .then(() => {
          window.location.href = "../../home.html"; // Redirect to home page
      })
      .catch((error) => {
          console.error("Google Sign-In Error:", error);
      });
});

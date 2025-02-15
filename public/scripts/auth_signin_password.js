import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// Handle regular email/password login
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "home.html"; // Redirect to home page
        })
        .catch((error) => {
            document.getElementById("error-message").textContent = "Error: " + error.message;
        });
});

// Handle Google Sign-In
document.getElementById("google-signin-btn").addEventListener("click", function() {
    signInWithPopup(auth, provider)
        .then(() => {
            window.location.href = "home.html"; // Redirect to home page
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
        });
});


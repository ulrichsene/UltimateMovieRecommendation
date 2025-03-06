import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { app } from "./app.js";

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
        window.location.href = "/home"; // Redirect on success
    } catch (error) {
        console.error("Login Error:", error.message);
        errorMessage.textContent = "Error: " + error.message;
        // document.getElementById('invalid-credentials').innerHTML = "Invalid credentials"; // TODO
    }
});

// Handle Google Sign-In
document.getElementById("google-signin-btn").addEventListener("click", function () {
    signInWithPopup(auth, provider)
        .then(() => {
            window.location.href = "../../home"; // Redirect to home page
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
        });
});

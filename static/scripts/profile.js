import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { app } from './app.js';

// // Initialize Firebase Auth
const auth = getAuth(app);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("user-email").innerHTML = user.email;
        const services = user.services;

        console.log('email:', user.email);
        console.log('services:', services);
        } else {
        // Redirect to login if not logged in
        window.location.href = "/";
    }
});

let uid = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      // Use the UID
    } else {
      // User is signed out
      console.log("User is signed out");
    }
  });

// Logout Functionality
document.getElementById("logout").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "/";
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

// Edit Services (Redirect to initializeUser)
document.getElementById("edit-services").addEventListener("click", () => {
    window.location.href = "/initializeUser";
});

import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from './app.js';

// Initialize Firebase Auth
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const servicesList = document.getElementById('services-list');
const userEmailElem = document.getElementById("user-email");

// Store UID and services globally
let uid = null;
let services = [];

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        uid = user.uid;
        userEmailElem.innerHTML = user.email;

        console.log('Email:', user.email);
        
        // Fetch services from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // If services exist in Firestore, load them
            services = userDoc.data().services || [];
            console.log("✅ Loaded services from Firestore:", services);

            // Display services
            displayServices(services);
        } else {
            console.log("⚠️ No preferences found in Firestore.");
            services = [];  // Clear services if no data found
            displayNoServices();
        }
    } else {
        // User is not logged in, redirect to login page
        console.log("🚪 User signed out");
        uid = null;
        services = [];
        window.location.href = "/";  // Redirect to the login page
    }
});

// Function to display the list of services in the profile
function displayServices(services) {
    servicesList.innerHTML = ''; // Clear previous list

    if (services.length > 0) {
        services.forEach(service => {
            const li = document.createElement('li');
            li.textContent = service;
            servicesList.appendChild(li);
        });
    } else {
        displayNoServices();
    }
}

// Function to display a message when no services are available
function displayNoServices() {
    servicesList.innerHTML = '<li>No streaming services available</li>';
}

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

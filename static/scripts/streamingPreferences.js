import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from './app.js';

const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;
let services = [];

// Wait for auth state change to ensure the user is signed in before loading preferences
onAuthStateChanged(auth, async (user) => {
    if (user) {
        uid = user.uid;
        
        const userDocRef = doc(db, "users", uid);
        try {
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                services = userDoc.data().services || [];
                console.log("✅ Loaded services from Firestore:", services);
            } else {
                console.log("⚠️ No preferences found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching user preferences from Firestore:", error);
        }
    } else {
        console.log("User is signed out");
        services = []; // Reset services if the user is signed out
    }
});

// Get the streaming form, add event listener for the submit button
document.getElementById('streaming-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!uid) {
        console.error("User ID is missing, authentication might have failed.");
        alert("User not logged in. Please refresh and try again.");
        return;
    }

    // Collect selected services
    const selectedServices = [...document.querySelectorAll('input[name="services"]:checked')].map(checkbox => checkbox.value);

    if (selectedServices.length === 0) {
        alert("Please select at least one streaming service.");
        return;
    }

    try {
        const response = await fetch('/save_preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uid, services: selectedServices })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = "/home"; // Redirect to home after saving preferences
        } else {
            alert("Error saving preferences: " + result.message);
        }
    } catch (error) {
        console.error("Error saving preferences:", error);
        alert("An error occurred while saving preferences. Please try again.");
    }
});

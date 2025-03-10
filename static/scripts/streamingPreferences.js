import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { app } from './app.js';

const auth = getAuth(app);
let uid = null;
let services = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      services = user.services; // streaming services
      console.log('services:', services);
      // Use the UID
    } else {
      // User is signed out
      console.log("User is signed out");
    }
  });

// get the streaming form, add event listener for the submit button
document.getElementById('streaming-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const services = [...document.querySelectorAll('input[name="services"]:checked')].map(checkbox => checkbox.value);

    console.log("services:", services)

    try {
        const response = await fetch('/save_preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uid, services: services })
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error saving preferences:", error);
    }
});

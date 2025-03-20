import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from './app.js';

const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;
let services = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        uid = user.uid;
        
        // ✅ Fetch user preferences from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            services = userDoc.data().services || [];
        } else {
            console.log("No preferences found.");
        }

        console.log("User services:", services);
    } else {
        console.log("User is signed out");
    }
});

// get the streaming form, add event listener for the submit button
document.getElementById('streaming-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!uid) {
      console.error("User ID is missing, authentication might have failed.");
      alert("User not logged in. Please refresh and try again.");
      return;
  }

  const selectedServices = [...document.querySelectorAll('input[name="services"]:checked')].map(checkbox => checkbox.value);

  try {
      const response = await fetch('/save_preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: uid, services: selectedServices })
      });

      const result = await response.json();
      alert(result.message);
  } catch (error) {
      console.error("Error saving preferences:", error);
  }
});

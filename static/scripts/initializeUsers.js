import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from './app.js';

const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Wait for User Authentication
onAuthStateChanged(auth, async (user) => {
  if (user) {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // ✅ Only redirect if streaming preferences exist
      if (userData.services && userData.services.length > 0) {
        console.log("🔄 User already set preferences, redirecting...");
      } else {
        console.log("🛑 No preferences found. User stays on initializeUser");
      }
    } else {
      console.log("⚠️ No user data found, creating new document...");

      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email
      });
    }

  } else {
    console.error("❌ No user is signed in.");
  }
});

function populateStreamingServices() {
  //     const container = document.getElementById("services-list");
  //     if (!servicesList) {
  //         console.error("Element #services-list not found!");
  //         return;
  //     }
  //     container.innerHTML = ""; // Clear existing content
  
  //     availableServices.forEach(service => {
  //         const listItem = document.createElement("li");
  //         const checkbox = document.createElement("input");
  //         checkbox.type = "checkbox";
  //         checkbox.name = "services";
  //         checkbox.value = service;
          
  //         // Pre-check if the user has this service saved
  //         if (services.includes(service)) {
  //             checkbox.checked = true;
  //         }
  
  //         const label = document.createElement("label");
  //         label.appendChild(checkbox);
  //         label.appendChild(document.createTextNode(service));
  
  //         listItem.appendChild(label);
  //         container.appendChild(listItem);
      // });
      let checkboxes = document.getElementById("streaming-form");
      console.log('checkboxes:', checkboxes);
  }

  populateStreamingServices();

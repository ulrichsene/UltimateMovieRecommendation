// import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// import { app } from "./firebaseConfig.js"; // Import Firebase instance

// const auth = getAuth(app);
// const db = getFirestore(app);

// document.getElementById("streaming-form").addEventListener("submit", async function (event) {
//     event.preventDefault();

//     const checkboxes = document.querySelectorAll('input[name="services"]:checked');
//     const selectedServices = Array.from(checkboxes).map(cb => cb.value);

//     const user = auth.currentUser; // Get the currently signed-in user

//     if (user) {
//         try {
//             const userRef = doc(db, "users", user.uid);

//             // Overwrite existing preferences with new selection
//             await updateDoc(userRef, {
//                 streamingPreferences: selectedServices 
//             });

//             console.log("✅ Streaming preferences updated:", selectedServices);

//             // ✅ Redirect to home.html **only after preferences are saved**
//             window.location.href = "home.html"; 
//         } catch (error) {
//             console.error("❌ Error updating preferences:", error.message);
//         }
//     } else {
//         console.error("❌ No user is signed in.");
//     }
// });

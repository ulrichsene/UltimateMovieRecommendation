import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from './app.js';

const auth = getAuth(app);
const db = getFirestore(app);

let services = [];
let userSnap = null;
let userData = null;
let userDoc = null;

// ✅ Wait for User Authentication
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    userSnap = await getDoc(userRef);
    console.log('usersnap:', userSnap);

    if (userSnap.exists()) {
      userData = userSnap.data();

      if (userData.services && userData.services.length > 0) {
        console.log("🔄 User already set preferences, redirecting...");
      } else {
        console.log("🛑 No preferences found. User stays on initializeUser");
      }
    // ✅ Call populateStreamingServices() only after userSnap is set
    populateStreamingServices();
    } else {
      console.log("⚠️ No user data found, creating new document...");
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email
      });
    }

    
  } else {
    console.error("❌ No user is signed in.");
  }
});

async function populateStreamingServices(services) {
      let checkboxes = document.getElementById("streaming-form");
      console.log('checkboxes:', checkboxes);
      // get user's streaming services
      if (!userSnap || !userSnap.exists()) {
        console.error("User snapshot unavailable");
        return;
      }
      
      // get current user's services
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
          // If services exist in Firestore, load them
          services = userDoc.data().services;
          console.log('services:', services); 
      }

};
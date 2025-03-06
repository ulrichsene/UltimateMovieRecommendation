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

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
  authDomain: "free2memovies.firebaseapp.com",
  projectId: "free2memovies",
  storageBucket: "free2memovies.appspot.com",
  messagingSenderId: "496384632960",
  appId: "1:496384632960:web:592102ff928d855fb5de65",
  measurementId: "G-Y9DXZB6P2W"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
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
      if (userData.streamingPreferences && userData.streamingPreferences.length > 0) {
        console.log("🔄 User already set preferences, redirecting...");
        // window.location.href = "home.html";
      } else {
        console.log("🛑 No preferences found. User stays on initializeUser.html.");
      }
    } else {
      console.log("⚠️ No user data found, creating new document...");

      // ✅ Create new user document with `streamingPreferences`
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email
      });

      console.log("✅ New user document created in Firestore!");
    }

  } else {
    console.error("❌ No user is signed in.");
  }
});

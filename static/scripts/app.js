import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = ({
    apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
    authDomain: "free2memovies.firebaseapp.com",
    projectId: "free2memovies",
    storageBucket: "free2memovies.firebasestorage.app",
    messagingSenderId: "496384632960",
    appId: "1:496384632960:web:592102ff928d855fb5de65",
    measurementId: "G-Y9DXZB6P2W"
  });

let auth = null;
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// You can now use the 'app' instance to access Firebase services
// For example, to use Firebase Authentication:
// import { getAuth } from "firebase/auth";
auth = getAuth(app);

export { app };
// export { auth };
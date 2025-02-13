import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = { 
  apiKey: "AIzaSyAMURFt8AWPf6mr9qv6jqdeSjLu-r2_Fbc",
  authDomain: "free2memovies.firebaseapp.com",
  projectId: "free2memovies",
  storageBucket: "free2memovies.firebasestorage.app",
  messagingSenderId: "496384632960",
  appId: "1:496384632960:web:592102ff928d855fb5de65",
  measurementId: "G-Y9DXZB6P2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          window.location.href = "home.html";
        })
        .catch((error) => {
            document.getElementById("error-message").textContent = "Error: " + error.message;
        });
});

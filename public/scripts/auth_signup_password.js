import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const db = getFirestore(app); // 🔹 Ensure Firestore is initialized

document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // 🚨 Prevent multiple submissions

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMessage = document.getElementById("signup-error-message");

    errorMessage.textContent = ""; // Clear previous errors

    // ✅ Prevent multiple clicks
    const submitButton = document.querySelector("#signup-form button");
    submitButton.disabled = true;

    // ✅ Validate input fields
    if (!email || !password || !confirmPassword) {
        errorMessage.textContent = "All fields are required!";
        submitButton.disabled = false; // Re-enable the button
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        errorMessage.textContent = "Please enter a valid email address.";
        submitButton.disabled = false;
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = "Password must be at least 6 characters long.";
        submitButton.disabled = false;
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        submitButton.disabled = false;
        return;
    }

    try {
        console.log("⏳ Creating user...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user || !user.uid) {
            throw new Error("User UID is undefined!");
        }

        console.log("✅ User created successfully:", user.uid);

        // ✅ Save user info in Firestore
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            uid: user.uid,  // 🔹 Explicitly storing UID
            email: email,
            streamingPreferences: []
        });

        console.log("✅ User saved in Firestore:", user.uid);

        // ✅ Delay redirect slightly to prevent race conditions
        setTimeout(() => {
            console.log("🔄 Redirecting to initializeUser.html...");
            window.location.href = "initializeUser.html";
        }, 500); // 0.5-second delay to prevent immediate re-triggers

    } catch (error) {
        console.error("❌ Signup Error:", error.message);
        errorMessage.textContent = "Error: " + error.message;
        submitButton.disabled = false; // Re-enable button if error occurs
    }
});

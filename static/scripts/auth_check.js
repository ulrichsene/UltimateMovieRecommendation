import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { app } from './app.js';

const auth = getAuth(app);
document.addEventListener("DOMContentLoaded", () => {
    const userEmailElement = document.getElementById("user-email");
    const logoutButton = document.getElementById("logout-button");

    if (userEmailElement) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userEmailElement.textContent = `Logged in as: ${user.email}`;
            } else {
                window.location.href = "/";
            }
        });
    } else {
        console.error('User email element not found!');
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = "/"; // Redirect to index after logout
            }).catch((error) => {
                console.error("Logout Error:", error);
            });
        });
    } else {
        console.error('Logout button not found!');
    }
});

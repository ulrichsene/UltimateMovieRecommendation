document.getElementById("streaming-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Get selected services
    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    const selectedServices = Array.from(checkboxes).map(cb => cb.value);

    // Retrieve user ID (ensure it exists in local storage)
    const userID = localStorage.getItem("userID") || "defaultUser"; 

    // Package preferences in a dictionary (object)
    const preferences = {
        userID: userID,
        streamingServices: selectedServices
    };

    // Save preferences to local storage
    localStorage.setItem("streamingPreferences", JSON.stringify(preferences));

    // Send preferences to backend (streamingPreferences.py)
    try {
        const response = await fetch("/save_preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(preferences)
        });

        if (response.ok) {
            console.log("Preferences saved successfully.");
            window.location.href = "home.html"; // Redirect to home
        } else {
            console.error("Failed to save preferences.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

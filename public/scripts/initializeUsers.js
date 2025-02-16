document.getElementById("streaming-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    const selectedServices = Array.from(checkboxes).map(cb => cb.value);

    const userID = localStorage.getItem("userID") || "defaultUser"; 

    const preferences = {
        userID: userID,
        streamingServices: selectedServices
    };

    localStorage.setItem("streamingPreferences", JSON.stringify(preferences));

    // Send data to Node.js backend
    try {
        const response = await fetch("http://localhost:3000/save_preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(preferences)
        });

        if (response.ok) {
            console.log("Preferences saved successfully.");
            window.location.href = "home.html";
        } else {
            console.error("Failed to save preferences.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

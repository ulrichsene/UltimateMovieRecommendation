document.getElementById("streaming-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get selected services
    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    const selectedServices = Array.from(checkboxes).map(cb => cb.value);

    // Save preferences to local storage
    localStorage.setItem("streamingPreferences", JSON.stringify(selectedServices));

    // Redirect to home
    window.location.href = "home.html";
});

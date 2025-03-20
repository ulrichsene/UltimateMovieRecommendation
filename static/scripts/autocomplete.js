document.addEventListener("DOMContentLoaded", () => { // this ensures that the code inside function only runs with html if fully loaded
    const movieInput = document.getElementById("movie_title");
    const autocompleteList = document.getElementById("autocomplete-list");

    movieInput.addEventListener("input", async () => { // "listens" for whenever the user types something in the input field
        const query = movieInput.value.trim(); // value of input field is trimmed

        if (query.length < 2) { // checks if the query is less than 2 characters -> doesn't proceed 
            autocompleteList.innerHTML = "";
            return;
        }

        try {
            const response = await fetch(`/autocomplete?query=${encodeURIComponent(query)}`); // fetches request to the URL
            const suggestions = await response.json(); // parses the json data from the response

            autocompleteList.innerHTML = ""; // clears any old suggestions from the autocomplete list before adding new ones

            // this part iterates over the suggestions array
            suggestions.forEach((title) => {
                const listItem = document.createElement("li");
                listItem.textContent = title;
                listItem.addEventListener("click", () => {
                    movieInput.value = title; // Fill input with selected title
                    autocompleteList.innerHTML = ""; // Clear suggestions
                });
                autocompleteList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error);
        }
    });

    // this part adds another event listener for the document so when a click occurs outside the autocomplete list
    // the autocomplete list is cleared which hides any suggestions
    document.addEventListener("click", (event) => {
        if (!autocompleteList.contains(event.target) && event.target !== movieInput) {
            autocompleteList.innerHTML = ""; // Hide dropdown if clicked outside
        }
    });
});

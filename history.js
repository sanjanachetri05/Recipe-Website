let favouriteMealIds = new Set(); // holds favourite meal IDs

document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("dropdownUsername");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        usernameDisplay.innerHTML = `<strong>${storedUsername}</strong>`;
    } else {
        usernameDisplay.innerHTML = `<strong>Guest</strong>`;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Please sign in first!");
        window.location.href = "login.html";
        return;
    }

    // Step 1: Fetch favourites first
    fetch(`http://localhost:5000/favourites/${userId}`)
        .then(res => res.json())
        .then(favourites => {
            favouriteMealIds = new Set(favourites.map(fav => fav.mealId));
            // Step 2: Then load history
            loadHistory(userId);
        })
        .catch(err => {
            console.error("Failed to load favourites:", err);
            loadHistory(userId); // Still try to load history
        });
});

function loadHistory(userId) {
    fetch(`http://localhost:5000/history/${userId}`)
        .then(res => res.json())
        .then(history => {
            const container = document.getElementById("historyResults");

            if (!Array.isArray(history) || history.length === 0) {
                container.innerHTML = "<p>No history yet.</p>";
                return;
            }

            container.innerHTML = "";

            // Filter duplicates by mealId (last visited shown)
            const uniqueMeals = new Map();
            history.forEach(item => {
                uniqueMeals.set(item.mealId, item);
            });

            for (const item of uniqueMeals.values()) {
                const isFav = favouriteMealIds.has(item.mealId);
                const heartIconSrc = isFav
                    ? "https://cdn-icons-png.flaticon.com/512/833/833472.png"
                    : "https://cdn-icons-png.flaticon.com/512/1077/1077035.png";

                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <div class="card-img-container" onclick="viewRecipe('${item.mealId}', '${item.mealName}', '${item.mealThumb}')">
                        <img class="card-img" src="${item.mealThumb}" alt="${item.mealName}" />
                        <img src="${heartIconSrc}"
                             class="heart-icon"
                             onclick="toggleFavourite(event, '${item.mealId}', '${item.mealName}', '${item.mealThumb}')" />
                    </div>
                    <h3>${item.mealName}</h3>
                `;

                container.appendChild(card);
            }
        })
        .catch(err => {
            console.error("Error loading history:", err);
            document.getElementById("historyResults").innerHTML = "<p>Error loading history.</p>";
        });
}

// View recipe
function viewRecipe(mealId, mealName, mealThumb) {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        fetch("http://localhost:5000/add-to-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId, mealName, mealThumb }),
        });
    }

    window.location.href = `recipe.html?id=${mealId}`;
}

// Toggle favourite
function toggleFavourite(event, mealId, mealName, mealThumb) {
    event.stopPropagation();

    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const heartIcon = event.target;

    if (heartIcon.src.includes("833472")) {
        // Filled heart ➔ remove
        fetch("http://localhost:5000/remove-favourite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId })
        })
        .then(res => res.json())
        .then(() => {
            heartIcon.src = "https://cdn-icons-png.flaticon.com/512/1077/1077035.png";
            favouriteMealIds.delete(mealId);
            alert("Removed from favourites");
        });
    } else {
        // Empty heart ➔ add
        fetch("http://localhost:5000/add-favourite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId, mealName, mealThumb })
        })
        .then(res => res.json())
        .then(() => {
            heartIcon.src = "https://cdn-icons-png.flaticon.com/512/833/833472.png";
            favouriteMealIds.add(mealId);
            alert("Added to favourites!");
        });
    }
}

// Account dropdown
function toggleDropdown() {
    const dropdown = document.getElementById("accountDropdown");
    dropdown.classList.toggle("show");
}

window.addEventListener("click", (e) => {
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown && !e.target.matches('.account-icon')) {
        dropdown.classList.remove("show");
    }
});

// Logout
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}

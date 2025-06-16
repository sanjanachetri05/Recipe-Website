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
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://localhost:5000/favourites/${userId}`)
        .then(res => res.json())
        .then(favourites => {
            const container = document.getElementById("favouritesList");
            if (!Array.isArray(favourites) || favourites.length === 0) {
                container.innerHTML = "<p>No favourites yet.</p>";
                return;
            }

            container.innerHTML = "";

            favourites.forEach(meal => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <div class="card-img-container" onclick="viewRecipe('${meal.mealId}', '${meal.mealName}', '${meal.mealThumb}')">
                        <img class="card-img" src="${meal.mealThumb}" alt="${meal.mealName}" />
                        <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
                             class="heart-icon"
                             onclick="toggleFavourite(event, '${meal.mealId}', '${meal.mealName}', '${meal.mealThumb}')" />
                    </div>
                    <h3>${meal.mealName}</h3>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error(err);
            document.getElementById("favouritesList").innerHTML = "<p>Error loading favourites.</p>";
        });
});

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

function toggleFavourite(event, mealId, mealName, mealThumb) {
    event.stopPropagation();

    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const heartIcon = event.target;

    // If already favourited ➔ remove
    if (heartIcon.src.includes("833472")) {
        fetch("http://localhost:5000/remove-favourite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId })
        })
        .then(res => res.json())
        .then(() => {
            heartIcon.src = "https://cdn-icons-png.flaticon.com/512/1077/1077035.png"; // empty heart
            alert("Removed from favourites");

            // Optionally: remove the card from DOM
            heartIcon.closest(".card").remove();
        });
    }
}

function toggleDropdown() {
    document.getElementById("accountDropdown").classList.toggle("show");
}

window.addEventListener("click", (e) => {
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown && !e.target.matches('.account-icon')) {
        dropdown.classList.remove("show");
    }
});

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}

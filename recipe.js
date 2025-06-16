let isFavourite = false; // Track favourite status

document.addEventListener("DOMContentLoaded", function () {
    // Account dropdown username display
    const usernameDisplay = document.getElementById("dropdownUsername");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        usernameDisplay.innerHTML = `<strong>${storedUsername}</strong>`;
    } else {
        usernameDisplay.innerHTML = `<strong>Guest</strong>`;
    }

    // Get meal ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get("id");

    if (mealId) {
        fetchRecipeDetails(mealId);
        checkFavouriteStatus(mealId);
    }
});

async function fetchRecipeDetails(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            document.getElementById("mealTitle").innerText = meal.strMeal;
            document.getElementById("mealImage").src = meal.strMealThumb;
            document.getElementById("mealInstructions").innerText = meal.strInstructions;

            const ingredientsList = document.getElementById("mealIngredients");
            ingredientsList.innerHTML = "";

            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];

                if (ingredient && ingredient.trim() !== "") {
                    const listItem = document.createElement("li");
                    listItem.innerText = `${measure} ${ingredient}`;
                    ingredientsList.appendChild(listItem);
                }
            }
        } else {
            document.getElementById("mealTitle").innerText = "Recipe not found.";
        }
    } catch (error) {
        console.error("Failed to load recipe:", error);
    }
}

function checkFavouriteStatus(mealId) {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch("http://localhost:5000/is-favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mealId })
    })
    .then(res => res.json())
    .then(data => {
        isFavourite = data.isFavourite;
        updateFavouriteButton();
    })
    .catch(err => console.error("Failed to check favourite status:", err));
}

function updateFavouriteButton() {
    const favBtn = document.getElementById("favButton");
    favBtn.innerText = isFavourite ? "Remove from Favourites" : "Add to Favourites";
}

function toggleFavourite() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get("id");
    const mealName = document.getElementById("mealTitle").innerText;
    const mealThumb = document.getElementById("mealImage").src;

    if (isFavourite) {
        // Remove favourite
        fetch("http://localhost:5000/remove-favourite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId })
        })
        .then(res => res.json())
        .then(data => {
            alert("Removed from favourites!");
            isFavourite = false;
            updateFavouriteButton();
        })
        .catch(err => console.error("Failed to remove favourite:", err));
    } else {
        // Add favourite
        fetch("http://localhost:5000/add-favourite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId, mealName, mealThumb })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === "Added to favourites") {
                alert("Added to favourites!");
                isFavourite = true;
                updateFavouriteButton();
            } else {
                alert(data.message);
            }
        })
        .catch(err => console.error("Failed to add favourite:", err));
    }
}

function goBack() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => window.history.back(), 300);
}

// Dropdown logic
function toggleDropdown() {
    const dropdown = document.getElementById("accountDropdown");
    dropdown.classList.toggle("show");
}

window.addEventListener("click", function (event) {
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown && !event.target.closest('.account') && !event.target.matches('.account-icon')) {
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

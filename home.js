let lastFetchedMeals = [];
let favouriteMealIds = new Set(); // holds all favourite meal IDs

document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("user_id");

fetch(`http://localhost:5000/favourites/${userId}`)
    .then(res => res.json())
    .then(favourites => {
        favouriteMealIds = new Set(favourites.map(fav => fav.mealId));
        // Then continue rendering search results or history
        loadMeals(); // Call your existing display logic here
    });

    const usernameDisplay = document.getElementById("dropdownUsername");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        usernameDisplay.innerHTML = `<strong>${storedUsername}</strong>`;
    } else {
        usernameDisplay.innerHTML = `<strong>Guest</strong>`;
    }

    const searchBar = document.getElementById("searchBar");
    const clearBtn = document.getElementById("clearBtn");

    searchBar.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchRecipes();
        }
    });

    searchBar.addEventListener("input", toggleClearButton);
    clearBtn.addEventListener("click", clearSearch);
});

function searchRecipes() {
    const query = document.getElementById("searchBar").value.trim();
    if (!query) return;

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
        .then(response => response.json())
        .then(data => {
            if (!data.meals) {
                displayNoResults();
            } else {
                lastFetchedMeals = data.meals; // Store the fetched meals for history
                displayResults(data.meals);
            }
            document.querySelector(".search-container").classList.add("active");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("results").innerHTML = "<p>Something went wrong. Please try again later.</p>";
        });
}

function createRecipeCard(meal, isFav = false) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
    <div class="card-img-container" onclick="viewRecipe('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="card-img"/>
      <img src="${favouriteMealIds.has(meal.idMeal) ? 
        'https://cdn-icons-png.flaticon.com/512/833/833472.png' : 
        'https://cdn-icons-png.flaticon.com/512/1077/1077035.png'}"
        class="heart-icon"
        onclick="toggleFavourite(event, '${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')"/>
    </div>
    <div class="card-body">
      <h3>${meal.strMeal}</h3>
    </div>
  `;
    return card;
}

function displayResults(meals) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    meals.forEach(meal => {
        const card = createRecipeCard(meal);
        resultsContainer.appendChild(card);
    });
}

function displayNoResults() {
    document.getElementById("results").innerHTML = "<p>No recipes found.</p>";
}

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

function toggleClearButton() {
    const searchBar = document.getElementById("searchBar");
    const clearBtn = document.getElementById("clearBtn");
    clearBtn.style.display = searchBar.value.length > 0 ? "block" : "none";
}

function clearSearch() {
    const searchBar = document.getElementById("searchBar");
    searchBar.value = "";
    toggleClearButton();
    document.getElementById("results").innerHTML = "";
    document.querySelector(".search-container").classList.remove("active");
}

function toggleDropdown() {
    const dropdown = document.getElementById("accountDropdown");
    dropdown.classList.toggle("show");
}

window.addEventListener("click", function (event) {
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown && !event.target.matches('.account-icon')) {
        dropdown.classList.remove("show");
    }
});

function toggleFavourite(event, mealId, mealName, mealThumb) {
    event.stopPropagation(); // Prevent clicking card

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
            });
    }
    // Else ➔ add
    else {
        fetch("http://localhost:5000/add-favourite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mealId, mealName, mealThumb })
        })
            .then(res => res.json())
            .then(() => {
                heartIcon.src = "https://cdn-icons-png.flaticon.com/512/833/833472.png"; // filled heart
                alert("Added to favourites!");
            });
    }
}

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}

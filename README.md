🍽️ Recipe Search Web App

An interactive full-stack web application that lets users search for recipes, view ingredients and cooking instructions, save favourites, and track their recipe history. Built using HTML, CSS, JavaScript, Node.js, Express, and MongoDB, with live recipe data from TheMealDB API.

---

## 🚀 Features

- 🔐 User authentication with JWT (signup, login, forgot password)
- 🔎 Real-time recipe search via TheMealDB API
- ❤️ Add/remove recipes from favourites
- 📜 View previously viewed recipes (history)
- 🎨 Responsive UI with dropdown navigation
- 🔒 Passwords secured using bcrypt

---

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **API:** [TheMealDB](https://www.themealdb.com/api.php)
- **Authentication:** bcrypt + JSON Web Token (JWT)
- **Tools:** Visual Studio Code, MongoDB Compass, Postman

---

## 📁 Project Structure

```
📦Recipe-WebApp
 ┣ 📂client
 ┃ ┣ 📜home.html / home.css / home.js
 ┃ ┣ 📜login.html / login.css / login.js
 ┃ ┣ 📜recipe.html / recipe.css / recipe.js
 ┃ ┣ 📜favourite.html / favourite.css / favourite.js
 ┃ ┣ 📜history.html / history.css / history.js
 ┣ 📜server.js
 ┣ 📜.env
 ┣ 📜package.json
 ┗ 📜README.md
```

---

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/sanjanachetro05/recipe-web-app.git
cd recipe-web-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file with:
```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. **Run the backend server**
```bash
node server.js
```

5. Open the app in browser
Open `login.html` or `home.html` in your browser manually.

---

📡 API Routes Summary

 🔐 Authentication
- `POST /signup` – Register
- `POST /signin` – Login
- `POST /forgot-password` – Reset password

❤️ Favourites
- `POST /add-favourite` – Add a favourite
- `POST /remove-favourite` – Remove favourite
- `GET /favourites/:userId` – Get all favourites
- `POST /is-favourite` – Check if a recipe is favourited

 📜 History
- `POST /add-to-history` – Add recipe to history
- `GET /history/:userId` – Get recipe history

---

📈 Future Enhancements

- AI-based recipe suggestions
- Meal planning dashboard
- Nutrition info integration
- Multi-language support
- Mobile app with offline access




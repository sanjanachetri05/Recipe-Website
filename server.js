require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  history: [
    {
      mealId: String,
      mealName: String,
      mealThumb: String,
      viewedAt: { type: Date, default: Date.now },
    }
  ],
  favourites: [
    {
      mealId: String,
      mealName: String,
      mealThumb: String,
      favouritedAt: { type: Date, default: Date.now },
    }
  ]
});

const User = mongoose.model("Users", userSchema);

// Sign-Up Route
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully!", user_id: newUser._id });
  } catch (err) {
    res.status(500).json({ error: "Error signing up" });
    console.log(err);
  }
});

// Sign-In Route
app.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "Invalid username or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, user_id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Error signing in" });
  }
});

// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;

    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(404).json({ error: "Invalid username or email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Add to History
app.post("/add-to-history", async (req, res) => {
  try {
    const { userId, mealId, mealName, mealThumb } = req.body;

    await User.findByIdAndUpdate(userId, {
      $push: {
        history: { mealId, mealName, mealThumb }
      }
    });

    res.json({ message: "Added to history" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to history" });
  }
});

// Get User History
app.get("/history/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.history.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Add to Favourites
app.post("/add-favourite", async (req, res) => {
  try {
    const { userId, mealId, mealName, mealThumb } = req.body;

    const user = await User.findById(userId);
    const alreadyFavourited = user.favourites.some(fav => fav.mealId === mealId);
    if (alreadyFavourited) {
      return res.status(400).json({ message: "Already in favourites" });
    }

    await User.findByIdAndUpdate(userId, {
      $push: {
        favourites: { mealId, mealName, mealThumb }
      }
    });

    res.json({ message: "Added to favourites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add favourite" });
  }
});

// Get User Favourites
app.get("/favourites/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.json([]);
    }
    res.json(user.favourites.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favourites" });
  }
});

// Remove from Favourites
app.post("/remove-favourite", async (req, res) => {
  try {
    const { userId, mealId } = req.body;

    await User.findByIdAndUpdate(userId, {
      $pull: { favourites: { mealId: mealId } }
    });

    res.json({ message: "Removed from favourites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favourite" });
  }
});

// Check if meal is favourited
app.post("/is-favourite", async (req, res) => {
  try {
    const { userId, mealId } = req.body;

    const user = await User.findById(userId).select("-password");
    const isFavourite = user.favourites.some(fav => fav.mealId === mealId);

    res.json({ isFavourite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check favourite" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

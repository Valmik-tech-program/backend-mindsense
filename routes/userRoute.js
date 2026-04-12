// routes/userRoutes.js
const express = require("express");
const { signUp, login, getProfile, saveTestScore, saveDiaryScore } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route for signup
router.post("/signup", signUp);

// Route for login
router.post("/login", login);

// Protected routes
router.get("/profile", protect, getProfile);
router.post("/save-test-score", protect, saveTestScore);
router.post("/save-diary-score", protect, saveDiaryScore);

module.exports = router;

// controllers/userController.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register a new user
const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
    });

    // Save user to DB
    await user.save();

    // Generate token and send response
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in signing up user" });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Generate token and send response
      const token = generateToken(user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error in logging in user" });
  }
};

const getProfile = async (req, res) => {
  try {
    console.log("getProfile called, user:", req.user);
    const userId = req.user._id; // Get user ID from authenticated request
    console.log("Fetching user with ID:", userId);
    const user = await User.findById(userId).select("name email testScores diaryScores"); // Include test and diary scores

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found, sending data for:", user.email);
    res.json(user); // Return user data
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save test score
const saveTestScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { depressionLevel, correctAnswers } = req.body;
    console.log("saveTestScore called", { userId, depressionLevel, correctAnswers });

    const user = await User.findById(userId);
    if (!user) {
      console.log("saveTestScore: user not found", userId);
      return res.status(404).json({ message: "User not found" });
    }

    user.testScores.push({
      depressionLevel,
      correctAnswers,
      date: new Date()
    });

    await user.save();
    const savedScore = user.testScores[user.testScores.length - 1];
    console.log("saveTestScore saved", savedScore);
    res.status(201).json({ message: "Test score saved successfully", savedScore });
  } catch (error) {
    console.error("saveTestScore error", error);
    res.status(500).json({ message: "Error saving test score", error: error.message });
  }
};

// Save diary score
const saveDiaryScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { disease, level, totalScore, dailySymptoms } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.diaryScores.push({
      disease,
      level,
      totalScore,
      dailySymptoms,
      date: new Date()
    });

    await user.save();
    const savedDiary = user.diaryScores[user.diaryScores.length - 1];
    res.status(201).json({ message: "Diary score saved successfully", savedDiary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving diary score" });
  }
};

module.exports = { signUp, login, getProfile, saveTestScore, saveDiaryScore };

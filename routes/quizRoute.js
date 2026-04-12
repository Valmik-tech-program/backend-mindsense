const express = require("express");
const QuizQuestion = require("../models/quizQuestion");

const router = express.Router();

router.get("/questions", async (req, res) => {
  try {
    const questions = await QuizQuestion.find({});
    res.json(questions);
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ message: "Error fetching quiz questions" });
  }
});

module.exports = router;

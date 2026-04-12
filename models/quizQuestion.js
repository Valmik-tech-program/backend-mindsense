const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  option1: { type: String, required: true },
  option2: { type: String, required: true },
  option3: { type: String, required: true },
  option4: { type: String, required: true },
  ans: { type: Number, required: true }
});

module.exports = mongoose.model("QuizQuestion", quizQuestionSchema);

// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  testScores: [{
    depressionLevel: { type: String },
    correctAnswers: { type: Number },
    date: { type: Date, default: Date.now }
  }],
  diaryScores: [{
    disease: { type: String },
    level: { type: String },
    totalScore: { type: Number },
    dailySymptoms: [{
      day: { type: Number },
      symptoms: [{ type: String }]
    }],
    date: { type: Date, default: Date.now }
  }],
  appointments: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected'], default: 'Pending' }
  }]
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

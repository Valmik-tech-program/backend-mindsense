// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const appointmentRoutes = require("./routes/appointmentRoute");
const doctorRoutes = require("./routes/doctorRoute");
const quizRoutes = require("./routes/quizRoute");
const Doctor = require("./models/doctor");
const errorHandler = require("./middlewares/errorHandler");
const QuizQuestion = require("./models/quizQuestion");

console.log("Loaded env:", {
  MONGO_URI: process.env.MONGO_URI ? "SET" : "MISSING",
  JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING"
});

// Initialize the app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    // Seed Doctor Data
    const countDocs = await Doctor.countDocuments();
    if (countDocs < 6) {
      console.log("Seeding initial Doctor data...");
      await Doctor.deleteMany({});
      const doctorsArray = [
        {
          name: "Dr. Rupa Kinkar",
          image: "images/doc1.jpg",
          email: "rupa@gmail.com",
          degree: "MBBS",
          experience: "8 Years",
          fees: 700,
          address: { line1: "Regional Mental Hospital", line2: "Thane" },
        },
        {
          name: "Dr. Sunil Karande",
          image: "images/doc2.jpg",
          email: "sunil@gmail.com",
          degree: "MBBS",
          experience: "5 Years",
          fees: 800,
          address: { line1: "K.E.M. Hospital", line2: "Parel, Mumbai" },
        },
        {
          name: "Dr. Jitendra Chandurkar",
          image: "images/doc3.jpg",
          email: "jitendra@gmail.com",
          degree: "MBBS",
          experience: "3 Years",
          fees: 600,
          address: { line1: "Shushrut Clinic", line2: "Badlapur" },
        },
        {
          name: "Dr. A.U. Athawle",
          image: "images/doc4.jpg",
          email: "athawle@gmail.com",
          degree: "MBBS",
          experience: "4 Years",
          fees: 300,
          address: { line1: "Central Hospital", line2: "Ulhasnagar" },
        },
        {
          name: "Dr. Chetan Bhaskar Bahiram",
          image: "images/doc5.jpg",
          email: "chetan@gmail.com",
          degree: "MBBS",
          experience: "7 Years",
          fees: 1200,
          address: { line1: "J.J. Hospital", line2: "Byculla, Mumbai" },
        },
        {
          name: "Dr. Vikas Pawar",
          image: "images/doc6.jpg",
          email: "vikas@gmail.com",
          degree: "MBBS, MD",
          experience: "5 Years",
          fees: 500,
          address: { line1: "Indravati Hospital", line2: "Airoli" },
        }
      ];
      await Doctor.insertMany(doctorsArray);
    }

    // Seed Quiz Data
    const count = await QuizQuestion.countDocuments();
    if (count === 0) {
      console.log("Seeding Quiz Questions...");
      const quizData = [
        {
          question: "How long does it typically take you to fall asleep after getting into bed?",
          option1: "I usually fall asleep within 15 minutes.",
          option2: "It typically takes me about 30 minutes to fall asleep.",
          option3: "I often struggle to fall asleep and take over an hour.",
          option4: "I never take longer than 30 minutes to fall asleep.",
          ans: 4,
        },
        {
          question: "How would you describe your sleep during the night?",
          option1: "I wake up once or twice but fall back asleep quickly.",
          option2: "I sleep through the night without waking up.",
          option3: "I often wake up feeling tired.",
          option4: "I experience restless sleep and wake up often.",
          ans: 2,
        },
        {
          question: "Do you tend to wake up earlier than you need to, and how does that affect your day?",
          option1: "I wake up exactly when my alarm goes off, feeling rested.",
          option2: "I wake up an hour before my alarm and can't fall back asleep.",
          option3: "I wake up too early and feel anxious throughout the day.",
          option4: "I rarely wake up early; I tend to oversleep.",
          ans: 1,
        },
        {
          question: "How much sleep do you get on a typical day, including naps?",
          option1: "I typically sleep around 5-6 hours and nap during the day.",
          option2: "I usually sleep about 8-9 hours and feel great.",
          option3: "I sleep about 7-8 hours per night and do not nap during the day.",
          option4: "I often get less than 5 hours and feel exhausted.",
          ans: 3,
        },
        {
          question: "How do you perceive yourself compared to others?",
          option1: "I often feel inferior to others and struggle with self-worth.",
          option2: "I see myself as equally deserving as others.",
          option3: "I frequently compare myself and feel inadequate.",
          option4: "I feel like I have more to offer than most people.",
          ans: 2,
        },
        {
          question: "How interested are you in the people and activities around you?",
          option1: "I’ve noticed I’m losing interest in activities I used to enjoy.",
          option2: "I feel less interested in socializing than I did before.",
          option3: "I’m still interested in people and activities as I usually am.",
          option4: "I’ve become more interested in my hobbies recently.",
          ans: 3,
        },
        {
          question: "How would you describe your energy levels throughout the day?",
          option1: "I have more energy than I used to.",
          option2: "My energy levels feel about the same as they’ve always been.",
          option3: "I feel tired and drained by midday, unable to keep up.",
          option4: "I have ups and downs but overall feel okay.",
          ans: 2,
        },
        {
          question: "Do you often feel restless or unable to relax?",
          option1: "I generally feel calm and at ease.",
          option2: "I often feel restless and can’t seem to sit still.",
          option3: "Sometimes I feel restless, but it’s manageable.",
          option4: "I find it very difficult to relax and unwind.",
          ans: 1,
        },
        {
          question: "Have you noticed any changes in how quickly you think, speak, or move?",
          option1: "I think, speak, and move at my usual pace without difficulty.",
          option2: "Sometimes I feel like I’m responding slower than usual.",
          option3: "I’ve noticed that my thoughts and movements are faster than before.",
          option4: "I struggle to keep up with conversations and feel slow.",
          ans: 1,
        },
        {
          question: "Has your weight changed significantly in recent months?",
          option1: "My weight has been stable, with no noticeable changes.",
          option2: "I've recently gained a noticeable amount of weight.",
          option3: "I've lost weight but feel fine about it.",
          option4: "I often fluctuate in weight throughout the year without concern.",
          ans: 1,
        },
        {
          question: "Have you noticed any changes in your behavior recently?",
          option1: "I haven’t noticed any significant changes in my behavior.",
          option2: "I occasionally notice slight changes in how I act.",
          option3: "I find myself behaving differently in social situations.",
          option4: "I feel like my behavior has changed a lot over the past few months.",
          ans: 1,
        }
      ];
      await QuizQuestion.insertMany(quizData);
      console.log("Quiz Questions seeded successfully.");
    }
  })
  .catch((err) => console.log(err));

// API routes
app.use("/api/user", userRoutes); // Use user routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api", doctorRoutes);
app.use("/api/quiz", quizRoutes);

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

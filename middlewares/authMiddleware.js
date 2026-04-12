// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token.substring(0, 20) + "...");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded, userId:", decoded.id);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("User not found in database");
        return res.status(404).json({ message: "User not found" });
      }

      console.log("User found:", req.user.email);
      next();
      return;
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed", error: error.message });
    }
  }

  // If no token provided
  console.log("No token in headers");
  return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = { protect };

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Auth Middleware - Token:", token); // Debug log
  if (!token) {
    console.log("Auth Middleware - No token found");
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Auth Middleware - Decoded token:", decoded); // Debug log
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Auth Middleware - Invalid token error:", err.message); // Debug log
    return res.status(400).json({ message: "Invalid token" });
  }
};

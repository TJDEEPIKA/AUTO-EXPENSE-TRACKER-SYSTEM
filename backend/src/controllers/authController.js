const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const passport = require("../config/passport");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, totalAmount: user.totalAmount } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' });

exports.googleCallback = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (!req.user) {
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
  try {
    // User is authenticated, generate JWT
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "1d" });
    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  } catch (error) {
    res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
  }
};

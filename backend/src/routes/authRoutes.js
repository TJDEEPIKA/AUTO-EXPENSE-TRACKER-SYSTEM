const express = require("express");
const { signup, login, googleAuth, googleCallback } = require("../controllers/authController");
const passport = require("../config/passport");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/google", (req, res, next) => {
  // Clear any existing session before starting OAuth
  req.logout((err) => {
    if (err) { return next(err); }
    googleAuth(req, res, next);
  });
});
router.get("/google/callback", passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login', session: false }), googleCallback);

module.exports = router;

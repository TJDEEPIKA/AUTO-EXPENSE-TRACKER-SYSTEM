const express = require("express");
const { getProfile, updateBudget, updateProfile } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/updateBudget", protect, updateBudget);
router.put("/updateProfile", protect, updateProfile);

module.exports = router;

const express = require("express");
const { addSalary, getSalaries, updateSalary, deleteSalary, getDeletedSalaries } = require("../controllers/salaryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/add", addSalary);
router.get("/", getSalaries);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);
router.get("/deleted", getDeletedSalaries);

module.exports = router;

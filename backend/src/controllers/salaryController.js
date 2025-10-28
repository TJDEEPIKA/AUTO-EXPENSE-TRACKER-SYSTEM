const Salary = require("../models/salary");
const mongoose = require("mongoose");

// Add salary
exports.addSalary = async (req, res) => {
  console.log('Add salary called - Body:', req.body);
  console.log('Add salary called - User:', req.user);
  try {
    const { month, amount } = req.body;
    const userId = req.user.id; // From auth middleware

    // Check if salary for this month already exists
    const existingSalary = await Salary.findOne({ user: userId, month });
    if (existingSalary) {
      return res.status(400).json({ message: "Salary for this month already exists" });
    }

    const salary = new Salary({
      user: userId,
      month,
      amount: parseFloat(amount)
    });

    await salary.save();
    res.status(201).json({ message: "Salary added successfully", salary });
  } catch (error) {
    console.error('Add salary error:', error);
    res.status(500).json({ message: "Failed to add salary", error: error.message });
  }
};

// Get all salaries for user
exports.getSalaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const salaries = await Salary.find({ user: userId, isDeleted: false }).sort({ month: 1 });
    res.json({ salaries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch salaries", error: error.message });
  }
};

// Update salary
exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, amount } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid salary ID" });
    }

    const salary = await Salary.findOne({ _id: id, user: userId });
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    salary.month = month || salary.month;
    salary.amount = amount ? parseFloat(amount) : salary.amount;

    await salary.save();
    res.json({ message: "Salary updated successfully", salary });
  } catch (error) {
    res.status(500).json({ message: "Failed to update salary", error: error.message });
  }
};

// Delete salary (soft delete)
exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid salary ID" });
    }

    const salary = await Salary.findOne({ _id: id, user: userId });
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    salary.isDeleted = true;
    salary.deletedAt = new Date();
    await salary.save();

    res.json({ message: "Salary deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete salary", error: error.message });
  }
};

// Get deleted salaries
exports.getDeletedSalaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedSalaries = await Salary.find({ user: userId, isDeleted: true }).sort({ deletedAt: -1 }).limit(10);
    res.json(deletedSalaries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deleted salaries", error: error.message });
  }
};

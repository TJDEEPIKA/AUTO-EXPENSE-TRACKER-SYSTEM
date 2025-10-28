const Expense = require("../models/expense");
const User = require("../models/user");
const Salary = require("../models/salary");
const { createNotification } = require("./notificationController");

exports.addExpense = async (req, res) => {
  try {
    console.log('Add expense request received:', req.body);
    console.log('User ID from token:', req.user.id);
    const { amount, category, description } = req.body;

    if (!amount || !category) {
      console.log('Validation failed: missing amount or category');
      return res.status(400).json({ message: "Amount and category are required" });
    }

    // Calculate current month's salary
    const now = new Date();
    const currentMonthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
    const currentYear = now.getFullYear();
    const currentMonthName = currentMonthFormatter.format(now);
    const currentMonthSalaries = await Salary.find({
      user: req.user.id,
      month: { $regex: new RegExp(`^${currentMonthName} ${currentYear}$`, 'i') }
    });
    const currentMonthSalary = currentMonthSalaries.reduce((sum, sal) => sum + sal.amount, 0);

    // Calculate total expenses for current month
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: thisMonth.toISOString().split('T')[0] },
      isDeleted: false
    });
    const totalThisMonthExpenses = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Compute remaining budget
    const remainingBudget = Math.max(0, currentMonthSalary - totalThisMonthExpenses);

    // Validate if new expense exceeds remaining budget
    if (amount > remainingBudget) {
      console.log('Expense exceeds budget:', { amount, remainingBudget });
      return res.status(400).json({ message: "Expense exceeds remaining budget. You are adding an expense over your budget." });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check for duplicate before saving
    const existingExpense = await Expense.findOne({ userId: req.user.id, date: today, amount, category, description });
    const isDuplicate = !!existingExpense;

    const newExpense = new Expense({
      userId: req.user.id,  // from authMiddleware
      amount,
      category,
      description,
      date: today,
      time: new Date().toTimeString().split(' ')[0], // HH:MM:SS
    });

    console.log('New expense object:', newExpense);
    await newExpense.save();
    console.log('Expense saved successfully:', newExpense._id);

    // Generate notifications
    // New Expense Added
    await createNotification(req.user.id, 'new_expense', `New expense added: ${description || 'No description'} for $${amount}`);

    // High Expense Alert
    const todayExpenses = await Expense.find({ userId: req.user.id, date: today, isDeleted: false });
    const totalToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    if (totalToday > 1000) { // threshold
      await createNotification(req.user.id, 'high_expense', `High expense alert: Total expenses for today exceed $1000`);
    }

    // Duplicate Expense Warning
    if (isDuplicate) {
      await createNotification(req.user.id, 'duplicate_expense', `Duplicate expense warning: Similar expense already exists`);
    }

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error in addExpense:', error);
    res.status(500).json({ message: "Error adding expense", error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const expenses = await Expense.find({ userId, isDeleted: false }).sort({ date: -1, time: -1 });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthExpenses = expenses.filter(exp => new Date(exp.date) >= thisMonth).reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate current month's salary
    const now = new Date();
    const currentMonthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
    const currentYear = now.getFullYear();
    const currentMonthName = currentMonthFormatter.format(now);
    const currentMonthSalaries = await Salary.find({ 
      user: userId, 
      month: { $regex: new RegExp(`^${currentMonthName} ${currentYear}$`, 'i') } 
    });
    const currentMonthSalary = currentMonthSalaries.reduce((sum, sal) => sum + sal.amount, 0);
    const remainingBudget = Math.max(0, currentMonthSalary - thisMonthExpenses); // Ensure non-negative

    const recentExpenses = expenses.slice(0, 5);
    res.json({
      stats: {
        totalExpenses,
        thisMonth: thisMonthExpenses,
        remainingBudget
      },
      recentExpenses
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching summary", error });
  }
};

exports.getFilteredExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    // By default don't return soft-deleted expenses
    let filter = { userId, isDeleted: false };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: 1, time: 1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching filtered expenses", error });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description } = req.body;
    const userId = req.user.id;

    console.log('Update expense request:', { id, userId, body: req.body });

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      console.log('Expense not found for update:', { id, userId });
      return res.status(404).json({ message: "Expense not found" });
    }

    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (description !== undefined) expense.description = description;

    await expense.save();
    console.log('Expense updated successfully:', expense._id);
    res.json(expense);
  } catch (error) {
    console.error('Error in updateExpense:', error);
    res.status(500).json({ message: "Error updating expense", error: error.message });
  }
};

// Delete an expense (soft delete)
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('Delete expense request:', { id, userId });

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      console.log('Expense not found for delete:', { id, userId });
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.isDeleted = true;
    expense.deletedAt = new Date();
    await expense.save();

    console.log('Expense soft deleted successfully:', expense._id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};

// Get deleted expenses
exports.getDeletedExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedExpenses = await Expense.find({ userId, isDeleted: true }).sort({ deletedAt: -1 }).limit(10);
    res.json(deletedExpenses);
  } catch (error) {
    console.error('Error in getDeletedExpenses:', error);
    res.status(500).json({ message: "Error fetching deleted expenses", error: error.message });
  }
};

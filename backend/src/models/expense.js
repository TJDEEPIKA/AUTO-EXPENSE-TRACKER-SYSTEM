const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  date: String,
  time: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ add this
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);

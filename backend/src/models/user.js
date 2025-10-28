const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId; } }, // Required unless Google user
  googleId: { type: String, unique: true, sparse: true },
  totalAmount: { type: Number },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

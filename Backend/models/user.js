const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, enum: ["user", "admin"] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, enum: ["user", "admin"] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

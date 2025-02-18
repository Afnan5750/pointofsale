const express = require("express");
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing
const Admin = require("../models/admin");

const router = express.Router();

// Admin Registration
router.post("/register", async (req, res) => {
  const { role, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ message: "Admin already exists" });

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    admin = new Admin({ role, email, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, admin.password); // Compare hash with input password

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", admin });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs"); // Import bcryptjs for hashing
const User = require("../models/user");

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  const { role, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    user = new User({ role, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password); // Compare hash with input password

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

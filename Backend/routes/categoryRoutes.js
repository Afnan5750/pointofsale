const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();

    if (!categories.length) {
      return res.status(404).json({ message: "No categories found", total: 0 });
    }

    // Send the entire categories array, which already contains all the details
    res.json({
      message: "Categories fetched successfully",
      total: categories.length,
      categories: categories, // Sending all category details directly
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new category
router.post("/add-category", async (req, res) => {
  const { name } = req.body;

  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name });
    await newCategory.save();
    res
      .status(201)
      .json({ message: "Category added successfully", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an existing category
router.put("/update-category/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name;
    await category.save();
    res.json({ message: "Category updated successfully", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a category
router.delete("/delete-category/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

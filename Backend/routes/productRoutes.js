const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const Product = require("../models/Product");

// Multer configuration for storing images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/")); // Store images in the 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to allow only image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// POST route to add a new product with an image
router.post("/add-product", upload.single("image"), async (req, res) => {
  const { name, company, category, quantity, price, actualPrice } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Store image path

  try {
    // Check if product name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: `Product name "${name}" already exists` });
    }

    // Create and save the new product
    const newProduct = new Product({
      name,
      company,
      category,
      quantity,
      price,
      actualPrice,
      image: imageUrl,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

// GET route to search products by name
router.get("/products", async (req, res) => {
  const searchQuery = req.query.name;

  try {
    let products;
    if (searchQuery) {
      products = await Product.find({
        name: { $regex: searchQuery, $options: "i" },
      });
    } else {
      products = await Product.find();
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// PUT route to update a product by ID (including image update)
router.put("/update-product/:id", upload.single("image"), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, company, category, quantity, price, actualPrice } = req.body;
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image; // Keep existing image if not updated

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        company,
        category,
        quantity,
        price,
        actualPrice,
        image: imageUrl,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// DELETE route to remove a product by ID
router.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// GET route to fetch total number of products and product list
router.get("/total-products", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const productList = await Product.find();

    res.json({ totalProducts, productList });
  } catch (error) {
    console.error("Error fetching total products and list:", error);
    res.status(500).json({ message: "Error fetching total products and list" });
  }
});

// Serve static images from the uploads directory
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");
const productRoutes = require("./routes/productRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("MongoDB Connection Error:", error));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", productRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", categoryRoutes);

// Serve static files from the frontend (adjusted path)
app.use(express.static(path.join(__dirname, "..", "Frontend", "dist")));

// Catch-all route for serving index.html for any route not found
app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "..", "Frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

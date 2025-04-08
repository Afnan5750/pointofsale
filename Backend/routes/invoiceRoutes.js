const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");

// POST route to create invoices
router.post("/invoices", async (req, res) => {
  const invoices = req.body;

  if (!Array.isArray(invoices) || invoices.length === 0) {
    return res.status(400).json({ message: "No invoices provided" });
  }

  try {
    const createdInvoices = [];

    for (const invoiceData of invoices) {
      const {
        customerName,
        customerContactNo,
        items,
        paidAmount,
        changeAmount,
      } = invoiceData;

      if (!items || items.length === 0) {
        return res
          .status(400)
          .json({ message: "No items selected for one of the invoices" });
      }

      let totalAmount = 0;
      const invoiceItems = [];

      for (const item of items) {
        const product = await Product.findOne({ name: item.productName });

        if (!product) {
          return res
            .status(400)
            .json({ message: `Product ${item.productName} not found` });
        }

        if (product.quantity <= 0) {
          return res
            .status(400)
            .json({ message: `Product ${item.productName} is out of stock` });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.productName}. Available: ${product.quantity}, Requested: ${item.quantity}.`,
          });
        }

        const total = item.price * item.quantity;

        invoiceItems.push({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          totalAmount: total,
          company: product.company,
        });

        totalAmount += total;

        product.quantity -= item.quantity;
        await product.save();
      }

      // Include paidAmount and changeAmount when creating the invoice
      const invoice = new Invoice({
        customerName,
        customerContactNo,
        items: invoiceItems,
        totalAmount,
        paidAmount, // Save paidAmount
        changeAmount, // Save changeAmount
      });

      const savedInvoice = await invoice.save();
      createdInvoices.push(savedInvoice);
    }

    res.status(201).json(createdInvoices);
  } catch (error) {
    console.error("Error creating invoices:", error);
    res.status(500).json({ message: "Error creating invoices" });
  }
});

// GET route to fetch invoices (all, by customer name, or by invoice ID)
router.get("/invoices", async (req, res) => {
  const { customerName, _id } = req.query; // Get customerName and _id from query parameters

  try {
    let invoices;

    // If _id is provided in the query, find invoice by _id
    if (_id) {
      invoices = await Invoice.find({ _id: _id });
    }
    // If customerName is provided, filter invoices by customerName (case-insensitive search)
    else if (customerName) {
      invoices = await Invoice.find({
        customerName: { $regex: customerName, $options: "i" }, // 'i' for case-insensitive search
      });
    }
    // If no filters are provided, return all invoices
    else {
      invoices = await Invoice.find();
    }

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Error fetching invoices" });
  }
});

// DELETE route
router.delete("/invoices/:id", async (req, res) => {
  const { id } = req.params; // Get the invoice ID from URL parameters

  try {
    // Attempt to find the invoice by _id before deleting it
    const deletedInvoice = await Invoice.findById(id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Loop through the items in the invoice to update the product stock
    for (const item of deletedInvoice.items) {
      const product = await Product.findOne({ name: item.productName });
      if (!product) {
        console.error(
          `Product ${item.productName} not found for updating stock`
        );
        continue; // If product not found, skip to the next one
      }

      // Increase the product stock by the quantity in the deleted invoice
      product.quantity += item.quantity;
      await product.save();
    }

    // Delete the invoice
    await Invoice.findByIdAndDelete(id);

    // Return a success message
    res.json({
      message: "Invoice deleted successfully and product quantities updated",
      deletedInvoice,
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Error deleting invoice" });
  }
});

// UPDATE route
router.put("/invoices/:id", async (req, res) => {
  const { id } = req.params;
  const { customerName, customerContactNo, items, paidAmount, changeAmount } =
    req.body;

  try {
    // Fetch the existing invoice to compare quantities
    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Create a map of the existing quantities for comparison
    const existingItemsMap = {};
    for (const item of existingInvoice.items) {
      existingItemsMap[item.productName] = item.quantity;
    }

    let totalAmount = 0;

    // Adjust product quantities in the database and calculate the new total
    for (const updatedItem of items) {
      const product = await Product.findOne({ name: updatedItem.productName });
      if (!product) {
        return res.status(404).json({
          message: `Product with name ${updatedItem.productName} not found`,
        });
      }

      // Compare the updated quantity with the existing quantity
      const existingQuantity = existingItemsMap[updatedItem.productName] || 0;
      const quantityDifference = updatedItem.quantity - existingQuantity;

      // If the invoice quantity is increasing, reduce the product stock in the database
      if (quantityDifference > 0) {
        product.quantity -= quantityDifference;
        if (product.quantity < 0) {
          return res.status(400).json({
            message: `Insufficient stock for product ${
              product.name
            }. Current stock: ${product.quantity + quantityDifference}`,
          });
        }
      }
      // If the invoice quantity is decreasing, increase the product stock in the database
      else if (quantityDifference < 0) {
        product.quantity += Math.abs(quantityDifference); // Increase stock by the absolute difference
      }

      await product.save();

      // Calculate the total amount for the invoice
      totalAmount += updatedItem.quantity * product.price;
    }

    // Update the invoice with the new details, including paidAmount and changeAmount
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        customerName,
        customerContactNo,
        items,
        totalAmount,
        paidAmount, // Save paidAmount
        changeAmount, // Save changeAmount
      },
      { new: true }
    );

    res.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Error updating invoice" });
  }
});

// GET route to fetch the total number of invoices ---------------
router.get("/total-invoices", async (req, res) => {
  try {
    // Count the total number of invoices
    const totalInvoices = await Invoice.countDocuments();

    // Fetch all invoices' details, including customerContactNo
    const invoiceDetails = await Invoice.find(
      {},
      {
        customerName: 1, // Include customerName
        customerContactNo: 1, // Include customerContactNo
        totalAmount: 1, // Include totalAmount
        createdAt: 1, // Include createdAt for timestamp
      }
    );

    // Return the total count and the invoice details
    res.json({
      totalInvoices,
      invoices: invoiceDetails,
    });
  } catch (error) {
    console.error("Error fetching total invoices:", error);
    res.status(500).json({ message: "Error fetching total invoices" });
  }
});

// GET route to fetch today's invoices ----------------
router.get("/invoices/today-invoices", async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Aggregate invoices for today
    const salesData = await Invoice.aggregate([
      {
        $addFields: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          day: day,
          month: month,
          year: year,
        },
      },
      {
        $project: {
          customerName: 1,
          customerContactNo: 1, // Include customerContactNo
          items: 1,
          totalAmount: 1,
          createdAt: 1,
          _id: 1,
          day: 1,
          month: 1,
          year: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
          invoicesDetails: {
            $push: {
              _id: "$_id",
              customerName: "$customerName",
              customerContactNo: "$customerContactNo", // Add customerContactNo
              items: "$items",
              totalAmount: "$totalAmount",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    const result =
      salesData.length > 0
        ? salesData[0]
        : { totalSales: 0, invoicesCount: 0, invoicesDetails: [] };

    res.json(result);
  } catch (error) {
    console.error("Error fetching today's invoices:", error);
    res.status(500).json({ message: "Error fetching today's invoices" });
  }
});

// GET route to fetch monthly invoices -------------------
router.get("/invoices/monthly-invoices", async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Aggregate invoices for the current month
    const salesData = await Invoice.aggregate([
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          month: month,
          year: year,
        },
      },
      {
        $project: {
          customerName: 1,
          customerContactNo: 1, // Include customerContactNo
          items: 1,
          totalAmount: 1,
          createdAt: 1,
          _id: 1,
          month: 1,
          year: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
          invoicesDetails: {
            $push: {
              _id: "$_id",
              customerName: "$customerName",
              customerContactNo: "$customerContactNo", // Add customerContactNo
              items: "$items",
              totalAmount: "$totalAmount",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    const result =
      salesData.length > 0
        ? salesData[0]
        : { totalSales: 0, invoicesCount: 0, invoicesDetails: [] };

    res.json(result);
  } catch (error) {
    console.error("Error fetching monthly invoices:", error);
    res.status(500).json({ message: "Error fetching monthly invoices" });
  }
});

// GET route to fetch invoices for a month range
router.get("/invoices/invoices-month-range", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required" });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startYear = start.getFullYear();
    const startMonth = start.getMonth() + 1;
    const endYear = end.getFullYear();
    const endMonth = end.getMonth() + 1;

    const salesData = await Invoice.aggregate([
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $match: {
          date: {
            $gte: start.toISOString().split("T")[0],
            $lte: end.toISOString().split("T")[0],
          },
        },
      },
      {
        $project: {
          customerName: 1,
          customerContactNo: 1, // Include customerContactNo
          items: 1,
          totalAmount: 1,
          createdAt: 1,
          date: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
          invoicesDetails: {
            $push: {
              customerName: "$customerName",
              customerContactNo: "$customerContactNo",
              items: "$items",
              totalAmount: "$totalAmount",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    const result =
      salesData.length > 0
        ? salesData[0]
        : { totalSales: 0, invoicesCount: 0, invoicesDetails: [] };

    res.json(result);
  } catch (error) {
    console.error("Error fetching invoices for the month range:", error);
    res
      .status(500)
      .json({ message: "Error fetching invoices for the month range" });
  }
});

// GET route to fetch the total amount of all invoices
router.get("/total-sales", async (req, res) => {
  try {
    // Fetch all invoices and sum up the totalAmount field
    const totalAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // If there are no invoices, the total will be 0
    const total = totalAmount.length > 0 ? totalAmount[0].total : 0;

    res.json(total); // Return the total amount as a number
  } catch (error) {
    console.error("Error fetching total invoice amount:", error);
    res.status(500).json({ message: "Error fetching total invoice amount" });
  }
});

// GET route to fetch sales for the current month
router.get("/current-month-sales", async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Month is zero-indexed, add 1

    const salesData = await Invoice.aggregate([
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          month: month,
          year: year,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
        },
      },
    ]);

    const result =
      salesData.length > 0 ? salesData[0] : { totalSales: 0, invoicesCount: 0 };

    res.json(result);
  } catch (error) {
    console.error("Error fetching current month sales data:", error);
    res
      .status(500)
      .json({ message: "Error fetching current month sales data" });
  }
});

// GET route to fetch sales for a specific month range
router.get("/range-monthly-sales", async (req, res) => {
  try {
    const { startMonth, endMonth, year } = req.query;

    // Parse query parameters for start and end month
    const start = parseInt(startMonth);
    const end = parseInt(endMonth);
    const selectedYear = parseInt(year) || new Date().getFullYear(); // Default to the current year if no year is provided

    if (!start || !end || start > end) {
      return res.status(400).json({ message: "Invalid month range provided" });
    }

    const salesData = await Invoice.aggregate([
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          month: { $gte: start, $lte: end },
          year: selectedYear,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
        },
      },
    ]);

    const result =
      salesData.length > 0 ? salesData[0] : { totalSales: 0, invoicesCount: 0 };

    res.json(result);
  } catch (error) {
    console.error("Error fetching monthly range sales data:", error);
    res
      .status(500)
      .json({ message: "Error fetching monthly range sales data" });
  }
});

// GET route to fetch sales for the current day
router.get("/current-day-sales", async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const salesData = await Invoice.aggregate([
      {
        $addFields: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          day: day,
          month: month,
          year: year,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
        },
      },
    ]);

    const result =
      salesData.length > 0 ? salesData[0] : { totalSales: 0, invoicesCount: 0 };

    res.json(result);
  } catch (error) {
    console.error("Error fetching current day sales data:", error);
    res.status(500).json({ message: "Error fetching current day sales data" });
  }
});

// GET route to fetch sales for a specific date range
router.get("/range-day-sales", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const salesData = await Invoice.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 },
        },
      },
    ]);

    const result =
      salesData.length > 0 ? salesData[0] : { totalSales: 0, invoicesCount: 0 };

    res.json(result);
  } catch (error) {
    console.error("Error fetching sales data for the date range:", error);
    res
      .status(500)
      .json({ message: "Error fetching sales data for the date range" });
  }
});

module.exports = router;

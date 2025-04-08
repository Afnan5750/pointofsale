const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    productName: String,
    quantity: Number,
    price: Number,
    totalAmount: Number,
    company: String,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: Number, unique: true }, // Invoice number as a Number
    customerName: String,
    customerContactNo: Number,
    items: [invoiceItemSchema],
    paidAmount: Number,
    changeAmount: Number,
    totalAmount: Number,
  },
  { timestamps: true }
);

// Custom Auto-Increment Logic
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastInvoice = await this.constructor
      .findOne()
      .sort({ invoiceNo: -1 });
    this.invoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1;
  }
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      name: { type: String, required: true },
      company: { type: String },
    },
    invoiceNumber: { type: String },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "NEFT/RTGS", "Cheque", "Card"],
      default: "UPI",
    },
    referenceNumber: { type: String }, // Transaction ID, Cheque No, etc.
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

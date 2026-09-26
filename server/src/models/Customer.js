const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    gstin: { type: String, trim: true, uppercase: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true, default: "Maharashtra" },
    pincode: { type: String, trim: true },
    category: {
      type: String,
      enum: ["Contractor", "Architect", "Wholesaler", "Retailer", "Fabricator"],
      default: "Retailer",
    },
    creditLimit: { type: Number, default: 50000 },
    balance: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);

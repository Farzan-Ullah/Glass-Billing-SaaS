const mongoose = require("mongoose");

const proformaItemSchema = new mongoose.Schema({
  description: { type: String, default: "Glass Panel" },
  glassType: { type: String, required: true },
  thickness: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  unit: { type: String, enum: ["inch", "mm"], default: "inch" },
  quantity: { type: Number, default: 1 },
  areaSqFt: { type: Number, required: true },
  totalAreaSqFt: { type: Number, required: true },
  glassRate: { type: Number, required: true },
  glassAmount: { type: Number, required: true },
  services: [
    {
      serviceName: { type: String },
      chargeType: { type: String },
      rate: { type: Number },
      quantity: { type: Number },
      amount: { type: Number },
    },
  ],
  servicesAmount: { type: Number, default: 0 },
  itemTotal: { type: Number, required: true },
});

const proformaSchema = new mongoose.Schema(
  {
    proformaNumber: { type: String, required: true, unique: true },
    quotationRef: { type: String },
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      name: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
      gstin: { type: String },
      address: { type: String },
    },
    date: { type: Date, default: Date.now },
    dimensionUnit: { type: String, enum: ["inch", "mm"], default: "inch" },
    items: [proformaItemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    advanceRequiredPercent: { type: Number, default: 50 },
    advanceAmount: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending Advance", "Partial Advance", "Confirmed", "Converted"],
      default: "Pending Advance",
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProformaInvoice", proformaSchema);

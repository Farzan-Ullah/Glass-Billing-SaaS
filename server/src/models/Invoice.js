const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, default: "Glass Panel" },
  glassType: { type: String, required: true },
  thickness: { type: Number, required: true },
  hsnCode: { type: String, default: "7007" },
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

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceType: {
      type: String,
      enum: ["Tax Invoice", "Proforma Converted", "Estimate Converted", "Job Work"],
      default: "Tax Invoice",
    },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      name: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
      gstin: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String, default: "Maharashtra" },
    },
    placeOfSupply: { type: String, default: "Maharashtra (27)" },
    vehicleNumber: { type: String },
    dimensionUnit: { type: String, enum: ["inch", "mm"], default: "inch" },
    items: [invoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    gstRate: { type: Number, default: 18 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
    },
    challanCreated: { type: Boolean, default: false },
    notes: { type: String },
    terms: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);

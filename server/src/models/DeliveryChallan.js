const mongoose = require("mongoose");

const challanItemSchema = new mongoose.Schema({
  description: { type: String, default: "Glass Panel" },
  glassType: { type: String },
  thickness: { type: Number },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  unit: { type: String, default: "inch" },
  quantity: { type: Number, default: 1 },
  sqFt: { type: Number },
  remarks: { type: String },
});

const deliveryChallanSchema = new mongoose.Schema(
  {
    challanNumber: { type: String, required: true, unique: true },
    invoiceRef: { type: String },
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      name: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
      address: { type: String },
    },
    date: { type: Date, default: Date.now },
    shippingAddress: { type: String },
    vehicleNumber: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },
    items: [challanItemSchema],
    totalPieces: { type: Number, default: 0 },
    totalSqFt: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending Dispatch", "In Transit", "Delivered"],
      default: "Pending Dispatch",
    },
    recipientName: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryChallan", deliveryChallanSchema);

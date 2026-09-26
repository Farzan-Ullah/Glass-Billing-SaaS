const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tier: {
      type: String,
      required: true,
      enum: ["Retailer", "Contractor", "Architect", "Wholesaler"],
      default: "Retailer",
    },
    discountPercent: { type: Number, default: 0 },
    roundToNextInch: { type: Boolean, default: true },
    minChargeableArea: { type: Number, default: 1.0 },
    customRates: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String },
        category: { type: String },
        thickness: { type: Number },
        ratePerSqFt: { type: Number, required: true },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rate", rateSchema);

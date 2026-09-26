const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Clear Float",
        "Toughened / Tempered",
        "Tinted Glass",
        "Frosted / Acid Etched",
        "Mirror / Silvered",
        "Laminated Safety",
        "Fluted / Reeded",
        "Lacquered Glass",
      ],
      default: "Clear Float",
    },
    thickness: { type: Number, required: true }, // in mm (e.g. 4, 5, 6, 8, 10, 12)
    baseRate: { type: Number, required: true }, // rate per Sq.Ft
    minChargeableArea: { type: Number, default: 1.0 }, // minimum sqft billed per piece
    hsnCode: { type: String, default: "7005" },
    inStock: { type: Boolean, default: true },
    stockSqFt: { type: Number, default: 1000 },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

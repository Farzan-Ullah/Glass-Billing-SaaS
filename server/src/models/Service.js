const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    chargeType: {
      type: String,
      required: true,
      enum: ["per_rft", "per_hole", "per_cutout", "per_sqft", "fixed"],
      default: "per_rft",
    },
    rate: { type: Number, required: true },
    unit: { type: String, default: "Rft" }, // Rft, Hole, Cutout, Sq.Ft, Fixed
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);

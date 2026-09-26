const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "Apex Glass & Architectural Glazing" },
    tagline: { type: String, default: "Premium Toughened Glass & Architectural Solutions" },
    phone: { type: String, default: "+91 98765 43210" },
    email: { type: String, default: "sales@apexglass.com" },
    gstin: { type: String, default: "27AABCU9603R1ZX" },
    pan: { type: String, default: "AABCU9603R" },
    address: { type: String, default: "Plot 42, Industrial Area, Phase II" },
    city: { type: String, default: "Mumbai" },
    state: { type: String, default: "Maharashtra" },
    pincode: { type: String, default: "400093" },
    bankName: { type: String, default: "HDFC Bank Ltd" },
    accountNumber: { type: String, default: "50200012345678" },
    ifscCode: { type: String, default: "HDFC0000240" },
    branch: { type: String, default: "Andheri East" },
    upiId: { type: String, default: "apexglass@okaxis" },
    defaultUnit: { type: String, enum: ["inch", "mm"], default: "inch" },
    minChargeableArea: { type: Number, default: 1.0 },
    roundDimensionsToInch: { type: Boolean, default: true },
    defaultGstRate: { type: Number, default: 18 },
    invoicePrefix: { type: String, default: "INV-" },
    estimatePrefix: { type: String, default: "EST-" },
    quotationPrefix: { type: String, default: "QT-" },
    challanPrefix: { type: String, default: "DC-" },
    receiptPrefix: { type: String, default: "RCPT-" },
    termsAndConditions: {
      type: String,
      default:
        "1. All dimensions must be verified by the customer before toughening.\n2. No claims for breakage after delivery.\n3. Toughened glass cannot be cut or altered after processing.\n4. Standard dimensional tolerance: ±2mm.\n5. 50% advance along with confirmed order.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const businessProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "My Glass Works" },
    tagline: { type: String, default: "Architectural & Toughened Glass Works" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "Maharashtra" },
    pincode: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    branch: { type: String, default: "" },
    upiId: { type: String, default: "" },
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
        "1. All dimensions must be verified before toughening.\n2. No claims for breakage after delivery.\n3. Toughened glass cannot be cut or altered after processing.\n4. Standard dimensional tolerance: ±2mm.\n5. 50% advance along with confirmed order.",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String },
    role: { type: String, enum: ["owner", "admin", "manager"], default: "owner" },
    businessCompleted: { type: Boolean, default: false },
    business: { type: businessProfileSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);

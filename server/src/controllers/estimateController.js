const Estimate = require("../models/Estimate");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Setting = require("../models/Setting");

exports.getAllEstimates = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { estimateNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.company": { $regex: search, $options: "i" } },
      ];
    }
    const estimates = await Estimate.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: estimates.length, data: estimates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEstimateById = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ success: false, message: "Estimate not found" });
    }
    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEstimate = async (req, res) => {
  try {
    if (!req.body.estimateNumber) {
      const setting = await Setting.findOne();
      const prefix = setting?.estimatePrefix || "EST-";
      const count = await Estimate.countDocuments();
      req.body.estimateNumber = `${prefix}2026-${String(count + 1).padStart(4, "0")}`;
    }
    const estimate = new Estimate(req.body);
    await estimate.save();
    res.status(201).json({ success: true, data: estimate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!estimate) {
      return res.status(404).json({ success: false, message: "Estimate not found" });
    }
    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findByIdAndDelete(req.params.id);
    if (!estimate) {
      return res.status(404).json({ success: false, message: "Estimate not found" });
    }
    res.json({ success: true, message: "Estimate deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.convertToQuotation = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ success: false, message: "Estimate not found" });
    }

    const qCount = await Quotation.countDocuments();
    const quotationNumber = `QT-2026-${String(qCount + 1).padStart(4, "0")}`;

    const quotation = new Quotation({
      quotationNumber,
      estimateRef: estimate.estimateNumber,
      customer: estimate.customer,
      date: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      dimensionUnit: estimate.dimensionUnit,
      chargeableRuleAddInches: estimate.chargeableRuleAddInches || 0,
      items: estimate.items,
      subtotal: estimate.subtotal,
      discountPercent: estimate.discountPercent,
      discountAmount: estimate.discountAmount,
      taxRate: estimate.taxRate,
      taxAmount: estimate.taxAmount,
      transportCharges: estimate.transportCharges,
      roundOff: estimate.roundOff,
      grandTotal: estimate.grandTotal,
      status: "Sent",
      terms: [
        "Prices are inclusive of standard packaging.",
        "50% advance along with order confirmation, balance on delivery.",
        "Breakage liability ceases once glass is unloaded at site.",
        "Validity: 15 days from quote date.",
      ],
      notes: estimate.notes,
    });

    await quotation.save();
    estimate.status = "Converted";
    await estimate.save();

    res.status(201).json({
      success: true,
      message: "Estimate converted to Quotation successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

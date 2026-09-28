const Quotation = require("../models/Quotation");
const ProformaInvoice = require("../models/ProformaInvoice");
const Invoice = require("../models/Invoice");
const Setting = require("../models/Setting");

exports.getAllQuotations = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.company": { $regex: search, $options: "i" } },
      ];
    }
    const quotations = await Quotation.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    if (!req.body.quotationNumber) {
      const setting = await Setting.findOne();
      const prefix = setting?.quotationPrefix || "QT-";
      const count = await Quotation.countDocuments();
      req.body.quotationNumber = `${prefix}2026-${String(count + 1).padStart(4, "0")}`;
    }
    const quotation = new Quotation(req.body);
    await quotation.save();
    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.convertToProforma = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    const piCount = await ProformaInvoice.countDocuments();
    const proformaNumber = `PI-2026-${String(piCount + 1).padStart(4, "0")}`;
    const advanceRequired = Math.round(quotation.grandTotal * 0.5);

    const proforma = new ProformaInvoice({
      proformaNumber,
      quotationRef: quotation.quotationNumber,
      customer: quotation.customer,
      date: new Date(),
      dimensionUnit: quotation.dimensionUnit,
      chargeableRuleAddInches: quotation.chargeableRuleAddInches || 0,
      items: quotation.items,
      subtotal: quotation.subtotal,
      discountAmount: quotation.discountAmount,
      taxRate: quotation.taxRate,
      taxAmount: quotation.taxAmount,
      transportCharges: quotation.transportCharges,
      roundOff: quotation.roundOff,
      grandTotal: quotation.grandTotal,
      advanceRequiredPercent: 50,
      advanceAmount: advanceRequired,
      advancePaid: 0,
      balanceDue: quotation.grandTotal,
      status: "Pending Advance",
      bankDetails: {
        bankName: "HDFC Bank Ltd",
        accountNumber: "50200012345678",
        ifscCode: "HDFC0000240",
        upiId: "apexglass@okaxis",
      },
      notes: quotation.notes,
    });

    await proforma.save();
    quotation.status = "Converted";
    await quotation.save();

    res.status(201).json({
      success: true,
      message: "Quotation converted to Proforma Invoice",
      data: proforma,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

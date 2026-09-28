const ProformaInvoice = require("../models/ProformaInvoice");
const Invoice = require("../models/Invoice");
const Setting = require("../models/Setting");

exports.getAllProformas = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { proformaNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.company": { $regex: search, $options: "i" } },
      ];
    }
    const proformas = await ProformaInvoice.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: proformas.length, data: proformas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProformaById = async (req, res) => {
  try {
    const proforma = await ProformaInvoice.findById(req.params.id);
    if (!proforma) {
      return res.status(404).json({ success: false, message: "Proforma Invoice not found" });
    }
    res.json({ success: true, data: proforma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProforma = async (req, res) => {
  try {
    if (!req.body.proformaNumber) {
      const count = await ProformaInvoice.countDocuments();
      req.body.proformaNumber = `PI-2026-${String(count + 1).padStart(4, "0")}`;
    }
    const proforma = new ProformaInvoice(req.body);
    await proforma.save();
    res.status(201).json({ success: true, data: proforma });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProforma = async (req, res) => {
  try {
    const proforma = await ProformaInvoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!proforma) {
      return res.status(404).json({ success: false, message: "Proforma Invoice not found" });
    }
    res.json({ success: true, data: proforma });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProforma = async (req, res) => {
  try {
    const proforma = await ProformaInvoice.findByIdAndDelete(req.params.id);
    if (!proforma) {
      return res.status(404).json({ success: false, message: "Proforma Invoice not found" });
    }
    res.json({ success: true, message: "Proforma Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recordAdvance = async (req, res) => {
  try {
    const { amount } = req.body;
    const proforma = await ProformaInvoice.findById(req.params.id);
    if (!proforma) {
      return res.status(404).json({ success: false, message: "Proforma Invoice not found" });
    }

    proforma.advancePaid = (proforma.advancePaid || 0) + Number(amount);
    proforma.balanceDue = Math.max(0, proforma.grandTotal - proforma.advancePaid);

    if (proforma.advancePaid >= proforma.advanceAmount) {
      proforma.status = "Confirmed";
    } else {
      proforma.status = "Partial Advance";
    }

    await proforma.save();
    res.json({ success: true, message: "Advance payment recorded", data: proforma });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.convertToInvoice = async (req, res) => {
  try {
    const proforma = await ProformaInvoice.findById(req.params.id);
    if (!proforma) {
      return res.status(404).json({ success: false, message: "Proforma Invoice not found" });
    }

    const setting = await Setting.findOne();
    const prefix = setting?.invoicePrefix || "INV-";
    const invCount = await Invoice.countDocuments();
    const invoiceNumber = `${prefix}2026-${String(invCount + 1).padStart(4, "0")}`;

    const invoice = new Invoice({
      invoiceNumber,
      invoiceType: "Proforma Converted",
      date: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      customer: proforma.customer,
      placeOfSupply: "Maharashtra (27)",
      dimensionUnit: proforma.dimensionUnit,
      chargeableRuleAddInches: proforma.chargeableRuleAddInches || 0,
      items: proforma.items,
      subtotal: proforma.subtotal,
      discountAmount: proforma.discountAmount,
      taxableAmount: proforma.subtotal - proforma.discountAmount,
      gstRate: proforma.taxRate,
      cgst: Math.round(proforma.taxAmount / 2),
      sgst: Math.round(proforma.taxAmount / 2),
      igst: 0,
      transportCharges: proforma.transportCharges,
      roundOff: proforma.roundOff,
      grandTotal: proforma.grandTotal,
      amountPaid: proforma.advancePaid || 0,
      balanceDue: proforma.grandTotal - (proforma.advancePaid || 0),
      paymentStatus:
        proforma.advancePaid >= proforma.grandTotal
          ? "Paid"
          : proforma.advancePaid > 0
          ? "Partial"
          : "Unpaid",
      notes: proforma.notes,
    });

    await invoice.save();
    proforma.status = "Converted";
    await proforma.save();

    res.status(201).json({
      success: true,
      message: "Proforma converted to Tax Invoice successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

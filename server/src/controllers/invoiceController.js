const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const DeliveryChallan = require("../models/DeliveryChallan");
const Payment = require("../models/Payment");
const Setting = require("../models/Setting");

exports.getAllInvoices = async (req, res) => {
  try {
    const { status, search, customerId } = req.query;
    let query = {};
    if (status && status !== "All") query.paymentStatus = status;
    if (customerId) query["customer.id"] = customerId;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.company": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }
    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    if (!req.body.invoiceNumber) {
      const setting = await Setting.findOne();
      const prefix = setting?.invoicePrefix || "INV-";
      const count = await Invoice.countDocuments();
      req.body.invoiceNumber = `${prefix}2026-${String(count + 1).padStart(4, "0")}`;
    }

    const invoice = new Invoice(req.body);
    await invoice.save();

    // Update customer outstanding balance
    if (invoice.customer?.id && invoice.balanceDue > 0) {
      await Customer.findByIdAndUpdate(invoice.customer.id, {
        $inc: { balance: invoice.balanceDue },
      });
    }

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const oldInvoice = await Invoice.findById(req.params.id);
    if (!oldInvoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Adjust customer balance difference
    if (invoice.customer?.id) {
      const diff = invoice.balanceDue - oldInvoice.balanceDue;
      if (diff !== 0) {
        await Customer.findByIdAndUpdate(invoice.customer.id, {
          $inc: { balance: diff },
        });
      }
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.customer?.id && invoice.balanceDue > 0) {
      await Customer.findByIdAndUpdate(invoice.customer.id, {
        $inc: { balance: -invoice.balanceDue },
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChallanFromInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const setting = await Setting.findOne();
    const prefix = setting?.challanPrefix || "DC-";
    const dcCount = await DeliveryChallan.countDocuments();
    const challanNumber = `${prefix}2026-${String(dcCount + 1).padStart(4, "0")}`;

    const items = invoice.items.map((it) => ({
      description: `${it.thickness}mm ${it.glassType} - ${it.description || "Panel"}`,
      glassType: it.glassType,
      thickness: it.thickness,
      width: it.width,
      height: it.height,
      unit: it.unit,
      quantity: it.quantity,
      sqFt: it.totalAreaSqFt,
      remarks: it.services?.map((s) => s.serviceName).join(", ") || "Standard edges",
    }));

    const totalPieces = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
    const totalSqFt = items.reduce((sum, it) => sum + (it.sqFt || 0), 0);

    const challan = new DeliveryChallan({
      challanNumber,
      invoiceRef: invoice.invoiceNumber,
      customer: invoice.customer,
      date: new Date(),
      shippingAddress: invoice.customer?.address || "Site Address",
      vehicleNumber: req.body.vehicleNumber || invoice.vehicleNumber || "MH-02-EE-8899",
      driverName: req.body.driverName || "Suresh Yadav",
      driverPhone: req.body.driverPhone || "+91 98200 11223",
      items,
      totalPieces,
      chargeableRuleAddInches: invoice.chargeableRuleAddInches || 0,
      totalSqFt: Math.round(totalSqFt * 100) / 100,
      status: "Pending Dispatch",
      notes: "Handle with extreme care. Glass sheets properly cushioned in wooden rack.",
    });

    await challan.save();
    invoice.challanCreated = true;
    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Delivery Challan generated from Invoice successfully",
      data: challan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Setting = require("../models/Setting");

exports.getAllPayments = async (req, res) => {
  try {
    const { search, paymentMethod, customerId } = req.query;
    let query = {};
    if (paymentMethod && paymentMethod !== "All") query.paymentMethod = paymentMethod;
    if (customerId) query["customer.id"] = customerId;
    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
      ];
    }
    const payments = await Payment.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment receipt not found" });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { customer, invoiceId, invoiceNumber, amount, paymentMethod, referenceNumber, notes, date } = req.body;

    if (!req.body.receiptNumber) {
      const setting = await Setting.findOne();
      const prefix = setting?.receiptPrefix || "RCPT-";
      const count = await Payment.countDocuments();
      req.body.receiptNumber = `${prefix}2026-${String(count + 1).padStart(4, "0")}`;
    }

    const payment = new Payment(req.body);
    await payment.save();

    // Settle against invoice if provided
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.amountPaid = (invoice.amountPaid || 0) + Number(amount);
        invoice.balanceDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);
        invoice.paymentStatus =
          invoice.balanceDue === 0 ? "Paid" : invoice.amountPaid > 0 ? "Partial" : "Unpaid";
        await invoice.save();
      }
    }

    // Decrement customer outstanding balance
    if (customer?.id) {
      await Customer.findByIdAndUpdate(customer.id, {
        $inc: { balance: -Number(amount) },
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Revert invoice
    if (payment.invoiceId) {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.amountPaid = Math.max(0, (invoice.amountPaid || 0) - payment.amount);
        invoice.balanceDue = invoice.grandTotal - invoice.amountPaid;
        invoice.paymentStatus =
          invoice.balanceDue === 0 ? "Paid" : invoice.amountPaid > 0 ? "Partial" : "Unpaid";
        await invoice.save();
      }
    }

    // Revert customer balance
    if (payment.customer?.id) {
      await Customer.findByIdAndUpdate(payment.customer.id, {
        $inc: { balance: payment.amount },
      });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

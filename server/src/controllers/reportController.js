const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

exports.getReports = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const payments = await Payment.find();
    const customers = await Customer.find();

    const totalSales = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0), 0);

    // Calculate total sq.ft sold
    let totalSqFt = 0;
    const categoryBreakdown = {};

    invoices.forEach((inv) => {
      inv.items.forEach((it) => {
        const sqft = it.totalAreaSqFt || it.areaSqFt || 0;
        totalSqFt += sqft;
        const cat = it.glassType || "Clear Float";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + sqft;
      });
    });

    // Customer Aging
    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0,
    };

    const now = new Date();
    invoices.forEach((inv) => {
      if (inv.balanceDue > 0) {
        const ageDays = Math.floor((now - new Date(inv.date)) / (1000 * 60 * 60 * 24));
        if (ageDays <= 30) aging.current += inv.balanceDue;
        else if (ageDays <= 60) aging.days30 += inv.balanceDue;
        else if (ageDays <= 90) aging.days60 += inv.balanceDue;
        else aging.days90Plus += inv.balanceDue;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSales: Math.round(totalSales),
          totalCollected: Math.round(totalCollected),
          totalOutstanding: Math.round(totalOutstanding),
          totalTax: Math.round(totalTax),
          totalSqFt: Math.round(totalSqFt * 100) / 100,
          totalInvoices: invoices.length,
          activeCustomers: customers.length,
        },
        categoryBreakdown,
        aging,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

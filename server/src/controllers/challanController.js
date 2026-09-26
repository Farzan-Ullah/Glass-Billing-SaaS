const DeliveryChallan = require("../models/DeliveryChallan");
const Setting = require("../models/Setting");

exports.getAllChallans = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { challanNumber: { $regex: search, $options: "i" } },
        { invoiceRef: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
      ];
    }
    const challans = await DeliveryChallan.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: challans.length, data: challans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChallanById = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findById(req.params.id);
    if (!challan) {
      return res.status(404).json({ success: false, message: "Delivery Challan not found" });
    }
    res.json({ success: true, data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChallan = async (req, res) => {
  try {
    if (!req.body.challanNumber) {
      const setting = await Setting.findOne();
      const prefix = setting?.challanPrefix || "DC-";
      const count = await DeliveryChallan.countDocuments();
      req.body.challanNumber = `${prefix}2026-${String(count + 1).padStart(4, "0")}`;
    }
    const challan = new DeliveryChallan(req.body);
    await challan.save();
    res.status(201).json({ success: true, data: challan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateChallan = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!challan) {
      return res.status(404).json({ success: false, message: "Delivery Challan not found" });
    }
    res.json({ success: true, data: challan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, recipientName } = req.body;
    const update = { status };
    if (status === "Dispatched") update.dispatchedAt = new Date();
    if (status === "Delivered") {
      update.deliveredAt = new Date();
      if (recipientName) update.recipientName = recipientName;
    }
    const challan = await DeliveryChallan.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!challan) {
      return res.status(404).json({ success: false, message: "Delivery Challan not found" });
    }
    res.json({ success: true, message: `Challan marked as ${status}`, data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteChallan = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findByIdAndDelete(req.params.id);
    if (!challan) {
      return res.status(404).json({ success: false, message: "Delivery Challan not found" });
    }
    res.json({ success: true, message: "Delivery Challan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

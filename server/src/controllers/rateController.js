const Rate = require("../models/Rate");

exports.getAllRates = async (req, res) => {
  try {
    const rates = await Rate.find().populate("customRates.productId");
    res.json({ success: true, count: rates.length, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRateByTier = async (req, res) => {
  try {
    const rate = await Rate.findOne({ tier: req.params.tier });
    if (!rate) {
      return res.status(404).json({ success: false, message: "Rate tier not found" });
    }
    res.json({ success: true, data: rate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRate = async (req, res) => {
  try {
    const rate = new Rate(req.body);
    await rate.save();
    res.status(201).json({ success: true, data: rate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateRate = async (req, res) => {
  try {
    const rate = await Rate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rate) {
      return res.status(404).json({ success: false, message: "Rate not found" });
    }
    res.json({ success: true, data: rate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

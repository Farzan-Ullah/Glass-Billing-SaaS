const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Setting = require("../models/Setting");

const JWT_SECRET = process.env.JWT_SECRET || "glass_billing_jwt_secret_dev_key_2026";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Default business structure prefilled for Glass Billing
    const defaultBusiness = {
      companyName: `${name.split(" ")[0]}'s Glass Studio`,
      tagline: "Custom Toughened & Architectural Glass Billing",
      phone: "",
      email: normalizedEmail,
      gstin: "",
      pan: "",
      address: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "",
      bankName: "HDFC Bank Ltd",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      upiId: "",
      defaultUnit: "inch",
      minChargeableArea: 1.0,
      roundDimensionsToInch: true,
      defaultGstRate: 18,
      invoicePrefix: "INV-",
      estimatePrefix: "EST-",
      quotationPrefix: "QT-",
      challanPrefix: "DC-",
      receiptPrefix: "RCPT-",
      termsAndConditions:
        "1. All dimensions must be verified before glass toughening.\n2. No claims for breakage after delivery.\n3. Toughened glass cannot be cut or altered after processing.\n4. Standard dimensional tolerance: ±2mm.\n5. 50% advance along with confirmed order.",
    };

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      businessCompleted: false,
      business: defaultBusiness,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        businessCompleted: user.businessCompleted,
        business: user.business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        businessCompleted: user.businessCompleted,
        business: user.business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

// @desc    Google OAuth sign in / register
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential, idToken, profile } = req.body;
    const tokenToVerify = credential || idToken;

    let googleUser = null;

    if (tokenToVerify) {
      try {
        if (GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: tokenToVerify,
            audience: GOOGLE_CLIENT_ID,
          });
          googleUser = ticket.getPayload();
        } else {
          // If GOOGLE_CLIENT_ID is not configured, decode JWT payload
          const base64Url = tokenToVerify.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
          googleUser = JSON.parse(jsonPayload);
        }
      } catch (tokenErr) {
        // Fallback to client provided profile if token decode failed
        if (profile && profile.email) {
          googleUser = profile;
        } else {
          return res.status(400).json({
            success: false,
            message: "Failed to verify Google token: " + tokenErr.message,
          });
        }
      }
    } else if (profile && profile.email) {
      googleUser = profile;
    } else {
      return res.status(400).json({
        success: false,
        message: "Google credential or profile data is required.",
      });
    }

    const email = (googleUser.email || "").toLowerCase().trim();
    const name = googleUser.name || googleUser.displayName || email.split("@")[0];
    const googleId = googleUser.sub || googleUser.id || googleUser.googleId;
    const avatar = googleUser.picture || googleUser.avatar;

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      if (!user.googleId && googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Create user from Google Profile
      const defaultBusiness = {
        companyName: `${name.split(" ")[0]}'s Glass Works`,
        tagline: "Architectural & Toughened Glass Works",
        phone: "",
        email: email,
        gstin: "",
        pan: "",
        address: "",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "",
        bankName: "HDFC Bank Ltd",
        accountNumber: "",
        ifscCode: "",
        branch: "",
        upiId: "",
        defaultUnit: "inch",
        minChargeableArea: 1.0,
        roundDimensionsToInch: true,
        defaultGstRate: 18,
        invoicePrefix: "INV-",
        estimatePrefix: "EST-",
        quotationPrefix: "QT-",
        challanPrefix: "DC-",
        receiptPrefix: "RCPT-",
        termsAndConditions:
          "1. All dimensions must be verified before glass toughening.\n2. No claims for breakage after delivery.\n3. Toughened glass cannot be cut or altered after processing.\n4. Standard dimensional tolerance: ±2mm.\n5. 50% advance along with confirmed order.",
      };

      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        businessCompleted: false,
        business: defaultBusiness,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Google authentication successful.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        businessCompleted: user.businessCompleted,
        business: user.business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during Google authentication.",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
      error: error.message,
    });
  }
};

// @desc    Save/Update glass business details for the user
// @route   POST /api/auth/business
exports.saveBusinessDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const businessData = req.body;

    user.business = {
      ...(user.business ? user.business.toObject() : {}),
      ...businessData,
    };
    user.businessCompleted = true;
    await user.save();

    // Also update global Setting so existing invoices, reports and templates sync
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }
    if (businessData.companyName) setting.companyName = businessData.companyName;
    if (businessData.tagline) setting.tagline = businessData.tagline;
    if (businessData.phone) setting.phone = businessData.phone;
    if (businessData.email) setting.email = businessData.email;
    if (businessData.gstin) setting.gstin = businessData.gstin;
    if (businessData.pan) setting.pan = businessData.pan;
    if (businessData.address) setting.address = businessData.address;
    if (businessData.city) setting.city = businessData.city;
    if (businessData.state) setting.state = businessData.state;
    if (businessData.pincode) setting.pincode = businessData.pincode;
    if (businessData.bankName) setting.bankName = businessData.bankName;
    if (businessData.accountNumber) setting.accountNumber = businessData.accountNumber;
    if (businessData.ifscCode) setting.ifscCode = businessData.ifscCode;
    if (businessData.branch) setting.branch = businessData.branch;
    if (businessData.upiId) setting.upiId = businessData.upiId;
    if (businessData.defaultUnit) setting.defaultUnit = businessData.defaultUnit;
    if (businessData.minChargeableArea !== undefined) setting.minChargeableArea = businessData.minChargeableArea;
    if (businessData.roundDimensionsToInch !== undefined) setting.roundDimensionsToInch = businessData.roundDimensionsToInch;
    if (businessData.defaultGstRate !== undefined) setting.defaultGstRate = businessData.defaultGstRate;
    if (businessData.invoicePrefix) setting.invoicePrefix = businessData.invoicePrefix;
    if (businessData.estimatePrefix) setting.estimatePrefix = businessData.estimatePrefix;
    if (businessData.quotationPrefix) setting.quotationPrefix = businessData.quotationPrefix;
    if (businessData.challanPrefix) setting.challanPrefix = businessData.challanPrefix;
    if (businessData.receiptPrefix) setting.receiptPrefix = businessData.receiptPrefix;
    if (businessData.termsAndConditions) setting.termsAndConditions = businessData.termsAndConditions;
    await setting.save();

    res.json({
      success: true,
      message: "Glass business profile saved and software configured successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        businessCompleted: user.businessCompleted,
        business: user.business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save business details.",
      error: error.message,
    });
  }
};

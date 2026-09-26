const app = require("../server/src/app");
const connectDatabase = require("../server/src/config/database");

module.exports = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to connect to database or internal server error",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

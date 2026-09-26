const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");
const mongoose = require("mongoose");

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or server-to-server requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Glass Billing API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/rates", require("./routes/rateRoutes"));
app.use("/api/estimates", require("./routes/estimateRoutes"));
app.use("/api/quotations", require("./routes/quotationRoutes"));
app.use("/api/proforma-invoices", require("./routes/proformaRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/delivery-challans", require("./routes/challanRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));
app.use("/api/seed", require("./routes/seedRoutes"));

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Glass Billing SaaS API is running smoothly",
  });
});

app.get("/api/health", (req, res) => {
  const databaseState = mongoose.connection.readyState;

  const databaseStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const status = databaseStatus[databaseState] || "unknown";
  const isHealthy = databaseState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status: isHealthy ? "ok" : "degraded",
      service: "glass-billing-api",
      database: status,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = app;
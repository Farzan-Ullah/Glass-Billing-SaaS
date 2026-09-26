import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  FileText,
  IndianRupee,
  Users,
  Clock,
  Layers,
  Calculator,
  PlusCircle,
  Truck,
  ArrowUpRight,
  Receipt,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
} from "lucide-react";
import { reportService, invoiceService, productService, customerService } from "../services/dataService";
import { calculateGlassArea, calculatePerimeterRft, formatINR } from "../lib/glassCalculations";
import { useAuth } from "../contexts/AuthContext";
import { Building2, ShieldCheck, Edit3 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [products, setProducts] = useState([]);

  // Quick Calculator State
  const [calcWidth, setCalcWidth] = useState("36");
  const [calcHeight, setCalcHeight] = useState("84");
  const [calcUnit, setCalcUnit] = useState("inch");
  const [calcProductId, setCalcProductId] = useState("");
  const [calcPolish, setCalcPolish] = useState(true);
  const [calcQuantity, setCalcQuantity] = useState("1");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [repData, invData, prodData] = await Promise.all([
        reportService.getReports().catch(() => null),
        invoiceService.getAll().catch(() => []),
        productService.getAll().catch(() => []),
      ]);

      setReport(repData);
      setRecentInvoices(invData || []);
      setProducts(prodData || []);
      if (prodData && prodData.length > 0) {
        setCalcProductId(prodData[0]._id);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculator computations
  const selectedProduct = products.find((p) => p._id === calcProductId) || products[0];
  const { billableSqFt } = calculateGlassArea(calcWidth, calcHeight, calcUnit, selectedProduct?.minChargeableArea || 1.0);
  const qty = parseInt(calcQuantity) || 1;
  const totalArea = billableSqFt * qty;
  const glassRate = selectedProduct?.baseRate || 100;
  const glassAmount = totalArea * glassRate;
  const perimeterRft = calcPolish ? calculatePerimeterRft(calcWidth, calcHeight, calcUnit, 4) * qty : 0;
  const polishAmount = perimeterRft * 15; // default ₹15/rft
  const subtotal = glassAmount + polishAmount;
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  const summary = report?.summary || {
    totalSales: 69575,
    totalCollected: 36376,
    totalOutstanding: 135900,
    totalTax: 9881,
    totalSqFt: 864,
    totalInvoices: recentInvoices.length,
    activeCustomers: 5,
  };

  const stats = [
    {
      title: "Total Sales",
      value: formatINR(summary.totalSales),
      subtext: "Billed volume",
      icon: IndianRupee,
      color: "from-blue-600 to-indigo-700",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Glass Sold",
      value: `${summary.totalSqFt || 0} Sq.Ft`,
      subtext: "Area processed",
      icon: Layers,
      color: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Outstanding Dues",
      value: formatINR(summary.totalOutstanding),
      subtext: "Pending receivables",
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Active Customers",
      value: summary.activeCustomers?.toString() || "5",
      subtext: "Builders & architects",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const companyName = user?.business?.companyName || "Apex Glass & Architectural Glazing";
  const gstin = user?.business?.gstin || "27AABCU9603R1ZX";
  const defaultUnit = user?.business?.defaultUnit === "mm" ? "Millimeters (MM)" : 'Inches (")';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Welcome with Business Personalization */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-3 py-0.5 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/30">
                <Building2 size={13} />
                <span>{companyName}</span>
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-slate-300">
                GSTIN: {gstin}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                Unit: {defaultUnit}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Welcome back, {user?.name || "Business Owner"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your customized glass ERP workspace is active. Manage daily cutting orders, quotes, GST invoices, and delivery challans for <strong>{companyName}</strong>.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/setup"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition active:scale-95"
            >
              <Edit3 size={14} className="text-cyan-300" />
              <span>Edit Plant Profile</span>
            </Link>

            <button
              onClick={() => navigate("/estimates?create=true")}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition active:scale-95"
            >
              <Calculator size={14} className="text-cyan-300" />
              <span>New Estimate</span>
            </button>

            <button
              onClick={() => navigate("/invoices?create=true")}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition"
            >
              <PlusCircle size={15} />
              <span>Create Tax Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {stat.subtext}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} ${stat.textColor}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Live Glass Calculator & Recent Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Invoices & Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices Card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Tax Invoices</h2>
                <p className="text-xs text-gray-500">Latest billed orders and payment status</p>
              </div>
              <Link
                to="/invoices"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all ({recentInvoices.length})
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Balance Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInvoices.slice(0, 5).map((inv) => (
                    <tr key={inv._id || inv.invoiceNumber} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                        <Link to={`/invoices?view=${inv._id || inv.invoiceNumber}`} className="text-blue-600 hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{inv.customer?.name || "Customer"}</p>
                        <p className="text-xs text-gray-400">{inv.customer?.company || "Retail"}</p>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                        {formatINR(inv.grandTotal)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={inv.balanceDue > 0 ? "font-semibold text-rose-600" : "text-emerald-600 font-medium"}>
                          {formatINR(inv.balanceDue)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            inv.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inv.paymentStatus === "Partial"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {inv.paymentStatus === "Paid" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/invoices?view=${inv._id || inv.invoiceNumber}`)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="View / Print Tax Bill"
                        >
                          <Receipt size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                        No invoices generated yet. Click "Create Tax Invoice" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Glass Type Processing Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-2">Glass Sales by Category</h3>
            <p className="text-xs text-gray-500 mb-4">Area volume processed across glass types</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "Toughened Safety Glass", share: "45%", sqft: "388 Sq.Ft", color: "bg-blue-600" },
                { name: "Clear Float Glass", share: "35%", sqft: "302 Sq.Ft", color: "bg-cyan-500" },
                { name: "Belgian Mirrors", share: "12%", sqft: "104 Sq.Ft", color: "bg-indigo-500" },
                { name: "Laminated & Fluted", share: "8%", sqft: "70 Sq.Ft", color: "bg-teal-500" },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                    <span>{item.name}</span>
                    <span className="text-gray-900">{item.sqft}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.share }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Instant Glass Area & Cost Calculator */}
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Calculator size={16} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Quick Glass Calculator</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Instant dimension to Sq.Ft & rate estimate</p>

            <div className="space-y-3.5 text-xs">
              {/* Dimensions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">Dimensions</label>
                  <div className="flex rounded-md bg-gray-200/70 p-0.5 text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCalcUnit("inch")}
                      className={`px-2 py-0.5 rounded ${calcUnit === "inch" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600"}`}
                    >
                      Inches (")
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcUnit("mm")}
                      className={`px-2 py-0.5 rounded ${calcUnit === "mm" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600"}`}
                    >
                      MM
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400">Width</label>
                    <input
                      type="number"
                      value={calcWidth}
                      onChange={(e) => setCalcWidth(e.target.value)}
                      placeholder="e.g. 36"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Height</label>
                    <input
                      type="number"
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(e.target.value)}
                      placeholder="e.g. 84"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Glass Product Selection */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Glass Spec & Thickness</label>
                <select
                  value={calcProductId}
                  onChange={(e) => setCalcProductId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-blue-500"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (₹{p.baseRate}/sqft)
                    </option>
                  ))}
                  {products.length === 0 && (
                    <option value="">12mm Toughened Clear Glass (₹165/sqft)</option>
                  )}
                </select>
              </div>

              {/* Quantity & Edge Polish */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Edge Polish (4 Sides)</label>
                  <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcPolish}
                      onChange={(e) => setCalcPolish(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Flat Polish</span>
                  </label>
                </div>
              </div>

              {/* Calculation Summary Box */}
              <div className="mt-4 rounded-lg bg-blue-900 text-white p-3.5 space-y-2">
                <div className="flex justify-between text-xs text-blue-200">
                  <span>Chargeable Area:</span>
                  <span className="font-bold text-white">{totalArea.toFixed(2)} Sq.Ft</span>
                </div>
                {calcPolish && (
                  <div className="flex justify-between text-xs text-blue-200">
                    <span>Edge Polish (Rft):</span>
                    <span className="font-semibold text-white">{perimeterRft.toFixed(2)} Rft</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-blue-200">
                  <span>Glass Rate:</span>
                  <span>₹{glassRate} / Sq.Ft</span>
                </div>
                <div className="border-t border-blue-800 pt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-semibold text-blue-200">Est. Total (+18% GST)</span>
                  </div>
                  <span className="text-lg font-bold text-cyan-300">{formatINR(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/estimates?create=true&w=${calcWidth}&h=${calcHeight}&unit=${calcUnit}&prod=${calcProductId}&qty=${calcQuantity}&polish=${calcPolish}`
                  )
                }
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
              >
                <span>Generate Official Quote</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/customers"
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100 transition font-medium text-gray-700"
              >
                <Users size={16} className="text-blue-600" />
                <span>Customers</span>
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100 transition font-medium text-gray-700"
              >
                <Layers size={16} className="text-cyan-600" />
                <span>Glass Catalog</span>
              </Link>
              <Link
                to="/delivery-challans"
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100 transition font-medium text-gray-700"
              >
                <Truck size={16} className="text-amber-600" />
                <span>Challans</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:bg-gray-100 transition font-medium text-gray-700"
              >
                <Receipt size={16} className="text-emerald-600" />
                <span>GST Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

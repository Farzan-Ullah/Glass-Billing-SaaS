import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  CreditCard,
  Calculator,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
  Phone,
  Mail,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function BusinessSetup() {
  const navigate = useNavigate();
  const { user, saveBusiness } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: user?.business?.companyName || (user?.name ? `${user.name.split(" ")[0]}'s Glass Works` : "Apex Architectural Glass"),
    tagline: user?.business?.tagline || "Custom Toughened & Architectural Glazing Solutions",
    phone: user?.business?.phone || "+91 98200 12345",
    email: user?.business?.email || user?.email || "sales@apexglass.com",
    gstin: user?.business?.gstin || "27AABCU9603R1ZX",
    pan: user?.business?.pan || "AABCU9603R",
    address: user?.business?.address || "Plot 42, Glass Tech Industrial Area, Phase II",
    city: user?.business?.city || "Mumbai",
    state: user?.business?.state || "Maharashtra",
    pincode: user?.business?.pincode || "400093",
    bankName: user?.business?.bankName || "HDFC Bank Ltd",
    accountNumber: user?.business?.accountNumber || "50200088991122",
    ifscCode: user?.business?.ifscCode || "HDFC0000240",
    branch: user?.business?.branch || "Andheri East Industrial Branch",
    upiId: user?.business?.upiId || "apexglass@okhdfcbank",
    defaultUnit: user?.business?.defaultUnit || "inch",
    minChargeableArea: user?.business?.minChargeableArea || 1.0,
    roundDimensionsToInch: user?.business?.roundDimensionsToInch !== undefined ? user?.business?.roundDimensionsToInch : true,
    defaultGstRate: user?.business?.defaultGstRate || 18,
    invoicePrefix: user?.business?.invoicePrefix || "INV-",
    estimatePrefix: user?.business?.estimatePrefix || "EST-",
    quotationPrefix: user?.business?.quotationPrefix || "QT-",
    challanPrefix: user?.business?.challanPrefix || "DC-",
    receiptPrefix: user?.business?.receiptPrefix || "RCPT-",
    termsAndConditions:
      user?.business?.termsAndConditions ||
      "1. All dimensions must be verified by the customer before toughening.\n2. No claims for breakage after delivery.\n3. Toughened glass cannot be cut or altered after processing.\n4. Standard dimensional tolerance: ±2mm.\n5. 50% advance along with confirmed order.",
  });

  const handleFillDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      companyName: `${user?.name || "Premium"} Glass & Glazing Works`,
      tagline: "High Quality Tempered, DGU, Laminated & Frosted Glass",
      phone: "+91 98765 43210",
      gstin: "27AABCT8899P1Z8",
      pan: "AABCT8899P",
      address: "Survey 108, Glass Processing Hub, MIDC",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      bankName: "HDFC Bank Ltd",
      accountNumber: "50200099887766",
      ifscCode: "HDFC0000123",
      branch: "Main Branch",
      upiId: "glassplant@upi",
      defaultUnit: "inch",
      minChargeableArea: 1.0,
      roundDimensionsToInch: true,
      defaultGstRate: 18,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.companyName) {
      setError("Please provide a business or company name.");
      return;
    }

    try {
      setSaving(true);
      await saveBusiness(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Failed to save business details. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-white pb-16">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">CrystalGlass</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 ring-1 ring-cyan-500/30">
                  PLANT CONFIGURATION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Personalize Your Business Software</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFillDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50 transition active:scale-95"
            >
              <Zap size={14} className="text-cyan-400" />
              <span>Load Factory Defaults</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3 text-xs text-slate-400">
              <span>Signed in as:</span>
              <span className="font-semibold text-white">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 space-y-6">
        {/* Welcome & Explanatory Hero Card */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-xs font-semibold text-cyan-300">
                <Sparkles size={14} />
                <span>Step 2 of 2: Glass Business Details</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Customize Software for <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{formData.companyName || "Your Glass Company"}</span>
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Enter your company, factory address, GST credentials, and glass calculation preferences. Once saved, your entire dashboard, estimates, invoices, and challans will be generated with these exact business settings.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200">
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Company Profile */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">1. Company & Plant Profile</h2>
                <p className="text-[11px] text-slate-400">Printed as the primary billing header on all documents</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Business / Trading Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex Glass & Architectural Glazing"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Business Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Precision Toughened & Architectural Glass Works"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sales@yourglass.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  GSTIN Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="27AABCU9603R1ZX"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs font-mono uppercase text-cyan-300 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="AABCU9603R"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs font-mono uppercase text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">
                Plant / Factory Address
              </label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot #, Industrial Area, Near Highway..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="400093"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Banking & Payment */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <CreditCard size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">2. Banking & Digital UPI QR Details</h2>
                <p className="text-[11px] text-slate-400">Directly rendered at the bottom of customer invoices for fast NEFT / RTGS / UPI settlement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="50200012345678"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs font-mono text-emerald-400 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="HDFC0000240"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs font-mono uppercase text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="Andheri East Branch, Mumbai"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">UPI ID (VPA)</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="company@okhdfcbank"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Glass Calculation & Numbering Defaults */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Calculator size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">3. Glass Calculation & Document Prefixes</h2>
                <p className="text-[11px] text-slate-400">Controls automated cutting area rules and sequential numbering</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Primary Measurement Unit</label>
                <select
                  value={formData.defaultUnit}
                  onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="inch">Inches (")</option>
                  <option value="mm">Millimeters (MM)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Min Chargeable Area (Sq.Ft)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.minChargeableArea}
                  onChange={(e) => setFormData({ ...formData, minChargeableArea: parseFloat(e.target.value) || 1.0 })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Standard Glass GST Rate (%)</label>
                <input
                  type="number"
                  value={formData.defaultGstRate}
                  onChange={(e) => setFormData({ ...formData, defaultGstRate: parseFloat(e.target.value) || 18 })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roundDimensionsToInch}
                    onChange={(e) => setFormData({ ...formData, roundDimensionsToInch: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="font-medium text-slate-300 text-xs">Round fractional cuts to next inch</span>
                </label>
              </div>
            </div>

            {/* Document Number Prefixes */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-xs font-mono text-cyan-300 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Estimate Prefix</label>
                <input
                  type="text"
                  value={formData.estimatePrefix}
                  onChange={(e) => setFormData({ ...formData, estimatePrefix: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-xs font-mono text-cyan-300 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Quotation Prefix</label>
                <input
                  type="text"
                  value={formData.quotationPrefix}
                  onChange={(e) => setFormData({ ...formData, quotationPrefix: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-xs font-mono text-cyan-300 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Challan Prefix</label>
                <input
                  type="text"
                  value={formData.challanPrefix}
                  onChange={(e) => setFormData({ ...formData, challanPrefix: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-xs font-mono text-cyan-300 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Receipt Prefix</label>
                <input
                  type="text"
                  value={formData.receiptPrefix}
                  onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-xs font-mono text-cyan-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Terms & Conditions */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">4. Standard Terms & Conditions Preset</h2>
                <p className="text-[11px] text-slate-400">Automatically printed on your quotations, tax invoices, and job work orders</p>
              </div>
            </div>

            <textarea
              rows="4"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs font-mono leading-relaxed text-slate-300 outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Save Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>You can always update these parameters later in Business Settings.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all duration-150 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-60"
            >
              <span>{saving ? "Configuring Your Software..." : "Save Business & Launch Dashboard"}</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

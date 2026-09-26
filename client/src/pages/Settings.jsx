import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Building,
  CreditCard,
  Calculator,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { settingService } from "../services/dataService";

export default function Settings() {
  const { user, saveBusiness } = useAuth();
  const ub = user?.business || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: ub.companyName || "Apex Glass & Architectural Glazing",
    tagline: ub.tagline || "Precision Architectural & Toughened Glass Works",
    phone: ub.phone || "+91 98200 45678",
    email: ub.email || user?.email || "billing@glassplant.com",
    gstin: ub.gstin || "27AABCU9603R1ZX",
    pan: ub.pan || "AABCU9603R",
    address: ub.address || "Plot 42, Glass Tech Industrial Area, Phase II",
    city: ub.city || "Mumbai",
    state: ub.state || "Maharashtra",
    pincode: ub.pincode || "400093",
    bankName: ub.bankName || "HDFC Bank Ltd",
    accountNumber: ub.accountNumber || "50200088991122",
    ifscCode: ub.ifscCode || "HDFC0000240",
    branch: ub.branch || "Andheri East Industrial Branch",
    upiId: ub.upiId || "",
    defaultUnit: ub.defaultUnit || "inch",
    minChargeableArea: ub.minChargeableArea ?? 1.0,
    roundDimensionsToInch: ub.roundDimensionsToInch ?? true,
    defaultGstRate: ub.defaultGstRate ?? 18,
    invoicePrefix: ub.invoicePrefix || "INV-",
    estimatePrefix: ub.estimatePrefix || "EST-",
    quotationPrefix: ub.quotationPrefix || "QT-",
    challanPrefix: ub.challanPrefix || "DC-",
    receiptPrefix: ub.receiptPrefix || "RCPT-",
    termsAndConditions:
      ub.termsAndConditions ||
      "1. All dimensions must be confirmed in writing or template approval before cutting/toughening.\n2. No cancellation once glass is processed in furnace.\n3. Breaking during transport or site installation is at buyer's risk unless transit insurance is billed.\n4. Standard tolerance ±2mm on CNC cutting.\n5. Payment strictly 50% advance, balance on delivery.",
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingService.getSettings();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          ...data,
          ...(user?.business || {}),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingService.updateSettings(formData);
      if (saveBusiness) {
        await saveBusiness(formData);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Business Settings & System Defaults
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure company branding, GST numbers, bank accounts, and glass calculation rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 w-fit"
        >
          {savedSuccess ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
          <span>{savedSuccess ? "Saved Successfully!" : saving ? "Saving..." : "Save All Changes"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company Profile Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Company & Plant Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Company / Trading Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Tagline / Business Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">GSTIN Number *</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Plant / Office Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bank & UPI Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard size={18} className="text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">Banking & UPI Payment Instructions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank Ltd"
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="50200012345678"
                className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                placeholder="HDFC0000123"
                className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Sakinaka Branch, Mumbai"
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">UPI ID (VPA)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="crystalglass@okhdfcbank"
                className="w-full rounded-lg border border-gray-200 p-2 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Glass Calculation & Billing Defaults */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Calculator size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Glass Calculation & Document Prefixes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Default Dimension Unit</label>
              <select
                value={formData.defaultUnit}
                onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              >
                <option value="inch">Inches (")</option>
                <option value="mm">Millimeters (MM)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Min Billable Area (Sq.Ft)</label>
              <input
                type="number"
                step="0.1"
                value={formData.minChargeableArea}
                onChange={(e) => setFormData({ ...formData, minChargeableArea: parseFloat(e.target.value) || 1.0 })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Standard GST Rate (%)</label>
              <input
                type="number"
                value={formData.defaultGstRate}
                onChange={(e) => setFormData({ ...formData, defaultGstRate: parseFloat(e.target.value) || 18 })}
                className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.roundDimensionsToInch}
                  onChange={(e) => setFormData({ ...formData, roundDimensionsToInch: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="font-semibold text-gray-700">Round up to next inch</span>
              </label>
            </div>
          </div>

          {/* Prefixes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full rounded-md border border-gray-200 p-1.5 text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Estimate Prefix</label>
              <input
                type="text"
                value={formData.estimatePrefix}
                onChange={(e) => setFormData({ ...formData, estimatePrefix: e.target.value })}
                className="w-full rounded-md border border-gray-200 p-1.5 text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Quotation Prefix</label>
              <input
                type="text"
                value={formData.quotationPrefix}
                onChange={(e) => setFormData({ ...formData, quotationPrefix: e.target.value })}
                className="w-full rounded-md border border-gray-200 p-1.5 text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Challan Prefix</label>
              <input
                type="text"
                value={formData.challanPrefix}
                onChange={(e) => setFormData({ ...formData, challanPrefix: e.target.value })}
                className="w-full rounded-md border border-gray-200 p-1.5 text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Receipt Prefix</label>
              <input
                type="text"
                value={formData.receiptPrefix}
                onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                className="w-full rounded-md border border-gray-200 p-1.5 text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Standard Terms & Conditions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText size={18} className="text-amber-600" />
            <h2 className="text-base font-bold text-gray-900">Standard Terms & Conditions Presets</h2>
          </div>
          <p className="text-xs text-gray-500">
            These terms will automatically be printed on all Quotations, Estimates, and Tax Invoices.
          </p>

          <textarea
            rows="5"
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            className="w-full rounded-lg border border-gray-200 p-3 text-xs font-mono leading-relaxed outline-none focus:border-blue-500"
          />
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          >
            {savedSuccess ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
            <span>{savedSuccess ? "Saved Successfully!" : saving ? "Saving Settings..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
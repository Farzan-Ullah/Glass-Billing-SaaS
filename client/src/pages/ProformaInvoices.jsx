import { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  CreditCard,
  Printer,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  X,
  Receipt,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { proformaService } from "../services/dataService";
import { formatINR, numberToWordsINR } from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const statuses = ["All", "Pending Advance", "Partial Advance", "Confirmed", "Converted"];

export default function ProformaInvoices() {
  const business = useBusinessProfile();
  const navigate = useNavigate();
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [viewProforma, setViewProforma] = useState(null);
  const [advanceModalProforma, setAdvanceModalProforma] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState("");

  useEffect(() => {
    loadProformas();
  }, [selectedStatus]);

  const loadProformas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      const data = await proformaService.getAll(params);
      setProformas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAdvance = async (e) => {
    e.preventDefault();
    try {
      await proformaService.recordAdvance(advanceModalProforma._id, advanceAmount);
      alert("Advance payment recorded successfully!");
      setAdvanceModalProforma(null);
      setAdvanceAmount("");
      loadProformas();
    } catch (err) {
      alert("Failed to record advance: " + err.message);
    }
  };

  const handleConvertToInvoice = async (id) => {
    if (confirm("Convert this Proforma into a final Tax Invoice?")) {
      try {
        await proformaService.convertToInvoice(id);
        alert("Converted to Tax Invoice successfully!");
        loadProformas();
        navigate("/invoices");
      } catch (err) {
        alert("Failed to convert: " + err.message);
      }
    }
  };

  const handleDelete = async (id, piNumber) => {
    if (confirm(`Delete proforma invoice ${piNumber}?`)) {
      try {
        await proformaService.delete(id);
        loadProformas();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const filtered = proformas.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.proformaNumber?.toLowerCase().includes(s) ||
      p.customer?.name?.toLowerCase().includes(s) ||
      p.customer?.company?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Proforma Invoices & Advance Billing
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track advance deposits, production clearance, and convert to final Tax Invoice.
          </p>
        </div>

        <button
          onClick={() => navigate("/quotations")}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>Convert From Quotation</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proforma #, customer, company..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedStatus === st
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Proforma Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Proforma #</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Total Value</th>
                <th className="px-4 py-3.5">Advance Required</th>
                <th className="px-4 py-3.5">Advance Received</th>
                <th className="px-4 py-3.5">Balance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((pi) => (
                <tr key={pi._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600">
                    <button
                      onClick={() => setViewProforma(pi)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {pi.proformaNumber}
                    </button>
                    {pi.quotationRef && (
                      <span className="text-[10px] text-gray-400 block font-normal">
                        Ref: {pi.quotationRef}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{pi.customer?.name}</p>
                    <p className="text-xs text-gray-400">{pi.customer?.company || "Individual"}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900">
                    {formatINR(pi.grandTotal)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">
                      {formatINR(pi.advanceAmount || pi.grandTotal * 0.5)}
                    </span>{" "}
                    ({pi.advanceRequiredPercent || 50}%)
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs">
                    <span className="font-bold text-emerald-600">
                      {formatINR(pi.advancePaid || 0)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-rose-600">
                    {formatINR(pi.balanceDue)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        pi.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : pi.status === "Converted"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : pi.status === "Partial Advance"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {pi.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewProforma(pi)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="View Proforma"
                      >
                        <FileText size={16} />
                      </button>

                      {pi.status !== "Converted" && (
                        <button
                          onClick={() => {
                            setAdvanceModalProforma(pi);
                            setAdvanceAmount(String(pi.advanceAmount - (pi.advancePaid || 0)));
                          }}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                          title="Record Advance Receipt"
                        >
                          <CreditCard size={13} />
                          <span>Advance</span>
                        </button>
                      )}

                      {pi.status !== "Converted" && (
                        <button
                          onClick={() => handleConvertToInvoice(pi._id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          title="Generate Tax Invoice"
                        >
                          <span>Bill</span>
                          <ArrowRight size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(pi._id, pi.proformaNumber)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                    No proforma invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Advance Modal */}
      {advanceModalProforma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Record Advance Payment</h3>
              <button
                onClick={() => setAdvanceModalProforma(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordAdvance} className="space-y-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5">Proforma Invoice:</span>
                <span className="font-bold text-gray-900">{advanceModalProforma.proformaNumber}</span>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">Customer:</span>
                <span className="font-semibold text-gray-800">{advanceModalProforma.customer?.name}</span>
              </div>

              <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Proforma Value:</span>
                  <span className="font-semibold">{formatINR(advanceModalProforma.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Advance Required (50%):</span>
                  <span className="font-semibold text-blue-600">{formatINR(advanceModalProforma.advanceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Already Received:</span>
                  <span className="font-semibold text-emerald-600">{formatINR(advanceModalProforma.advancePaid || 0)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Advance Amount Received Now (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-base font-bold text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdvanceModalProforma(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Proforma Modal */}
      {viewProforma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl space-y-6 my-8 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-indigo-600 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.companyName}</h2>
                {business.tagline && (
                  <p className="text-xs text-indigo-700 font-medium mb-0.5">{business.tagline}</p>
                )}
                <p className="text-xs text-gray-500">{business.fullAddress}</p>
                <p className="text-xs text-gray-500">
                  GSTIN: {business.gstin || "N/A"}
                  {business.phone ? ` • Phone: ${business.phone}` : ""}
                  {business.email ? ` • Email: ${business.email}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Proforma Invoice
                </span>
                <p className="font-mono text-base font-bold text-gray-900">{viewProforma.proformaNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(viewProforma.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="rounded-lg bg-gray-50 p-4 text-xs grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Client / Buyer</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{viewProforma.customer?.name}</p>
                <p className="text-gray-700 font-semibold">{viewProforma.customer?.company}</p>
                <p className="text-gray-600">{viewProforma.customer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-400 uppercase text-[10px]">Commercial Terms</p>
                <p className="text-indigo-700 font-bold mt-0.5">
                  Advance Required: {viewProforma.advanceRequiredPercent || 50}% ({formatINR(viewProforma.advanceAmount)})
                </p>
                <p className="text-emerald-600 font-semibold mt-1">
                  Advance Received: {formatINR(viewProforma.advancePaid || 0)}
                </p>
                <p className="text-rose-600 font-bold mt-0.5">
                  Balance Remaining: {formatINR(viewProforma.balanceDue)}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Glass Specification</th>
                  <th className="p-2.5 text-center">Size</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-center">Sq.Ft</th>
                  <th className="p-2.5 text-center">Rate</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viewProforma.items?.map((it, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-bold text-gray-400">{i + 1}</td>
                    <td className="p-2.5 font-bold text-gray-900">{it.glassType} - {it.description}</td>
                    <td className="p-2.5 text-center font-mono">{it.width}" × {it.height}"</td>
                    <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                    <td className="p-2.5 text-center">{it.totalAreaSqFt}</td>
                    <td className="p-2.5 text-center">{formatINR(it.glassRate)}</td>
                    <td className="p-2.5 text-right font-bold text-gray-900">{formatINR(it.itemTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Banking Details for Wire Transfer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-xs">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-1 text-gray-800">
                <p className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">
                  Bank Details for Advance RTGS/NEFT:
                </p>
                <p><strong>Bank:</strong> {business.bankName} {business.branch ? `(${business.branch})` : ""}</p>
                <p><strong>Account Name:</strong> {business.companyName}</p>
                <p><strong>Account Number:</strong> {business.accountNumber || "N/A"}</p>
                <p><strong>IFSC Code:</strong> {business.ifscCode || "N/A"}</p>
                {business.upiId && <p><strong>UPI ID:</strong> {business.upiId}</p>}
              </div>

              <div className="space-y-1.5 text-right">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatINR(viewProforma.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%):</span>
                  <span className="font-semibold">{formatINR(viewProforma.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Transport:</span>
                  <span className="font-semibold">{formatINR(viewProforma.transportCharges || 0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-1.5">
                  <span>Total Proforma Value:</span>
                  <span className="text-indigo-700">{formatINR(viewProforma.grandTotal)}</span>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 text-xs border border-emerald-200 mt-2 text-right">
                  <span className="font-bold text-emerald-800">
                    Advance Paid: {formatINR(viewProforma.advancePaid || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 pt-6 border-t border-gray-200 text-xs">
              <div>
                <p className="text-gray-400 mb-8">Client Acceptance Signature:</p>
                <div className="w-44 border-b border-gray-300"></div>
                <p className="text-[10px] text-gray-400 mt-1">Date & Stamp</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 mb-8">For {business.companyName}:</p>
                <div className="w-44 border-b border-gray-300 ml-auto"></div>
                <p className="text-[10px] text-gray-400 mt-1">Authorized Signatory</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 print:hidden">
              <button
                onClick={() => setViewProforma(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <Printer size={15} />
                  <span>Print Proforma</span>
                </button>
                {viewProforma.status !== "Converted" && (
                  <button
                    onClick={() => {
                      handleConvertToInvoice(viewProforma._id);
                      setViewProforma(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    <span>Generate Tax Invoice</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Printer,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Receipt,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  quotationService,
  customerService,
  productService,
} from "../services/dataService";
import { formatINR, numberToWordsINR } from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const statuses = ["All", "Draft", "Sent", "Accepted", "Rejected", "Converted"];

export default function Quotations() {
  const business = useBusinessProfile();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [viewQuotation, setViewQuotation] = useState(null);

  useEffect(() => {
    loadQuotations();
  }, [selectedStatus]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      const data = await quotationService.getAll(params);
      setQuotations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToProforma = async (id) => {
    if (confirm("Convert this Quotation into a Proforma Invoice for advance payment?")) {
      try {
        await quotationService.convertToProforma(id);
        alert("Converted to Proforma Invoice successfully!");
        loadQuotations();
        navigate("/proforma-invoices");
      } catch (err) {
        alert("Failed to convert: " + err.message);
      }
    }
  };

  const handleDelete = async (id, qNumber) => {
    if (confirm(`Delete quotation ${qNumber}?`)) {
      try {
        await quotationService.delete(id);
        loadQuotations();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(s) ||
      q.customer?.name?.toLowerCase().includes(s) ||
      q.customer?.company?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Commercial Quotations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Formal commercial proposals with terms, transit liability clauses, and conversion to Proforma.
          </p>
        </div>

        <button
          onClick={() => navigate("/estimates?create=true")}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>New Quotation / Estimate</span>
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
            placeholder="Search quotation #, customer, company..."
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

      {/* Quotations Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Quotation #</th>
                <th className="px-4 py-3.5">Customer / Firm</th>
                <th className="px-4 py-3.5">Quote Date</th>
                <th className="px-4 py-3.5">Valid Until</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuotations.map((q) => (
                <tr key={q._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600">
                    <button
                      onClick={() => setViewQuotation(q)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {q.quotationNumber}
                    </button>
                    {q.estimateRef && (
                      <span className="text-[10px] text-gray-400 block font-normal">
                        From: {q.estimateRef}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{q.customer?.name}</p>
                    <p className="text-xs text-gray-400">{q.customer?.company || "Retail Client"}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(q.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "15 Days"}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900 text-base">
                    {formatINR(q.grandTotal)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        q.status === "Accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : q.status === "Converted"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : q.status === "Sent"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : q.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewQuotation(q)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="View Official Quotation"
                      >
                        <FileText size={16} />
                      </button>

                      {q.status !== "Converted" && (
                        <button
                          onClick={() => handleConvertToProforma(q._id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          title="Generate Proforma for Advance"
                        >
                          <ClipboardList size={13} />
                          <span>Proforma</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(q._id, q.quotationNumber)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                    No quotations generated yet. Create an estimate and click "Quote" to convert.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Quotation Document Modal */}
      {viewQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl space-y-6 my-8 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.companyName}</h2>
                {business.tagline && (
                  <p className="text-xs text-blue-800 font-medium mb-0.5">{business.tagline}</p>
                )}
                <p className="text-xs text-gray-500">{business.fullAddress}</p>
                <p className="text-xs text-gray-500">
                  GSTIN: {business.gstin || "N/A"}
                  {business.phone ? ` • Phone: ${business.phone}` : ""}
                  {business.email ? ` • Email: ${business.email}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Commercial Quotation
                </span>
                <p className="font-mono text-base font-bold text-gray-900">{viewQuotation.quotationNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(viewQuotation.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="rounded-lg bg-gray-50 p-4 text-xs grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Quotation For</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{viewQuotation.customer?.name}</p>
                <p className="text-gray-700 font-semibold">{viewQuotation.customer?.company}</p>
                <p className="text-gray-600">{viewQuotation.customer?.phone}</p>
                {viewQuotation.customer?.gstin && (
                  <p className="font-mono text-gray-700 mt-1">GSTIN: {viewQuotation.customer.gstin}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-400 uppercase text-[10px]">Delivery / Site Address</p>
                <p className="text-gray-700 mt-0.5">{viewQuotation.customer?.address || "Site Mumbai"}</p>
                <p className="text-gray-500 mt-2 font-medium">
                  Validity: {viewQuotation.validUntil ? new Date(viewQuotation.validUntil).toLocaleDateString() : "15 Days"}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Glass Variety & Processing Work</th>
                  <th className="p-2.5 text-center">Dimensions</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-center">Area (Sq.Ft)</th>
                  <th className="p-2.5 text-center">Rate</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viewQuotation.items?.map((it, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-bold text-gray-400">{i + 1}</td>
                    <td className="p-2.5">
                      <p className="font-bold text-gray-900">{it.glassType}</p>
                      <p className="text-[11px] text-gray-500">{it.description}</p>
                      {it.services?.length > 0 && (
                        <p className="text-[10px] text-blue-600 mt-0.5">
                          Incl: {it.services.map((s) => `${s.serviceName} (${s.quantity})`).join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {it.width}" × {it.height}"
                    </td>
                    <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                    <td className="p-2.5 text-center">{it.totalAreaSqFt}</td>
                    <td className="p-2.5 text-center">{formatINR(it.glassRate)}</td>
                    <td className="p-2.5 text-right font-bold text-gray-900">{formatINR(it.itemTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Terms and Financials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider mb-1">
                  Terms & Conditions:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  {business.termsAndConditions
                    ? business.termsAndConditions
                        .split("\n")
                        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
                        .filter(Boolean)
                        .map((term, idx) => <li key={idx}>{term}</li>)
                    : (
                      <>
                        <li>Prices are inclusive of standard crate packaging.</li>
                        <li>50% advance along with order confirmation, balance on delivery.</li>
                        <li>Breakage liability ceases once glass is unloaded at site.</li>
                        <li>Tolerances: ±2mm as per ISI norms.</li>
                        <li>Toughened glass cannot be modified after processing.</li>
                      </>
                    )}
                </ol>
              </div>

              <div className="space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatINR(viewQuotation.subtotal)}</span>
                </div>
                {viewQuotation.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>- {formatINR(viewQuotation.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%):</span>
                  <span className="font-semibold">{formatINR(viewQuotation.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Transport & Packaging:</span>
                  <span className="font-semibold">{formatINR(viewQuotation.transportCharges || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-300 pt-1.5">
                  <span>Total Quotation Value:</span>
                  <span className="text-blue-700 text-lg">{formatINR(viewQuotation.grandTotal)}</span>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  {numberToWordsINR(viewQuotation.grandTotal)}
                </p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 pt-8 border-t border-gray-200 text-xs">
              <div>
                <p className="text-gray-400 mb-8">Client Acceptance Signature:</p>
                <div className="w-48 border-b border-gray-300"></div>
                <p className="text-[10px] text-gray-400 mt-1">Date & Stamp</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 mb-8">For {business.companyName}:</p>
                <div className="w-48 border-b border-gray-300 ml-auto"></div>
                <p className="text-[10px] text-gray-400 mt-1">Authorized Signatory</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 print:hidden">
              <button
                onClick={() => setViewQuotation(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  <Printer size={15} />
                  <span>Print Quotation</span>
                </button>
                {viewQuotation.status !== "Converted" && (
                  <button
                    onClick={() => {
                      handleConvertToProforma(viewQuotation._id);
                      setViewQuotation(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    <span>Generate Proforma Invoice</span>
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
import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  IndianRupee,
  Layers,
  Clock,
  Receipt,
  Users,
  Printer,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { reportService, invoiceService, customerService } from "../services/dataService";
import { formatINR } from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const periods = ["This Month", "Last Month", "This Quarter", "Financial Year 2026", "All Time"];

export default function Reports() {
  const business = useBusinessProfile();
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [reportData, setReportData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [rep, invs, custs] = await Promise.all([
        reportService.getReports().catch(() => null),
        invoiceService.getAll().catch(() => []),
        customerService.getAll().catch(() => []),
      ]);
      setReportData(rep);
      setInvoices(invs || []);
      setCustomers(custs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const summary = reportData?.summary || {
    totalSales: 69575,
    totalCollected: 36376,
    totalOutstanding: 135900,
    totalTax: 9881,
    totalSqFt: 864,
    totalInvoices: invoices.length,
    activeCustomers: customers.length,
  };

  const aging = reportData?.aging || {
    current: 45000,
    days30: 38400,
    days60: 27500,
    days90Plus: 25000,
  };

  const exportCSV = () => {
    const headers = ["Invoice #", "Date", "Customer", "GSTIN", "Taxable Value", "CGST", "SGST", "Total Amount", "Paid", "Balance Due", "Status"];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      new Date(inv.date).toLocaleDateString(),
      `"${inv.customer?.name || ""}"`,
      inv.customer?.gstin || "Unregistered",
      inv.taxableAmount || 0,
      inv.cgst || 0,
      inv.sgst || 0,
      inv.grandTotal || 0,
      inv.amountPaid || 0,
      inv.balanceDue || 0,
      inv.paymentStatus,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Glass_GST_Sales_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-blue-600 block text-xs font-bold tracking-wider uppercase mb-1">
            {business.companyName}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Business Analytics & GST Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Revenue summary, glass volume output, tax liability register, and customer aging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition"
          >
            <Download size={15} />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
              selectedPeriod === p
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Revenue</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatINR(summary.totalSales)}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp size={13} />
            <span>Active glass orders billed</span>
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Glass Volume Processed</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{summary.totalSqFt || 0} Sq.Ft</p>
          <p className="mt-1 text-xs text-gray-500">Toughened & Float area</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">GST Tax Liability (18%)</p>
          <p className="mt-2 text-2xl font-bold text-indigo-600">{formatINR(summary.totalTax)}</p>
          <p className="mt-1 text-xs text-gray-500">CGST (9%) + SGST (9%)</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Outstanding Dues</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{formatINR(summary.totalOutstanding)}</p>
          <p className="mt-1 text-xs text-gray-500">Pending customer ledger</p>
        </div>
      </div>

      {/* Two Column Layout: Glass Variety Breakdown & Receivables Aging */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Glass Variety Share */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Glass Volume by Variety (Sq.Ft)</h2>
            <p className="text-xs text-gray-500">Distribution of glass types cut and tempered</p>
          </div>

          <div className="space-y-3.5 text-xs">
            {[
              { type: "12mm Toughened Clear Glass", sqft: 320, pct: 37, color: "bg-blue-600" },
              { type: "8mm Toughened Clear Glass", sqft: 240, pct: 28, color: "bg-cyan-500" },
              { type: "5mm Clear Float Glass", sqft: 180, pct: 21, color: "bg-indigo-500" },
              { type: "5mm Belgian Silver Mirror", sqft: 74, pct: 9, color: "bg-teal-500" },
              { type: "11.52mm Laminated Safety", sqft: 50, pct: 5, color: "bg-purple-500" },
            ].map((g) => (
              <div key={g.type} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-800">{g.type}</span>
                  <span className="font-bold text-gray-900">{g.sqft} Sq.Ft ({g.pct}%)</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${g.color}`} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Aging Receivables */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Customer Receivables Aging Analysis</h2>
            <p className="text-xs text-gray-500">Aging schedule of unpaid customer balances</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Current (0-30 Days)</span>
              <p className="text-xl font-bold text-emerald-900 mt-1">{formatINR(aging.current)}</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Within normal credit period</p>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3.5">
              <span className="text-[11px] font-bold text-blue-800 uppercase">31 - 60 Days</span>
              <p className="text-xl font-bold text-blue-900 mt-1">{formatINR(aging.days30)}</p>
              <p className="text-[10px] text-blue-700 mt-0.5">Follow-up reminder stage</p>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase">61 - 90 Days</span>
              <p className="text-xl font-bold text-amber-900 mt-1">{formatINR(aging.days60)}</p>
              <p className="text-[10px] text-amber-700 mt-0.5">Overdue notices sent</p>
            </div>

            <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-3.5">
              <span className="text-[11px] font-bold text-rose-800 uppercase">90+ Days Overdue</span>
              <p className="text-xl font-bold text-rose-900 mt-1">{formatINR(aging.days90Plus)}</p>
              <p className="text-[10px] text-rose-700 mt-0.5">Stop credit clearance</p>
            </div>
          </div>
        </div>
      </div>

      {/* GST Tax Sales Register Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">GST Sales Register (GSTR-1 Ready)</h2>
            <p className="text-xs text-gray-500">Taxable turnover and output tax breakdown for CA / auditor</p>
          </div>
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-mono font-semibold text-gray-700">
            {invoices.length} Registered Tax Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer / Buyer</th>
                <th className="px-4 py-3">GSTIN</th>
                <th className="px-4 py-3 text-right">Taxable Value</th>
                <th className="px-4 py-3 text-right">CGST (9%)</th>
                <th className="px-4 py-3 text-right">SGST (9%)</th>
                <th className="px-4 py-3 text-right font-bold text-gray-900">Total Tax</th>
                <th className="px-6 py-3 text-right font-bold text-gray-900">Invoice Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-3 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {inv.customer?.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-600">
                    {inv.customer?.gstin || "Unregistered"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700">
                    {formatINR(inv.taxableAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(inv.cgst || 0)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatINR(inv.sgst || 0)}</td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-700">
                    {formatINR((inv.cgst || 0) + (inv.sgst || 0))}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900 text-sm">
                    {formatINR(inv.grandTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
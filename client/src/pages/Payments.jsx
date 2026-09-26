import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Trash2,
  X,
  CheckCircle2,
  IndianRupee,
  FileText,
  Calendar,
  Building,
} from "lucide-react";
import {
  paymentService,
  customerService,
  invoiceService,
} from "../services/dataService";
import { formatINR, numberToWordsINR } from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const paymentMethods = ["All", "UPI", "NEFT/RTGS", "Cash", "Cheque", "Card"];

export default function Payments() {
  const business = useBusinessProfile();
  const [searchParams] = useSearchParams();

  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All");

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadPayments();
  }, [selectedMethod]);

  useEffect(() => {
    if (searchParams.get("record") === "true") {
      const custParam = searchParams.get("customer");
      if (custParam) setCustomerId(custParam);
      setRecordModalOpen(true);
    }
  }, [searchParams]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMethod !== "All") params.paymentMethod = selectedMethod;
      const [payData, custData, invData] = await Promise.all([
        paymentService.getAll(params),
        customerService.getAll(),
        invoiceService.getAll(),
      ]);
      setPayments(payData || []);
      setCustomers(custData || []);
      setInvoices(invData || []);
      if (custData && custData.length > 0 && !customerId) {
        setCustomerId(custData[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (id) => {
    setCustomerId(id);
    const unpaidInvs = invoices.filter((i) => i.customer?.id === id && i.balanceDue > 0);
    if (unpaidInvs.length > 0) {
      setInvoiceId(unpaidInvs[0]._id);
      setInvoiceNumber(unpaidInvs[0].invoiceNumber);
      setAmount(String(unpaidInvs[0].balanceDue));
    } else {
      setInvoiceId("");
      setInvoiceNumber("");
      setAmount("");
    }
  };

  const handleInvoiceChange = (invId) => {
    setInvoiceId(invId);
    const found = invoices.find((i) => i._id === invId);
    if (found) {
      setInvoiceNumber(found.invoiceNumber);
      setAmount(String(found.balanceDue));
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const selectedCustomer = customers.find((c) => c._id === customerId);
      if (!selectedCustomer) {
        alert("Please select a customer.");
        return;
      }

      const payload = {
        customer: {
          id: selectedCustomer._id,
          name: selectedCustomer.name,
          company: selectedCustomer.company,
        },
        invoiceId: invoiceId || undefined,
        invoiceNumber: invoiceNumber || undefined,
        amount: Number(amount),
        paymentMethod,
        referenceNumber,
        notes,
        date: new Date(paymentDate),
      };

      const newPay = await paymentService.create(payload);
      alert("Payment recorded successfully!");
      setRecordModalOpen(false);
      loadPayments();
      setViewPayment(newPay);
    } catch (err) {
      alert("Failed to record payment: " + err.message);
    }
  };

  const handleDelete = async (id, rcptNum) => {
    if (confirm(`Delete payment receipt ${rcptNum}? This will revert invoice balance and customer balance.`)) {
      try {
        await paymentService.delete(id);
        loadPayments();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const upiCollected = payments.filter((p) => p.paymentMethod === "UPI").reduce((sum, p) => sum + (p.amount || 0), 0);
  const bankCollected = payments.filter((p) => p.paymentMethod === "NEFT/RTGS").reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashCollected = payments.filter((p) => p.paymentMethod === "Cash").reduce((sum, p) => sum + (p.amount || 0), 0);

  const filtered = payments.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.receiptNumber?.toLowerCase().includes(s) ||
      p.customer?.name?.toLowerCase().includes(s) ||
      p.customer?.company?.toLowerCase().includes(s) ||
      p.invoiceNumber?.toLowerCase().includes(s) ||
      p.referenceNumber?.toLowerCase().includes(s)
    );
  });

  const selectedCustomerObj = customers.find((c) => c._id === customerId);
  const customerUnpaidInvoices = invoices.filter(
    (i) => i.customer?.id === customerId && i.balanceDue > 0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Payment Receipts & Ledger
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Log collections, reconcile client balances, and generate printable payment vouchers.
          </p>
        </div>

        <button
          onClick={() => {
            if (customers.length > 0 && !customerId) {
              handleCustomerChange(customers[0]._id);
            }
            setRecordModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Collected</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatINR(totalCollected)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{payments.length} receipts logged</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase">UPI / Online</p>
          <p className="mt-1 text-xl font-bold text-blue-600">{formatINR(upiCollected)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Instant settlement</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase">NEFT / RTGS Wire</p>
          <p className="mt-1 text-xl font-bold text-indigo-600">{formatINR(bankCollected)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Corporate accounts</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase">Cash & Cheque</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{formatINR(cashCollected)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Retail counter receipts</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, customer, invoice #, UTR..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {paymentMethods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMethod(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedMethod === m
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Receipt #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Linked Invoice</th>
                <th className="px-4 py-3.5">Amount Paid</th>
                <th className="px-4 py-3.5">Mode</th>
                <th className="px-4 py-3.5">Reference / UTR</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((pay) => (
                <tr key={pay._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600 whitespace-nowrap">
                    <button
                      onClick={() => setViewPayment(pay)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {pay.receiptNumber}
                    </button>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(pay.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{pay.customer?.name}</p>
                    <p className="text-xs text-gray-400">{pay.customer?.company || "Retail"}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs font-mono">
                    {pay.invoiceNumber ? (
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-semibold">
                        {pay.invoiceNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Account Credit</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap font-bold text-emerald-600 text-base">
                    {formatINR(pay.amount)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        pay.paymentMethod === "UPI"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : pay.paymentMethod === "NEFT/RTGS"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : pay.paymentMethod === "Cash"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pay.paymentMethod}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                    {pay.referenceNumber || "-"}
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewPayment(pay)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="Print Payment Voucher"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pay._id, pay.receiptNumber)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete Payment"
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
                    No payment records found. Click "Record New Payment" to log collections.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Record Client Payment</h3>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Customer / Client *</label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.company ? `(${c.company})` : ""} - Due: {formatINR(c.balance || 0)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerObj && (
                <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-100 flex justify-between items-center text-xs">
                  <span className="text-blue-900 font-medium">Customer Current Due:</span>
                  <span className="font-bold text-rose-600 text-sm">
                    {formatINR(selectedCustomerObj.balance || 0)}
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Linked Invoice (Optional)</label>
                <select
                  value={invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-blue-500"
                >
                  <option value="">General Account Settlement</option>
                  {customerUnpaidInvoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - Total: {formatINR(inv.grandTotal)} (Due: {formatINR(inv.balanceDue)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Reference / UTR #</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UPI/2349008812"
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Remarks / Ledger Note</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received via PhonePe against railing invoice"
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Record Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Payment Voucher Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl space-y-5 my-8 print:shadow-none print:p-0">
            <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{business.companyName}</h2>
                {business.tagline && (
                  <p className="text-xs text-emerald-800 font-medium mb-0.5">{business.tagline}</p>
                )}
                <p className="text-xs text-gray-500">{business.fullAddress}</p>
                <p className="text-xs text-gray-500">
                  GSTIN: {business.gstin || "N/A"}
                  {business.phone ? ` • Phone: ${business.phone}` : ""}
                  {business.email ? ` • Email: ${business.email}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Payment Receipt
                </span>
                <p className="font-mono text-base font-bold text-gray-900">{viewPayment.receiptNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(viewPayment.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-xs space-y-2.5 border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-500">Received From:</span>
                <span className="font-bold text-gray-900 text-sm">
                  {viewPayment.customer?.name} {viewPayment.customer?.company ? `(${viewPayment.customer.company})` : ""}
                </span>
              </div>
              {viewPayment.invoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Against Invoice:</span>
                  <span className="font-mono font-semibold text-blue-700">{viewPayment.invoiceNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-semibold text-gray-800">{viewPayment.paymentMethod}</span>
              </div>
              {viewPayment.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Ref / UTR:</span>
                  <span className="font-mono font-semibold text-gray-800">{viewPayment.referenceNumber}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-gray-800 text-sm">Amount Received:</span>
                <span className="text-2xl font-bold text-emerald-700">{formatINR(viewPayment.amount)}</span>
              </div>
              <p className="text-[11px] text-gray-500 italic text-right">
                {numberToWordsINR(viewPayment.amount)}
              </p>
            </div>

            {viewPayment.notes && (
              <p className="text-xs text-gray-500 italic">
                Note: {viewPayment.notes}
              </p>
            )}

            <div className="flex justify-between items-end pt-8 border-t border-gray-200 text-xs">
              <p className="text-gray-400">Thank you for your business!</p>
              <div className="text-right">
                <p className="text-gray-400 mb-6">For {business.companyName}:</p>
                <div className="w-40 border-b border-gray-300 ml-auto mb-1"></div>
                <p className="text-[10px] text-gray-500">Authorized Accounts Signatory</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4 print:hidden">
              <button
                onClick={() => setViewPayment(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <Printer size={15} />
                <span>Print Receipt Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
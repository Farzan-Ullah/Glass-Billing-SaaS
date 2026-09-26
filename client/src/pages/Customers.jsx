import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  CreditCard,
  Edit,
  Trash2,
  FileText,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { customerService, invoiceService } from "../services/dataService";
import { formatINR } from "../lib/glassCalculations";

const categories = ["All", "Contractor", "Architect", "Wholesaler", "Fabricator", "Retailer"];

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    gstin: "",
    category: "Contractor",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    creditLimit: 50000,
    notes: "",
  });

  useEffect(() => {
    loadCustomers();
  }, [selectedCategory]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      const data = await customerService.getAll(params);
      setCustomers(data || []);
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || "",
        company: customer.company || "",
        phone: customer.phone || "",
        email: customer.email || "",
        gstin: customer.gstin || "",
        category: customer.category || "Contractor",
        address: customer.address || "",
        city: customer.city || "Mumbai",
        state: customer.state || "Maharashtra",
        pincode: customer.pincode || "400001",
        creditLimit: customer.creditLimit || 50000,
        notes: customer.notes || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        company: "",
        phone: "",
        email: "",
        gstin: "",
        category: "Contractor",
        address: "",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        creditLimit: 50000,
        notes: "",
      });
    }
    setModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer._id, formData);
      } else {
        await customerService.create(formData);
      }
      setModalOpen(false);
      loadCustomers();
    } catch (err) {
      alert("Failed to save customer: " + err.message);
    }
  };

  const handleDelete = async (id, name, balance) => {
    if (balance > 0) {
      alert(`Cannot delete ${name} because they have an active outstanding balance of ${formatINR(balance)}.`);
      return;
    }
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await customerService.delete(id);
        loadCustomers();
      } catch (err) {
        alert("Failed to delete customer: " + err.message);
      }
    }
  };

  const handleViewCustomer = async (cust) => {
    setViewCustomer(cust);
    try {
      const invs = await invoiceService.getAll({ customerId: cust._id });
      setCustomerInvoices(invs || []);
    } catch (err) {
      console.error(err);
      setCustomerInvoices([]);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.gstin?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage contractors, architects, fabricators, and retail glass clients.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>Add New Customer</span>
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
            placeholder="Search by name, company, phone, GSTIN..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer / Company</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">GSTIN</th>
                <th className="px-4 py-3.5">Outstanding Balance</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewCustomer(c)}
                      className="text-left group"
                    >
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                        {c.name}
                        <ExternalLink size={13} className="text-gray-400 group-hover:text-blue-600" />
                      </p>
                      <p className="text-xs text-gray-500">{c.company || "Individual Client"}</p>
                    </button>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.category === "Contractor"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : c.category === "Architect"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : c.category === "Wholesaler"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : c.category === "Fabricator"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.category}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Mail size={12} />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs">
                    {c.gstin ? (
                      <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {c.gstin}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unregistered</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className={`font-bold ${c.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatINR(c.balance || 0)}
                    </p>
                    <p className="text-[11px] text-gray-400">Limit: {formatINR(c.creditLimit || 50000)}</p>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewCustomer(c)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="View Statement & History"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="Edit Customer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.name, c.balance)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCustomer ? "Edit Customer Details" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajesh Singhania"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Luxury Towers"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="billing@company.com"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Contractor">Contractor</option>
                    <option value="Architect">Architect</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Fabricator">Fabricator</option>
                    <option value="Retailer">Retailer</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AABCC9876R1ZX"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Billing / Factory Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Industrial Estate, Landmark..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Notes / Preferences</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions, edge polish preferences..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {editingCustomer ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Statement / Detail Drawer */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-gray-900/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-lg bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewCustomer.name}</h3>
                  <p className="text-xs text-gray-500">{viewCustomer.company || "Individual Customer"}</p>
                </div>
                <button
                  onClick={() => setViewCustomer(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Financial Balance Summary Card */}
              <div className="rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-blue-200 uppercase font-semibold">Outstanding Balance</span>
                  <span className="text-xl font-bold text-amber-300">{formatINR(viewCustomer.balance || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-200 border-t border-blue-800 pt-2">
                  <span>Approved Credit Limit:</span>
                  <span className="font-semibold text-white">{formatINR(viewCustomer.creditLimit || 50000)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block">Phone</span>
                  <span className="font-semibold text-gray-900">{viewCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Category</span>
                  <span className="font-semibold text-blue-600">{viewCustomer.category}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">GSTIN</span>
                  <span className="font-mono text-gray-900">{viewCustomer.gstin || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Location</span>
                  <span className="font-semibold text-gray-900">{viewCustomer.city}, {viewCustomer.state}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block">Address</span>
                  <span className="text-gray-800">{viewCustomer.address || "No address provided"}</span>
                </div>
              </div>

              {/* Invoices List for this customer */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Invoices for this customer ({customerInvoices.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customerInvoices.map((inv) => (
                    <div
                      key={inv._id}
                      onClick={() => navigate(`/invoices?view=${inv._id}`)}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50 cursor-pointer text-xs transition"
                    >
                      <div>
                        <p className="font-bold text-blue-600">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-gray-400">{new Date(inv.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatINR(inv.grandTotal)}</p>
                        <span
                          className={`text-[10px] font-semibold ${
                            inv.paymentStatus === "Paid"
                              ? "text-emerald-600"
                              : inv.paymentStatus === "Partial"
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {inv.paymentStatus} ({formatINR(inv.balanceDue)} due)
                        </span>
                      </div>
                    </div>
                  ))}
                  {customerInvoices.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">No invoices recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => navigate(`/invoices?create=true&customer=${viewCustomer._id}`)}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                + New Invoice
              </button>
              <button
                onClick={() => navigate(`/payments?record=true&customer=${viewCustomer._id}`)}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
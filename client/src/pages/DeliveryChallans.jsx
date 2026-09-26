import { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { challanService, customerService, invoiceService } from "../services/dataService";
import { formatINR } from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const statuses = ["All", "Pending Dispatch", "In Transit", "Delivered"];

export default function DeliveryChallans() {
  const business = useBusinessProfile();
  const [challans, setChallans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewChallan, setViewChallan] = useState(null);
  const [deliverModalChallan, setDeliverModalChallan] = useState(null);
  const [recipientName, setRecipientName] = useState("");

  // Challan Builder Form State
  const [customerId, setCustomerId] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("MH-04-AB-1234");
  const [driverName, setDriverName] = useState("Suresh Yadav");
  const [driverPhone, setDriverPhone] = useState("+91 98200 77665");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("Handle with care. Glass pieces cushioned in wooden rack.");
  const [items, setItems] = useState([
    {
      description: "12mm Toughened Clear Glass Panels",
      width: 48,
      height: 42,
      unit: "inch",
      quantity: 6,
      sqFt: 84.0,
      remarks: "Polished edges with rubber spacers",
    },
  ]);

  useEffect(() => {
    loadChallans();
  }, [selectedStatus]);

  const loadChallans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      const [chData, custData] = await Promise.all([
        challanService.getAll(params),
        customerService.getAll(),
      ]);
      setChallans(chData || []);
      setCustomers(custData || []);
      if (custData && custData.length > 0 && !customerId) {
        setCustomerId(custData[0]._id);
        setShippingAddress(custData[0].address || "Site Mumbai");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "Glass Panel",
        width: 36,
        height: 60,
        unit: "inch",
        quantity: 1,
        sqFt: 15.0,
        remarks: "Standard edge finish",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateChallan = async (e) => {
    e.preventDefault();
    try {
      const selectedCustomer = customers.find((c) => c._id === customerId);
      if (!selectedCustomer) {
        alert("Please select a customer.");
        return;
      }

      const totalPieces = items.reduce((sum, it) => sum + (parseInt(it.quantity) || 1), 0);
      const totalSqFt = items.reduce((sum, it) => sum + (parseFloat(it.sqFt) || 0), 0);

      const payload = {
        invoiceRef,
        customer: {
          id: selectedCustomer._id,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          company: selectedCustomer.company,
          address: shippingAddress || selectedCustomer.address,
        },
        date: new Date(),
        shippingAddress,
        vehicleNumber,
        driverName,
        driverPhone,
        items,
        totalPieces,
        totalSqFt: Math.round(totalSqFt * 100) / 100,
        status: "Pending Dispatch",
        notes,
      };

      await challanService.create(payload);
      alert("Delivery Challan generated successfully!");
      setCreateModalOpen(false);
      loadChallans();
    } catch (err) {
      alert("Failed to create challan: " + err.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus, recName = "") => {
    try {
      await challanService.updateStatus(id, newStatus, recName);
      loadChallans();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id, dcNum) => {
    if (confirm(`Delete delivery challan ${dcNum}?`)) {
      try {
        await challanService.delete(id);
        loadChallans();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const filtered = challans.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.challanNumber?.toLowerCase().includes(s) ||
      c.invoiceRef?.toLowerCase().includes(s) ||
      c.customer?.name?.toLowerCase().includes(s) ||
      c.vehicleNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Delivery Challans & Gate Passes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Dispatch slips for vehicle loading, site delivery verification, and recipient acknowledgement.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>New Delivery Challan</span>
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
            placeholder="Search challan #, invoice #, vehicle, customer..."
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

      {/* Challans Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Challan #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer & Site</th>
                <th className="px-4 py-3.5">Vehicle & Driver</th>
                <th className="px-4 py-3.5">Glass Qty & Area</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((dc) => (
                <tr key={dc._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600 whitespace-nowrap">
                    <button
                      onClick={() => setViewChallan(dc)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {dc.challanNumber}
                    </button>
                    {dc.invoiceRef && (
                      <span className="text-[10px] text-gray-400 block font-normal">
                        Invoice: {dc.invoiceRef}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(dc.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900">{dc.customer?.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{dc.shippingAddress || "Site"}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-700">
                    <p className="font-mono font-semibold text-gray-900">{dc.vehicleNumber}</p>
                    <p className="text-[11px] text-gray-500">{dc.driverName} • {dc.driverPhone}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs">
                    <span className="font-bold text-gray-900">{dc.totalPieces || dc.items?.length || 0} Panels</span>
                    <span className="text-gray-500 block">({dc.totalSqFt || 0} Sq.Ft)</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        dc.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : dc.status === "In Transit"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {dc.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewChallan(dc)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="View Gate Pass"
                      >
                        <FileText size={16} />
                      </button>

                      {dc.status === "Pending Dispatch" && (
                        <button
                          onClick={() => handleUpdateStatus(dc._id, "In Transit")}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          title="Mark Dispatched"
                        >
                          <Truck size={13} />
                          <span>Dispatch</span>
                        </button>
                      )}

                      {dc.status === "In Transit" && (
                        <button
                          onClick={() => {
                            setDeliverModalChallan(dc);
                            setRecipientName("");
                          }}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                          title="Confirm Delivery"
                        >
                          <CheckCircle2 size={13} />
                          <span>Delivered</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(dc._id, dc.challanNumber)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete Challan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                    No delivery challans recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delivery Modal */}
      {deliverModalChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Confirm Site Delivery</h3>
              <button
                onClick={() => setDeliverModalChallan(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600">
                Mark <strong>{deliverModalChallan.challanNumber}</strong> as successfully delivered to site.
              </p>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Received By (Site Contact / Name)</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Site Supervisor Anil"
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeliverModalChallan(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(deliverModalChallan._id, "Delivered", recipientName || "Site Received");
                    setDeliverModalChallan(null);
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Delivery Challan Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">New Glass Delivery Challan</h3>
                <p className="text-xs text-gray-500">Loading slip for vehicle drivers & site gate pass</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => {
                      setCustomerId(e.target.value);
                      const c = customers.find((cust) => cust._id === e.target.value);
                      if (c) setShippingAddress(c.address || "");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Linked Invoice # (Optional)</label>
                  <input
                    type="text"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    placeholder="INV-2026-0001"
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="MH-04-AB-1234"
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Driver Name & Phone</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver Name"
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Site / Delivery Address</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Tower B, Plot 42, Andheri East..."
                    className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">Glass Panels Loaded on Vehicle</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-semibold hover:bg-blue-100 transition"
                  >
                    <Plus size={14} />
                    <span>Add Panel Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200 items-center">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => {
                            const up = [...items];
                            up[idx].description = e.target.value;
                            setItems(up);
                          }}
                          placeholder="Glass description"
                          className="w-full rounded border border-gray-200 p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={it.width}
                          onChange={(e) => {
                            const up = [...items];
                            up[idx].width = parseFloat(e.target.value) || 0;
                            up[idx].sqFt = Math.round(((up[idx].width * up[idx].height) / 144) * (up[idx].quantity || 1) * 10) / 10;
                            setItems(up);
                          }}
                          placeholder="Width"
                          className="w-full rounded border border-gray-200 p-1.5 text-xs text-center bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={it.height}
                          onChange={(e) => {
                            const up = [...items];
                            up[idx].height = parseFloat(e.target.value) || 0;
                            up[idx].sqFt = Math.round(((up[idx].width * up[idx].height) / 144) * (up[idx].quantity || 1) * 10) / 10;
                            setItems(up);
                          }}
                          placeholder="Height"
                          className="w-full rounded border border-gray-200 p-1.5 text-xs text-center bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => {
                            const up = [...items];
                            up[idx].quantity = parseInt(e.target.value) || 1;
                            up[idx].sqFt = Math.round(((up[idx].width * up[idx].height) / 144) * up[idx].quantity * 10) / 10;
                            setItems(up);
                          }}
                          placeholder="Qty"
                          className="w-full rounded border border-gray-200 p-1.5 text-xs text-center font-bold bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">{it.sqFt || 0} sqft</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Handling & Packaging Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Generate Delivery Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Delivery Challan / Gate Pass Modal */}
      {viewChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl space-y-6 my-8 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-amber-600 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.companyName}</h2>
                {business.tagline && (
                  <p className="text-xs text-amber-800 font-medium mb-0.5">{business.tagline}</p>
                )}
                <p className="text-xs text-gray-500">{business.fullAddress}</p>
                <p className="text-xs text-gray-500">
                  Factory Dispatch Gate
                  {business.phone ? ` • Phone: ${business.phone}` : ""}
                  {business.gstin ? ` • GSTIN: ${business.gstin}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-amber-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Delivery Challan / Gate Pass
                </span>
                <p className="font-mono text-base font-bold text-gray-900">{viewChallan.challanNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(viewChallan.date).toLocaleDateString()}</p>
                {viewChallan.invoiceRef && (
                  <p className="text-xs font-semibold text-blue-700">Inv Ref: {viewChallan.invoiceRef}</p>
                )}
              </div>
            </div>

            {/* Consignee & Vehicle Info */}
            <div className="rounded-lg bg-gray-50 p-4 text-xs grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Consignee / Site Details</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{viewChallan.customer?.name}</p>
                <p className="text-gray-700">{viewChallan.customer?.company}</p>
                <p className="text-gray-700 mt-1">
                  <strong>Site Address:</strong> {viewChallan.shippingAddress || viewChallan.customer?.address}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-gray-400 uppercase text-[10px]">Vehicle & Driver Details</p>
                <p className="font-mono text-sm font-bold text-gray-900">Vehicle: {viewChallan.vehicleNumber}</p>
                <p className="text-gray-700">Driver: {viewChallan.driverName}</p>
                <p className="text-gray-600">Phone: {viewChallan.driverPhone}</p>
                <p className="text-amber-800 font-bold mt-1">Status: {viewChallan.status}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Glass Item Description</th>
                  <th className="p-2.5 text-center">Dimensions</th>
                  <th className="p-2.5 text-center">Qty (Pieces)</th>
                  <th className="p-2.5 text-center">Area (Sq.Ft)</th>
                  <th className="p-2.5">Packaging Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viewChallan.items?.map((it, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-bold text-gray-400">{i + 1}</td>
                    <td className="p-2.5 font-bold text-gray-900">{it.description}</td>
                    <td className="p-2.5 text-center font-mono">{it.width}" × {it.height}"</td>
                    <td className="p-2.5 text-center font-bold text-sm">{it.quantity}</td>
                    <td className="p-2.5 text-center">{it.sqFt || "-"}</td>
                    <td className="p-2.5 text-gray-600">{it.remarks || "Loaded on rack"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary & Instructions */}
            <div className="rounded-lg bg-gray-50 p-3 text-xs border border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Dispatch Notes:</p>
                <p className="text-gray-600">{viewChallan.notes || "Fragile glass material. Unload with care."}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-800">Total Pieces: {viewChallan.totalPieces || viewChallan.items?.length || 0}</span>
                <span className="text-gray-500 block">Total Area: {viewChallan.totalSqFt || 0} Sq.Ft</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 pt-8 border-t border-gray-300 text-xs">
              <div>
                <p className="text-gray-500 mb-8">Security / Gate Pass Out:</p>
                <div className="w-36 border-b border-gray-400"></div>
                <p className="text-[10px] text-gray-400 mt-1">Signature & Time</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 mb-8">Driver Signature:</p>
                <div className="w-36 border-b border-gray-400 mx-auto"></div>
                <p className="text-[10px] text-gray-400 mt-1">{viewChallan.driverName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-8">Site Receiver Signature & Stamp:</p>
                <div className="w-36 border-b border-gray-400 ml-auto"></div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {viewChallan.recipientName ? `Received by: ${viewChallan.recipientName}` : "Name & Phone"}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 print:hidden">
              <button
                onClick={() => setViewChallan(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <Printer size={15} />
                <span>Print Gate Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Calculator,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  FileText,
  Printer,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  PlusCircle,
} from "lucide-react";
import {
  estimateService,
  customerService,
  productService,
  serviceService,
} from "../services/dataService";
import {
  calculateGlassArea,
  calculatePerimeterRft,
  formatINR,
  numberToWordsINR,
} from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const statuses = ["All", "Draft", "Sent", "Approved", "Converted", "Expired"];

export default function Estimates() {
  const business = useBusinessProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [estimates, setEstimates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewEstimate, setViewEstimate] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Estimate Form Builder State
  const [customerId, setCustomerId] = useState("");
  const [validDays, setValidDays] = useState(15);
  const [dimensionUnit, setDimensionUnit] = useState("inch");
  const [items, setItems] = useState([
    {
      description: "Glass Panel",
      glassType: "12mm Toughened Clear Glass",
      thickness: 12,
      width: 36,
      height: 84,
      quantity: 1,
      glassRate: 165,
      polishActive: true,
      polishSides: 4,
      holesCount: 0,
      cutoutsCount: 0,
    },
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [transportCharges, setTransportCharges] = useState(500);
  const [notes, setNotes] = useState("All sizes subject to final template verification at site.");
  const [chargeableRuleAddInches, setChargeableRuleAddInches] = useState(0);

  useEffect(() => {
    if (business?.chargeableRuleAddInches !== undefined) {
      setChargeableRuleAddInches(business.chargeableRuleAddInches);
    }
  }, [business?.chargeableRuleAddInches]);

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      const qWidth = searchParams.get("w") || "36";
      const qHeight = searchParams.get("h") || "84";
      const qUnit = searchParams.get("unit") || "inch";
      const qQty = parseInt(searchParams.get("qty")) || 1;
      const qPolish = searchParams.get("polish") !== "false";

      setDimensionUnit(qUnit);
      setItems([
        {
          description: "Glass Panel",
          glassType: "12mm Toughened Clear Glass",
          thickness: 12,
          width: parseFloat(qWidth) || 36,
          height: parseFloat(qHeight) || 84,
          quantity: qQty,
          glassRate: 165,
          polishActive: qPolish,
          polishSides: 4,
          holesCount: 0,
          cutoutsCount: 0,
        },
      ]);
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      const [estData, custData, prodData, servData] = await Promise.all([
        estimateService.getAll(params),
        customerService.getAll(),
        productService.getAll(),
        serviceService.getAll(),
      ]);
      setEstimates(estData || []);
      setCustomers(custData || []);
      setProducts(prodData || []);
      setServices(servData || []);
      if (custData && custData.length > 0 && !customerId) {
        setCustomerId(custData[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper calculation for an item row
  const computeItem = (item) => {
    const actW = item.actualWidth !== undefined ? parseFloat(item.actualWidth) : parseFloat(item.width) || 0;
    const actH = item.actualHeight !== undefined ? parseFloat(item.actualHeight) : parseFloat(item.height) || 0;
    const addInches = parseFloat(chargeableRuleAddInches) || 0;
    
    const width = actW + addInches;
    const height = actH + addInches;

    const { billableSqFt } = calculateGlassArea(width, height, dimensionUnit, 1.0);
    const qty = parseInt(item.quantity) || 1;
    let totalAreaSqFt = billableSqFt * qty;
    const glassAmount = Math.round(totalAreaSqFt * item.glassRate);

    // services calculation
    const servList = [];
    let servTotal = 0;

    if (item.polishActive) {
      const rft = calculatePerimeterRft(item.width, item.height, dimensionUnit, item.polishSides || 4) * qty;
      const polishRate = 15; // default ₹15
      const amt = Math.round(rft * polishRate);
      servList.push({
        serviceName: "Flat Machine Edge Polish",
        chargeType: "per_rft",
        rate: polishRate,
        quantity: Math.round(rft * 10) / 10,
        amount: amt,
      });
      servTotal += amt;
    }

    if (item.holesCount > 0) {
      const holesRate = 40;
      const amt = item.holesCount * qty * holesRate;
      servList.push({
        serviceName: "Hole Drilling (12mm-25mm)",
        chargeType: "per_hole",
        rate: holesRate,
        quantity: item.holesCount * qty,
        amount: amt,
      });
      servTotal += amt;
    }

    if (item.cutoutsCount > 0) {
      const cutoutRate = 150;
      const amt = item.cutoutsCount * qty * cutoutRate;
      servList.push({
        serviceName: "Patch Fitting Cutout",
        chargeType: "per_cutout",
        rate: cutoutRate,
        quantity: item.cutoutsCount * qty,
        amount: amt,
      });
      servTotal += amt;
    }

    const itemTotal = glassAmount + servTotal;

    return {
      ...item,
      actualWidth: actW,
      actualHeight: actH,
      width,
      height,
      areaSqFt: billableSqFt,
      totalAreaSqFt,
      glassAmount,
      services: servList,
      servicesAmount: servTotal,
      itemTotal,
    };
  };

  // Compute Grand Totals for current items in builder
  const computedItems = items.map(computeItem);
  const subtotal = computedItems.reduce((sum, it) => sum + it.itemTotal, 0);
  const discountAmt = Math.round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discountAmt;
  const gstAmt = Math.round(taxable * 0.18 * 100) / 100;
  const rawGrandTotal = taxable + gstAmt + Number(transportCharges);
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((roundedGrandTotal - rawGrandTotal) * 100) / 100;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "Glass Panel",
        glassType: products[0]?.name || "12mm Toughened Clear Glass",
        thickness: products[0]?.thickness || 12,
        actualWidth: 36,
        actualHeight: 60,
        width: 36,
        height: 60,
        quantity: 1,
        glassRate: products[0]?.baseRate || 165,
        polishActive: true,
        polishSides: 4,
        holesCount: 0,
        cutoutsCount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index, prodName) => {
    const prod = products.find((p) => p.name === prodName);
    const updated = [...items];
    updated[index].glassType = prodName;
    if (prod) {
      updated[index].thickness = prod.thickness;
      updated[index].glassRate = prod.baseRate;
    }
    setItems(updated);
  };

  const handleSaveEstimate = async (e) => {
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
          phone: selectedCustomer.phone,
          company: selectedCustomer.company,
          gstin: selectedCustomer.gstin,
          address: selectedCustomer.address,
        },
        date: new Date(),
        validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
        dimensionUnit,
        chargeableRuleAddInches: Number(chargeableRuleAddInches),
        items: computedItems,
        subtotal,
        discountPercent,
        discountAmount: discountAmt,
        taxRate: 18,
        taxAmount: gstAmt,
        transportCharges: Number(transportCharges),
        roundOff,
        grandTotal: roundedGrandTotal,
        status: "Draft",
        notes,
      };

      if (editingId) {
        await estimateService.update(editingId, payload);
      } else {
        await estimateService.create(payload);
      }

      setCreateModalOpen(false);
      setEditingId(null);
      loadData();
    } catch (err) {
      alert("Failed to save estimate: " + err.message);
    }
  };

  const handleConvertToQuotation = async (id) => {
    if (confirm("Convert this estimate into an official Quotation?")) {
      try {
        await estimateService.convertToQuotation(id);
        alert("Successfully converted to Quotation!");
        loadData();
        navigate("/quotations");
      } catch (err) {
        alert("Failed to convert: " + err.message);
      }
    }
  };

  const handleDelete = async (id, estNumber) => {
    if (confirm(`Delete estimate ${estNumber}?`)) {
      try {
        await estimateService.delete(id);
        loadData();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const filteredEstimates = estimates.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.estimateNumber?.toLowerCase().includes(q) ||
      e.customer?.name?.toLowerCase().includes(q) ||
      e.customer?.company?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Glass Estimates & Costing
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Dimension-based area costing, edge processing calculations, and quote generation.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>New Glass Estimate</span>
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
            placeholder="Search estimate #, customer, company..."
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

      {/* Estimates Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Estimate #</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Glass Items</th>
                <th className="px-4 py-3.5">Grand Total</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEstimates.map((est) => (
                <tr key={est._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600">
                    <button
                      onClick={() => setViewEstimate(est)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {est.estimateNumber}
                    </button>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{est.customer?.name}</p>
                    <p className="text-xs text-gray-400">{est.customer?.company || "Retail"}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(est.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 text-xs text-gray-600">
                    <span className="font-semibold">{est.items?.length || 0} panels</span>
                    <span className="text-gray-400 block truncate max-w-xs">
                      {est.items?.map((it) => it.glassType).join(", ")}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900 text-base">
                    {formatINR(est.grandTotal)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        est.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : est.status === "Converted"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : est.status === "Sent"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {est.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewEstimate(est)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="View & Print Estimate"
                      >
                        <FileText size={16} />
                      </button>

                      {est.status !== "Converted" && (
                        <button
                          onClick={() => handleConvertToQuotation(est._id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                          title="Convert to Quotation"
                        >
                          <span>Quote</span>
                          <ArrowRight size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(est._id, est.estimateNumber)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEstimates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                    No glass estimates found. Click "New Glass Estimate" to build a calculation sheet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Glass Estimate Builder Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edit Glass Estimate" : "Interactive Glass Costing & Estimate Sheet"}
                </h3>
                <p className="text-xs text-gray-500">Auto calculates area in Sq.Ft, perimeter polishing, and GST</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEstimate} className="space-y-5 text-xs">
              {/* Header Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Customer / Project *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dimension Unit</label>
                  <div className="flex rounded-lg bg-gray-200 p-0.5 font-bold">
                    <button
                      type="button"
                      onClick={() => setDimensionUnit("inch")}
                      className={`flex-1 py-1.5 rounded-md ${dimensionUnit === "inch" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600"}`}
                    >
                      Inches (")
                    </button>
                    <button
                      type="button"
                      onClick={() => setDimensionUnit("mm")}
                      className={`flex-1 py-1.5 rounded-md ${dimensionUnit === "mm" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600"}`}
                    >
                      MM
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Chargeable Rule (Inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chargeableRuleAddInches}
                    onChange={(e) => setChargeableRuleAddInches(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Validity Period</label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value={7}>7 Days</option>
                    <option value={15}>15 Days (Standard)</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">Glass Specification & Processing Rows</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 font-semibold hover:bg-blue-100 transition"
                  >
                    <Plus size={14} />
                    <span>Add Panel Row</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const computed = computeItem(item);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="font-bold text-blue-600 text-xs">Panel #{idx + 1}</span>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-8 gap-2.5">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-gray-500 block mb-0.5">Location / Description</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].description = e.target.value;
                                setItems(up);
                              }}
                              placeholder="e.g. Main Door Panel"
                              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-gray-500 block mb-0.5">Glass Variety</label>
                            <select
                              value={item.glassType}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium outline-none focus:border-blue-500"
                            >
                              {products.map((p) => (
                                <option key={p._id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">
                              Act. W ({dimensionUnit === "inch" ? 'in "' : "mm"})
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={item.actualWidth !== undefined ? item.actualWidth : item.width}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].actualWidth = parseFloat(e.target.value) || 0;
                                setItems(up);
                              }}
                              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-center font-bold outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">
                              Act. H ({dimensionUnit === "inch" ? 'in "' : "mm"})
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={item.actualHeight !== undefined ? item.actualHeight : item.height}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].actualHeight = parseFloat(e.target.value) || 0;
                                setItems(up);
                              }}
                              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-center font-bold outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Chg. W</label>
                            <input
                              type="number"
                              readOnly
                              value={computed.width}
                              className="w-full rounded-md border border-gray-100 bg-gray-50 text-gray-500 px-2 py-1.5 text-xs text-center font-bold outline-none cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Chg. H</label>
                            <input
                              type="number"
                              readOnly
                              value={computed.height}
                              className="w-full rounded-md border border-gray-100 bg-gray-50 text-gray-500 px-2 py-1.5 text-xs text-center font-bold outline-none cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Quantity, Rate & Services */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-gray-100 items-center">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Quantity (Pcs)</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].quantity = parseInt(e.target.value) || 1;
                                setItems(up);
                              }}
                              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-center font-bold outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Rate / Sq.Ft (₹)</label>
                            <input
                              type="number"
                              value={item.glassRate}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].glassRate = parseFloat(e.target.value) || 0;
                                setItems(up);
                              }}
                              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-center font-bold outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Flat Polish (4 sides)</label>
                            <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.polishActive}
                                onChange={(e) => {
                                  const up = [...items];
                                  up[idx].polishActive = e.target.checked;
                                  setItems(up);
                                }}
                                className="h-4 w-4 rounded text-blue-600"
                              />
                              <span className="text-[11px] font-medium text-gray-700">₹15/Rft</span>
                            </label>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Holes (Count)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.holesCount || 0}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].holesCount = parseInt(e.target.value) || 0;
                                setItems(up);
                              }}
                              placeholder="0"
                              className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-center outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Cutouts (Count)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.cutoutsCount || 0}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].cutoutsCount = parseInt(e.target.value) || 0;
                                setItems(up);
                              }}
                              placeholder="0"
                              className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-center outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Line calculation read-out */}
                        <div className="flex flex-wrap items-center justify-between bg-blue-50/50 p-2.5 rounded-lg text-xs border border-blue-100">
                          <div className="flex items-center gap-3 text-gray-700">
                            <span>Area: <strong>{computed.totalAreaSqFt} Sq.Ft</strong></span>
                            <span>•</span>
                            <span>Glass: <strong>{formatINR(computed.glassAmount)}</strong></span>
                            <span>•</span>
                            <span>Processing: <strong>{formatINR(computed.servicesAmount)}</strong></span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-500 mr-1.5">Line Total:</span>
                            <span className="font-bold text-blue-900 text-sm">{formatINR(computed.itemTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Totals & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Notes & Glass Disclaimers</label>
                    <textarea
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Transport / Crating (₹)</label>
                      <input
                        type="number"
                        value={transportCharges}
                        onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="rounded-xl bg-gray-900 text-white p-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Subtotal (Glass + Processing):</span>
                    <span className="font-bold text-white">{formatINR(subtotal)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-xs text-rose-300">
                      <span>Discount ({discountPercent}%):</span>
                      <span>- {formatINR(discountAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>GST (18% on Taxable):</span>
                    <span>{formatINR(gstAmt)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Transport / Packaging:</span>
                    <span>{formatINR(transportCharges)}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-200">Grand Total:</span>
                    <span className="text-xl font-bold text-cyan-300">{formatINR(roundedGrandTotal)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic text-right">
                    {numberToWordsINR(roundedGrandTotal)}
                  </p>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Save Estimate Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable / Preview Estimate Modal */}
      {viewEstimate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl space-y-6 my-8 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.companyName}</h2>
                {business.tagline && (
                  <p className="text-xs text-blue-700 font-medium mb-0.5">{business.tagline}</p>
                )}
                <p className="text-xs text-gray-500">{business.fullAddress}</p>
                <p className="text-xs text-gray-500">
                  GSTIN: {business.gstin || "N/A"}
                  {business.phone ? ` • Phone: ${business.phone}` : ""}
                  {business.email ? ` • Email: ${business.email}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
                  Cost Estimate
                </span>
                <p className="font-mono text-sm font-bold text-gray-900">{viewEstimate.estimateNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(viewEstimate.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Customer info */}
            <div className="rounded-lg bg-gray-50 p-3.5 text-xs grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Client Details</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{viewEstimate.customer?.name}</p>
                <p className="text-gray-600">{viewEstimate.customer?.company}</p>
                <p className="text-gray-600">{viewEstimate.customer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-400 uppercase text-[10px]">Site Address & Terms</p>
                <p className="text-gray-600 mt-0.5">{viewEstimate.customer?.address || "Site Mumbai"}</p>
                <p className="text-gray-500 mt-1">Valid Until: {new Date(viewEstimate.validUntil).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Glass Variety & Description</th>
                  <th className="p-2.5 text-center">Dimensions</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-center">Area (Sq.Ft)</th>
                  <th className="p-2.5 text-center">Rate</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viewEstimate.items?.map((it, i) => (
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

            {/* Totals */}
            <div className="flex justify-between items-start pt-2">
              <div className="max-w-xs text-xs text-gray-500">
                <p className="font-bold text-gray-700 mb-1">Notes & Conditions:</p>
                <p>{viewEstimate.notes || "Subject to final template confirmation."}</p>
              </div>

              <div className="w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatINR(viewEstimate.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%):</span>
                  <span className="font-semibold">{formatINR(viewEstimate.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Transport:</span>
                  <span className="font-semibold">{formatINR(viewEstimate.transportCharges || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-300 pt-1.5">
                  <span>Estimated Total:</span>
                  <span className="text-blue-700 text-base">{formatINR(viewEstimate.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 pt-6 border-t border-gray-200 text-xs">
              <div>
                <p className="text-gray-400 mb-8">Client Acknowledgement:</p>
                <div className="w-44 border-b border-gray-300"></div>
                <p className="text-[10px] text-gray-400 mt-1">Signature</p>
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
                onClick={() => setViewEstimate(null)}
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
                  <span>Print Sheet</span>
                </button>
                {viewEstimate.status !== "Converted" && (
                  <button
                    onClick={() => {
                      handleConvertToQuotation(viewEstimate._id);
                      setViewEstimate(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <span>Convert to Official Quotation</span>
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
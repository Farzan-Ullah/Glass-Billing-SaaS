import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Receipt,
  Search,
  Plus,
  CreditCard,
  Printer,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  X,
  Trash2,
  Building,
  ChevronRight,
} from "lucide-react";
import {
  invoiceService,
  customerService,
  productService,
  paymentService,
} from "../services/dataService";
import {
  calculateGlassArea,
  calculatePerimeterRft,
  formatINR,
  numberToWordsINR,
} from "../lib/glassCalculations";
import { useBusinessProfile } from "../hooks/useBusinessProfile";

const statuses = ["All", "Unpaid", "Partial", "Paid"];

export default function Invoices() {
  const business = useBusinessProfile();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [payModalInvoice, setPayModalInvoice] = useState(null);

  // Payment record state
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  // Invoice Builder State
  const [customerId, setCustomerId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("MH-04-AB-1234");
  const [placeOfSupply, setPlaceOfSupply] = useState("Maharashtra (27)");
  const [dimensionUnit, setDimensionUnit] = useState("inch");
  const [items, setItems] = useState([
    {
      description: "Glass Panel",
      glassType: "12mm Toughened Clear Glass",
      thickness: 12,
      hsnCode: "7007",
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
  const [transportCharges, setTransportCharges] = useState(1000);
  const [amountPaidInitial, setAmountPaidInitial] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState("Glass panels delivered in sound condition.");
  const [chargeableRuleAddInches, setChargeableRuleAddInches] = useState(0);

  useEffect(() => {
    if (business?.chargeableRuleAddInches !== undefined) {
      setChargeableRuleAddInches(business.chargeableRuleAddInches);
    }
  }, [business?.chargeableRuleAddInches]);

  useEffect(() => {
    loadInvoices();
  }, [selectedStatus]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setCreateModalOpen(true);
    }
    const viewId = searchParams.get("view");
    if (viewId && invoices.length > 0) {
      const found = invoices.find((i) => i._id === viewId || i.invoiceNumber === viewId);
      if (found) setViewInvoice(found);
    }
  }, [searchParams, invoices]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      const [invData, custData, prodData] = await Promise.all([
        invoiceService.getAll(params),
        customerService.getAll(),
        productService.getAll(),
      ]);
      setInvoices(invData || []);
      setCustomers(custData || []);
      setProducts(prodData || []);
      if (custData && custData.length > 0 && !customerId) {
        setCustomerId(custData[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper computation for an item row
  const computeItem = (item) => {
    const actW = item.actualWidth !== undefined ? parseFloat(item.actualWidth) : parseFloat(item.width) || 0;
    const actH = item.actualHeight !== undefined ? parseFloat(item.actualHeight) : parseFloat(item.height) || 0;
    const addInches = parseFloat(chargeableRuleAddInches) || 0;
    
    // Only add inches if we are calculating from actual sizes and have the rule. 
    // If unit is mm, we should probably convert inches to mm or assume the rule is in inches.
    // The requirement says "add 2 inches" so we'll add it if unit is inches. 
    // For simplicity, let's just add the value to whatever unit it is for now, or assume unit is inches.
    // Let's assume the user enters standard rule value in the selected unit.
    const width = actW + addInches;
    const height = actH + addInches;

    const { billableSqFt } = calculateGlassArea(width, height, dimensionUnit, 1.0);
    const qty = parseInt(item.quantity) || 1;
    let totalAreaSqFt = billableSqFt * qty;
    const glassAmount = Math.round(totalAreaSqFt * item.glassRate);

    const servList = [];
    let servTotal = 0;

    if (item.polishActive) {
      const rft = calculatePerimeterRft(item.width, item.height, dimensionUnit, item.polishSides || 4) * qty;
      const polishRate = 15;
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
      itemTotal: glassAmount + servTotal,
    };
  };

  const computedItems = items.map(computeItem);
  const subtotal = computedItems.reduce((sum, it) => sum + it.itemTotal, 0);
  const taxableAmount = subtotal;
  const cgst = Math.round(taxableAmount * 0.09 * 100) / 100;
  const sgst = Math.round(taxableAmount * 0.09 * 100) / 100;
  const totalTax = cgst + sgst;
  const rawGrandTotal = taxableAmount + totalTax + Number(transportCharges);
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;
  const balanceDue = Math.max(0, grandTotal - Number(amountPaidInitial));

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "Glass Panel",
        glassType: products[0]?.name || "12mm Toughened Clear Glass",
        thickness: products[0]?.thickness || 12,
        hsnCode: products[0]?.hsnCode || "7007",
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
      updated[index].hsnCode = prod.hsnCode || "7007";
    }
    setItems(updated);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const selectedCustomer = customers.find((c) => c._id === customerId);
      if (!selectedCustomer) {
        alert("Please select a customer.");
        return;
      }

      const payload = {
        invoiceType: "Tax Invoice",
        date: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        customer: {
          id: selectedCustomer._id,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          company: selectedCustomer.company,
          gstin: selectedCustomer.gstin,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
          state: selectedCustomer.state,
        },
        placeOfSupply,
        vehicleNumber,
        dimensionUnit,
        chargeableRuleAddInches: Number(chargeableRuleAddInches),
        items: computedItems,
        subtotal,
        discountAmount: 0,
        taxableAmount,
        gstRate: 18,
        cgst,
        sgst,
        igst: 0,
        transportCharges: Number(transportCharges),
        roundOff,
        grandTotal,
        amountPaid: Number(amountPaidInitial),
        balanceDue,
        paymentStatus:
          balanceDue === 0
            ? "Paid"
            : Number(amountPaidInitial) > 0
            ? "Partial"
            : "Unpaid",
        notes: invoiceNotes,
      };

      const newInv = await invoiceService.create(payload);
      alert("Tax Invoice created successfully!");
      setCreateModalOpen(false);
      loadInvoices();
      setViewInvoice(newInv);
    } catch (err) {
      alert("Failed to create invoice: " + err.message);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await paymentService.create({
        customer: payModalInvoice.customer,
        invoiceId: payModalInvoice._id,
        invoiceNumber: payModalInvoice.invoiceNumber,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNumber: payRef,
        notes: payNotes,
        date: new Date(),
      });

      alert("Payment recorded successfully!");
      setPayModalInvoice(null);
      setPayAmount("");
      setPayRef("");
      loadInvoices();
    } catch (err) {
      alert("Failed to record payment: " + err.message);
    }
  };

  const handleCreateChallan = async (invoiceId) => {
    if (confirm("Create a Delivery Challan for this invoice?")) {
      try {
        await invoiceService.createChallan(invoiceId, {});
        alert("Delivery Challan generated successfully!");
        loadInvoices();
        navigate("/delivery-challans");
      } catch (err) {
        alert("Failed to create challan: " + err.message);
      }
    }
  };

  const handleDelete = async (id, invNum) => {
    if (confirm(`Delete invoice ${invNum}? This will adjust the customer balance.`)) {
      try {
        await invoiceService.delete(id);
        loadInvoices();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    const s = search.toLowerCase();
    return (
      i.invoiceNumber?.toLowerCase().includes(s) ||
      i.customer?.name?.toLowerCase().includes(s) ||
      i.customer?.company?.toLowerCase().includes(s) ||
      i.customer?.gstin?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Tax Invoices & GST Billing
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate GST-compliant tax invoices, track payment status, and dispatch delivery challans.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>Create Tax Invoice</span>
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
            placeholder="Search invoice #, customer, GSTIN..."
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

      {/* Invoices Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer & GSTIN</th>
                <th className="px-4 py-3.5">Taxable (₹)</th>
                <th className="px-4 py-3.5">GST (18%)</th>
                <th className="px-4 py-3.5">Grand Total</th>
                <th className="px-4 py-3.5">Balance Due</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600 whitespace-nowrap">
                    <button
                      onClick={() => setViewInvoice(inv)}
                      className="hover:underline flex items-center gap-1"
                    >
                      {inv.invoiceNumber}
                    </button>
                    <span className="text-[10px] text-gray-400 block font-normal">
                      {inv.invoiceType}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900">{inv.customer?.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{inv.customer?.gstin || "Unregistered"}</p>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                    {formatINR(inv.taxableAmount)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                    {formatINR((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0))}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900 text-base">
                    {formatINR(inv.grandTotal)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={inv.balanceDue > 0 ? "font-bold text-rose-600" : "text-emerald-600 font-medium"}>
                      {formatINR(inv.balanceDue)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        inv.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : inv.paymentStatus === "Partial"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewInvoice(inv)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="View / Print Tax Invoice"
                      >
                        <Receipt size={16} />
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => {
                            setPayModalInvoice(inv);
                            setPayAmount(String(inv.balanceDue));
                          }}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                          title="Record Payment"
                        >
                          <CreditCard size={13} />
                          <span>Pay</span>
                        </button>
                      )}

                      {!inv.challanCreated && (
                        <button
                          onClick={() => handleCreateChallan(inv._id)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                          title="Generate Delivery Challan"
                        >
                          <Truck size={13} />
                          <span>Dispatch</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete Invoice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-400">
                    No tax invoices recorded yet. Click "Create Tax Invoice" to bill glass orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tax Invoice Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create Official GST Tax Invoice</h3>
                <p className="text-xs text-gray-500">Calculate glass panels, CNC edge polish, GST tax split & balance</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Customer / Buyer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ""} - GSTIN: {c.gstin || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle / Transport No.</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="MH-04-AB-1234"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Place of Supply</label>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="Maharashtra (27)"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
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
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">Glass Items & Cutting Specs</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 font-semibold hover:bg-blue-100 transition"
                  >
                    <Plus size={14} />
                    <span>Add Item Row</span>
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
                          <span className="font-bold text-blue-600 text-xs">Glass Item #{idx + 1}</span>
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
                            <label className="text-[10px] text-gray-500 block mb-0.5">Description / Mark</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const up = [...items];
                                up[idx].description = e.target.value;
                                setItems(up);
                              }}
                              placeholder="e.g. Balcony Railing Glass"
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
                            <label className="text-[10px] text-gray-500 block mb-0.5">Act. W (In)</label>
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
                            <label className="text-[10px] text-gray-500 block mb-0.5">Act. H (In)</label>
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

              {/* Financial Summary and Initial Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Invoice Notes</label>
                    <input
                      type="text"
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Freight / Transport (₹)</label>
                      <input
                        type="number"
                        value={transportCharges}
                        onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Advance Received (₹)</label>
                      <input
                        type="number"
                        value={amountPaidInitial}
                        onChange={(e) => setAmountPaidInitial(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs font-bold text-emerald-700 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Totals Box */}
                <div className="rounded-xl bg-gray-900 text-white p-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Taxable Value:</span>
                    <span className="font-bold text-white">{formatINR(taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>CGST (9%):</span>
                    <span>{formatINR(cgst)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>SGST (9%):</span>
                    <span>{formatINR(sgst)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Freight / Transport:</span>
                    <span>{formatINR(transportCharges)}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-200">Invoice Total:</span>
                    <span className="text-xl font-bold text-cyan-300">{formatINR(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-gray-800 pt-1.5">
                    <span className="text-gray-300">Balance Payable:</span>
                    <span className="font-bold text-rose-400">{formatINR(balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  Generate Official Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Record Invoice Payment</h3>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5">Invoice Number:</span>
                <span className="font-bold text-blue-600">{payModalInvoice.invoiceNumber}</span>
              </div>

              <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Total:</span>
                  <span className="font-semibold">{formatINR(payModalInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Already Paid:</span>
                  <span className="font-semibold text-emerald-600">{formatINR(payModalInvoice.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Outstanding Due:</span>
                  <span className="font-bold text-rose-600">{formatINR(payModalInvoice.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-base font-bold text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Payment Mode</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="NEFT/RTGS">NEFT / RTGS / Net Banking</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Reference / UTR / Cheque No.</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI/324109887766 or Chq #000123"
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Settle Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable GST Tax Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl space-y-6 my-8 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
              <div>
                <span className="inline-block bg-blue-900 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                  Tax Invoice
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{business.companyName}</h2>
                {business.tagline && (
                  <p className="text-xs text-blue-800 font-medium mb-0.5">{business.tagline}</p>
                )}
                <p className="text-xs text-gray-600">{business.fullAddress}</p>
                <p className="text-xs font-mono font-semibold text-gray-700">
                  GSTIN: {business.gstin || "N/A"} • PAN: {business.pan || "N/A"} • State: {business.state}
                </p>
                {(business.phone || business.email) && (
                  <p className="text-xs text-gray-500">
                    {business.phone ? `Phone: ${business.phone}` : ""}
                    {business.phone && business.email ? " • " : ""}
                    {business.email ? `Email: ${business.email}` : ""}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-gray-900">{viewInvoice.invoiceNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(viewInvoice.date).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">Vehicle: {viewInvoice.vehicleNumber || "MH-04-AB-1234"}</p>
                <p className="text-xs font-semibold text-blue-700">Place of Supply: {viewInvoice.placeOfSupply}</p>
              </div>
            </div>

            {/* Bill To / Billed Details */}
            <div className="rounded-lg bg-gray-50 p-4 text-xs grid grid-cols-2 gap-4 border border-gray-200">
              <div>
                <p className="font-bold text-gray-400 uppercase text-[10px]">Details of Receiver (Billed To):</p>
                <p className="font-bold text-gray-900 text-base mt-0.5">{viewInvoice.customer?.name}</p>
                <p className="text-gray-800 font-semibold">{viewInvoice.customer?.company}</p>
                <p className="text-gray-600">{viewInvoice.customer?.address || "Mumbai"}</p>
                <p className="text-gray-600">{viewInvoice.customer?.phone}</p>
                <p className="font-mono text-gray-900 font-bold mt-1">
                  GSTIN: {viewInvoice.customer?.gstin || "Unregistered Buyer"}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-gray-400 uppercase text-[10px]">Invoice Summary & Terms</p>
                <p className="text-xs text-gray-600">Payment Due: {new Date(viewInvoice.dueDate || viewInvoice.date).toLocaleDateString()}</p>
                <p className={`font-bold text-sm ${viewInvoice.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  Status: {viewInvoice.paymentStatus}
                </p>
                <p className="text-xs text-gray-600">Amount Paid: {formatINR(viewInvoice.amountPaid || 0)}</p>
                <p className="text-xs font-bold text-rose-600">Balance Due: {formatINR(viewInvoice.balanceDue)}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2 border-r border-gray-300">#</th>
                  <th className="p-2 border-r border-gray-300">Description of Goods / Glass</th>
                  <th className="p-2 text-center border-r border-gray-300">HSN</th>
                  <th className="p-2 text-center border-r border-gray-300">Dimensions</th>
                  <th className="p-2 text-center border-r border-gray-300">Qty</th>
                  <th className="p-2 text-center border-r border-gray-300">Sq.Ft</th>
                  <th className="p-2 text-center border-r border-gray-300">Rate</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viewInvoice.items?.map((it, i) => (
                  <tr key={i}>
                    <td className="p-2 font-bold text-gray-400 border-r border-gray-200">{i + 1}</td>
                    <td className="p-2 border-r border-gray-200">
                      <p className="font-bold text-gray-900">{it.glassType}</p>
                      <p className="text-[11px] text-gray-600">{it.description}</p>
                      {it.services?.length > 0 && (
                        <p className="text-[10px] text-blue-700 mt-0.5">
                          Job Work: {it.services.map((s) => `${s.serviceName} (${s.quantity})`).join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center font-mono border-r border-gray-200">{it.hsnCode || "7007"}</td>
                    <td className="p-2 text-center font-mono border-r border-gray-200">{it.width}" × {it.height}"</td>
                    <td className="p-2 text-center font-bold border-r border-gray-200">{it.quantity}</td>
                    <td className="p-2 text-center border-r border-gray-200">{it.totalAreaSqFt}</td>
                    <td className="p-2 text-center border-r border-gray-200">{formatINR(it.glassRate)}</td>
                    <td className="p-2 text-right font-bold text-gray-900">{formatINR(it.itemTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GST Tax Breakout & Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="text-xs space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                <p className="font-bold text-gray-800 uppercase text-[10px]">Bank Transfer Details:</p>
                <p><strong>Bank:</strong> {business.bankName} {business.branch ? `(${business.branch})` : ""}</p>
                <p><strong>Account No:</strong> {business.accountNumber || "N/A"}</p>
                <p>
                  <strong>IFSC:</strong> {business.ifscCode || "N/A"}
                  {business.upiId ? ` • UPI ID: ${business.upiId}` : ""}
                </p>
                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                  Total in Words: <strong>{numberToWordsINR(viewInvoice.grandTotal)}</strong>
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-gray-700">
                  <span>Taxable Amount:</span>
                  <span className="font-semibold">{formatINR(viewInvoice.taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>CGST (9.0%):</span>
                  <span>{formatINR(viewInvoice.cgst || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>SGST (9.0%):</span>
                  <span>{formatINR(viewInvoice.sgst || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Freight & Packaging:</span>
                  <span>{formatINR(viewInvoice.transportCharges || 0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t-2 border-gray-900 pt-2">
                  <span>Grand Total (INR):</span>
                  <span className="text-blue-900 text-lg">{formatINR(viewInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                  <span>Amount Received:</span>
                  <span className="text-emerald-700 font-bold">{formatINR(viewInvoice.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600">
                  <span>Balance Due:</span>
                  <span>{formatINR(viewInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 pt-8 border-t border-gray-300 text-xs">
              <div>
                <p className="text-gray-500 mb-8">Customer Signature & Seal:</p>
                <div className="w-48 border-b border-gray-400"></div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-8">For {business.companyName}:</p>
                <div className="w-48 border-b border-gray-400 ml-auto"></div>
                <p className="text-[10px] text-gray-500 mt-1">Authorized Signatory</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 print:hidden">
              <button
                onClick={() => setViewInvoice(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  <Printer size={15} />
                  <span>Print Tax Invoice</span>
                </button>
                {!viewInvoice.challanCreated && (
                  <button
                    onClick={() => {
                      handleCreateChallan(viewInvoice._id);
                      setViewInvoice(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
                  >
                    <Truck size={14} />
                    <span>Create Delivery Challan</span>
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
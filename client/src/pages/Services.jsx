import { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Layers,
  CircleDot,
} from "lucide-react";
import { serviceService } from "../services/dataService";
import { formatINR } from "../lib/glassCalculations";

const chargeTypes = [
  { value: "per_rft", label: "Per Running Foot (Rft)", unit: "Rft" },
  { value: "per_hole", label: "Per Hole", unit: "Hole" },
  { value: "per_cutout", label: "Per Cutout", unit: "Cutout" },
  { value: "per_sqft", label: "Per Square Foot (Sq.Ft)", unit: "Sq.Ft" },
  { value: "fixed", label: "Fixed Job Charge", unit: "Job" },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    chargeType: "per_rft",
    rate: 15,
    unit: "Rft",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAll();
      setServices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        code: service.code,
        chargeType: service.chargeType,
        rate: service.rate,
        unit: service.unit || "Rft",
        description: service.description || "",
        isActive: service.isActive ?? true,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        code: "",
        chargeType: "per_rft",
        rate: 15,
        unit: "Rft",
        description: "",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleChargeTypeChange = (e) => {
    const val = e.target.value;
    const found = chargeTypes.find((t) => t.value === val);
    setFormData({
      ...formData,
      chargeType: val,
      unit: found ? found.unit : "Unit",
    });
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceService.update(editingService._id, formData);
      } else {
        await serviceService.create(formData);
      }
      setModalOpen(false);
      loadServices();
    } catch (err) {
      alert("Failed to save service: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete service "${name}"?`)) {
      try {
        await serviceService.delete(id);
        loadServices();
      } catch (err) {
        alert("Failed to delete service: " + err.message);
      }
    }
  };

  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q);
    const matchesType = typeFilter === "All" || s.chargeType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Glass Edge Processing & Services
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure rates for CNC edge polishing, beveling, hole drilling, and waterjet cutouts.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>Add Processing Service</span>
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
            placeholder="Search service name or code..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter("All")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === "All" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Types
          </button>
          {chargeTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === t.value ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.unit}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((s) => (
          <div
            key={s._id}
            className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold tracking-wider text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">
                  {s.code}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    s.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.isActive ? "Active Service" : "Disabled"}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-1">{s.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{s.description || "Standard processing job"}</p>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-[11px] text-gray-400 block">Billing Rate</span>
                  <span className="text-2xl font-bold text-blue-600">{formatINR(s.rate)}</span>
                  <span className="text-xs font-semibold text-gray-500 ml-1">/ {s.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Charge Basis</span>
                  <span className="text-xs font-semibold text-gray-700 capitalize">
                    {s.chargeType.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenModal(s)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(s._id, s.name)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService ? "Edit Processing Service" : "Add New Processing Service"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Flat Machine Edge Polish"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FLAT_POLISH"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono uppercase outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    placeholder="15"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Charge Type *</label>
                  <select
                    value={formData.chargeType}
                    onChange={handleChargeTypeChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    {chargeTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Unit Display</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Rft"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details regarding machinery, finish, or requirements..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-gray-700">Active and available in billing calculator</span>
                </label>
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
                  {editingService ? "Update Service" : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
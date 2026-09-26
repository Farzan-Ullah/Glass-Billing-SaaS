import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { productService } from "../services/dataService";
import { formatINR } from "../lib/glassCalculations";

const categories = [
  "All",
  "Clear Float",
  "Toughened / Tempered",
  "Tinted Glass",
  "Frosted / Acid Etched",
  "Mirror / Silvered",
  "Laminated Safety",
  "Fluted / Reeded",
  "Lacquered Glass",
];

const thicknesses = ["All", "4", "5", "6", "8", "10", "12", "15", "19"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedThickness, setSelectedThickness] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Clear Float",
    thickness: 5,
    baseRate: 50,
    minChargeableArea: 1.0,
    hsnCode: "7005",
    inStock: true,
    stockSqFt: 1000,
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedThickness]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedThickness !== "All") params.thickness = selectedThickness;
      const data = await productService.getAll(params);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        thickness: product.thickness,
        baseRate: product.baseRate,
        minChargeableArea: product.minChargeableArea || 1.0,
        hsnCode: product.hsnCode || "7005",
        inStock: product.inStock ?? true,
        stockSqFt: product.stockSqFt || 1000,
        description: product.description || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: selectedCategory !== "All" ? selectedCategory : "Clear Float",
        thickness: 5,
        baseRate: 50,
        minChargeableArea: 1.0,
        hsnCode: "7005",
        inStock: true,
        stockSqFt: 1000,
        description: "",
      });
    }
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, formData);
      } else {
        await productService.create(formData);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      alert("Failed to save product: " + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}" from the glass catalog?`)) {
      try {
        await productService.delete(id);
        loadProducts();
      } catch (err) {
        alert("Failed to delete product: " + err.message);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.hsnCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Glass Products Catalog
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Base rates per Sq.Ft, thickness specs, and stock inventory for all glass varieties.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition w-fit"
        >
          <Plus size={16} />
          <span>Add Glass Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search glass name, category, HSN..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-xs text-blue-600" : "text-gray-500"}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded ${viewMode === "table" ? "bg-white shadow-xs text-blue-600" : "text-gray-500"}`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Thickness Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Thickness:</span>
          {thicknesses.map((th) => (
            <button
              key={th}
              onClick={() => setSelectedThickness(th)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                selectedThickness === th
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {th === "All" ? "All mm" : `${th} mm`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                    {p.thickness} mm
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      p.inStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {p.inStock ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                    {p.inStock ? `${p.stockSqFt || 0} Sq.Ft Stock` : "Out of Stock"}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{p.category} • HSN: {p.hsnCode}</p>

                {p.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-4 bg-gray-50 p-2 rounded-lg">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Base Price</span>
                    <span className="text-xl font-bold text-gray-900">{formatINR(p.baseRate)}</span>
                    <span className="text-[11px] text-gray-400 ml-1">/ Sq.Ft</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block">Min Charge Area</span>
                    <span className="text-xs font-semibold text-gray-700">{p.minChargeableArea || 1.0} Sq.Ft</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenModal(p)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(p._id, p.name)}
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
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Glass Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Thickness</th>
                  <th className="px-4 py-3.5">Rate / Sq.Ft</th>
                  <th className="px-4 py-3.5">Min Area</th>
                  <th className="px-4 py-3.5">HSN</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                      {p.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                        {p.thickness} mm
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900">
                      {formatINR(p.baseRate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                      {p.minChargeableArea || 1.0} Sq.Ft
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                      {p.hsnCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          p.inStock
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {p.inStock ? `${p.stockSqFt || 0} Sq.Ft` : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? "Edit Glass Product" : "Add New Glass Product"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 12mm Toughened Clear Glass"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Glass Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    {categories.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Thickness (mm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 12"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Base Rate (₹/Sq.Ft) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.baseRate}
                    onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 165"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Min Area (Sq.Ft)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minChargeableArea}
                    onChange={(e) => setFormData({ ...formData, minChargeableArea: parseFloat(e.target.value) || 1.0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    placeholder="7007"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Stock in Warehouse (Sq.Ft)</label>
                  <input
                    type="number"
                    value={formData.stockSqFt}
                    onChange={(e) => setFormData({ ...formData, stockSqFt: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-gray-700">In Stock Available</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description / Applications</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Saint-Gobain float glass, distortion free, ideal for shower partitions..."
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
                  {editingProduct ? "Update Product" : "Save to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
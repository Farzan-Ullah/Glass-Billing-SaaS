import { useState, useEffect } from "react";
import {
  CircleDollarSign,
  TrendingUp,
  Percent,
  Calculator,
  Sliders,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { productService, rateService } from "../services/dataService";
import { formatINR } from "../lib/glassCalculations";

const tiers = [
  { key: "Retailer", name: "Standard Retail", discount: 0, desc: "Walk-in customers & small jobs", color: "border-gray-300" },
  { key: "Contractor", name: "Contractor Trade", discount: 12, desc: "Registered builders & fabricators", color: "border-blue-500" },
  { key: "Architect", name: "Architect & Designer", discount: 15, desc: "Design studio specifiers", color: "border-purple-500" },
  { key: "Wholesaler", name: "Wholesale Bulk", discount: 20, desc: "Full crate distributors", color: "border-amber-500" },
];

export default function Rates() {
  const [products, setProducts] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState("Contractor");

  // Calculation rules state
  const [minArea, setMinArea] = useState(1.0);
  const [roundInch, setRoundInch] = useState(true);
  const [rulesSaved, setRulesSaved] = useState(false);

  // Bulk adjust state
  const [adjustCategory, setAdjustCategory] = useState("All");
  const [adjustAmount, setAdjustAmount] = useState(5);
  const [adjustType, setAdjustType] = useState("flat"); // 'flat' | 'percent'
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodData, rateData] = await Promise.all([
        productService.getAll(),
        rateService.getAll().catch(() => []),
      ]);
      setProducts(prodData || []);
      setRates(rateData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentTierObj = tiers.find((t) => t.key === activeTier) || tiers[1];

  const handleSaveRules = () => {
    setRulesSaved(true);
    setTimeout(() => setRulesSaved(false), 2000);
  };

  const handleBulkAdjust = async () => {
    try {
      const targets = products.filter(
        (p) => adjustCategory === "All" || p.category === adjustCategory
      );

      for (const p of targets) {
        let newRate = p.baseRate;
        if (adjustType === "flat") {
          newRate = Math.max(1, p.baseRate + Number(adjustAmount));
        } else {
          newRate = Math.max(1, Math.round(p.baseRate * (1 + Number(adjustAmount) / 100)));
        }
        await productService.update(p._id, { ...p, baseRate: newRate });
      }

      setAdjustSuccess(true);
      setTimeout(() => setAdjustSuccess(false), 2500);
      loadData();
    } catch (err) {
      alert("Failed to adjust rates: " + err.message);
    }
  };

  const getTierRate = (baseRate, discountPercent) => {
    const discounted = baseRate * (1 - discountPercent / 100);
    return Math.round(discounted * 10) / 10;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Rates Master & Pricing Tiers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Define customer category price lists, calculation formulas, and bulk rate adjustments.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition w-fit"
        >
          <Printer size={15} />
          <span>Print Price Matrix</span>
        </button>
      </div>

      {/* Tier Switcher Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => {
          const isSelected = activeTier === t.key;
          return (
            <div
              key={t.key}
              onClick={() => setActiveTier(t.key)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-150 ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900 text-sm">{t.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    t.discount > 0 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t.discount > 0 ? `-${t.discount}%` : "Base"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{t.desc}</p>
              <div className="text-[11px] font-semibold text-blue-600">
                {isSelected ? "● Viewing Tier Rates" : "Click to view rates"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Calculation Rules & Quick Adjuster */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Glass Calculation Industry Rules */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Glass Area Calculation Rules</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Standard glass processing industry rules applied automatically in billing & estimates.
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div>
                <label className="font-bold text-gray-800 block">Minimum Billable Area per Piece</label>
                <p className="text-[11px] text-gray-500">
                  Small cuts below this threshold are billed at minimum area to cover furnace heating & cutting wastage.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={minArea}
                  onChange={(e) => setMinArea(parseFloat(e.target.value) || 1.0)}
                  className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-center font-bold text-gray-900"
                />
                <span className="font-semibold text-gray-600">Sq.Ft</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div>
                <label className="font-bold text-gray-800 block">Round Dimension to Next Whole Inch</label>
                <p className="text-[11px] text-gray-500">
                  e.g., 35.5" becomes 36" (standard commercial rounding rule in Indian glass market).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={roundInch}
                  onChange={(e) => setRoundInch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveRules}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition"
              >
                {rulesSaved ? <CheckCircle2 size={14} className="text-emerald-400" /> : null}
                <span>{rulesSaved ? "Rules Updated!" : "Save Calculation Rules"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Bulk Price Modifier */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sliders size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Bulk Rate Adjuster</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Quickly adjust base rates when glass float manufacturers (Saint-Gobain / Asahi) revise prices.
          </p>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Category</label>
                <select
                  value={adjustCategory}
                  onChange={(e) => setAdjustCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="All">All Glass Products</option>
                  <option value="Clear Float">Clear Float</option>
                  <option value="Toughened / Tempered">Toughened / Tempered</option>
                  <option value="Tinted Glass">Tinted Glass</option>
                  <option value="Mirror / Silvered">Mirror / Silvered</option>
                  <option value="Laminated Safety">Laminated Safety</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-blue-500"
                >
                  <option value="flat">Flat Amount (₹ / Sq.Ft)</option>
                  <option value="percent">Percentage (+%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  {adjustType === "flat" ? "Change Amount (₹)" : "Change Percentage (%)"}
                </label>
                <input
                  type="number"
                  step="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 5 or -5"
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleBulkAdjust}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition shadow-sm"
                >
                  <TrendingUp size={14} />
                  <span>{adjustSuccess ? "Rates Updated!" : "Apply Rate Revision"}</span>
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-indigo-50/60 p-2.5 text-[11px] text-indigo-700 flex items-start gap-1.5">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>
                Tip: Enter negative values (e.g. -5) to reduce prices across selected glass lines.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Price Matrix Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 px-6 py-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Glass Price Matrix for {currentTierObj.name}
            </h2>
            <p className="text-xs text-gray-500">
              Showing rate per Sq.Ft with {currentTierObj.discount}% discount applied
            </p>
          </div>
          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-bold w-fit">
            Active Tier: {activeTier}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Glass Variety</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Thickness</th>
                <th className="px-4 py-3.5">Retail Rate</th>
                <th className="px-4 py-3.5">Contractor (-12%)</th>
                <th className="px-4 py-3.5">Architect (-15%)</th>
                <th className="px-4 py-3.5">Wholesale (-20%)</th>
                <th className="px-6 py-3.5 text-right font-bold text-blue-700">Effective Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const retailRate = p.baseRate;
                const contractorRate = getTierRate(p.baseRate, 12);
                const architectRate = getTierRate(p.baseRate, 15);
                const wholesaleRate = getTierRate(p.baseRate, 20);
                const effectiveRate = getTierRate(p.baseRate, currentTierObj.discount);

                return (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {p.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                        {p.thickness} mm
                      </span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-xs font-semibold ${activeTier === "Retailer" ? "text-blue-700 font-bold bg-blue-50/40" : "text-gray-600"}`}>
                      {formatINR(retailRate)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-xs font-semibold ${activeTier === "Contractor" ? "text-blue-700 font-bold bg-blue-50/40" : "text-gray-600"}`}>
                      {formatINR(contractorRate)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-xs font-semibold ${activeTier === "Architect" ? "text-blue-700 font-bold bg-blue-50/40" : "text-gray-600"}`}>
                      {formatINR(architectRate)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-xs font-semibold ${activeTier === "Wholesaler" ? "text-blue-700 font-bold bg-blue-50/40" : "text-gray-600"}`}>
                      {formatINR(wholesaleRate)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-blue-600 text-base">
                      {formatINR(effectiveRate)}
                      <span className="text-[10px] text-gray-400 font-normal ml-1">/sqft</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
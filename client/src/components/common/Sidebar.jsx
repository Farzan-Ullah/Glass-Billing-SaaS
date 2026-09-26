import {
  LayoutDashboard,
  Users,
  Package,
  CircleDollarSign,
  Wrench,
  FileText,
  Calculator,
  Receipt,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { NavLink } from "react-router";
import { useAppStore } from "../../store/appStore";
import { useAuth } from "../../contexts/AuthContext";

const sections = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "MASTERS & CATALOG",
    items: [
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Glass Products", path: "/products", icon: Package },
      { label: "Rates Matrix", path: "/rates", icon: CircleDollarSign },
      { label: "Services & Polish", path: "/services", icon: Wrench },
    ],
  },
  {
    title: "SALES & WORKFLOW",
    items: [
      { label: "Estimates", path: "/estimates", icon: Calculator },
      { label: "Quotations", path: "/quotations", icon: FileText },
      { label: "Proforma", path: "/proforma-invoices", icon: ClipboardList },
      { label: "Tax Invoices", path: "/invoices", icon: Receipt },
      { label: "Delivery Challans", path: "/delivery-challans", icon: ClipboardList },
      { label: "Payments & Ledger", path: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "BUSINESS & CONFIG",
    items: [
      { label: "Reports & GST", path: "/reports", icon: BarChart3 },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();
  const { user } = useAuth();
  const companyName = user?.business?.companyName || "CrystalGlass";

  const content = (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 shadow-md shadow-blue-500/20 text-white">
            <Layers size={22} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-gray-900 truncate max-w-[130px]" title={companyName}>
                {companyName}
              </span>
              <span className="inline-flex items-center rounded-full bg-cyan-50 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700">PRO</span>
            </div>
            <p className="text-[11px] font-medium text-gray-400 truncate">Glass Billing SaaS</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              {sec.title}
            </p>
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer info */}
      <div className="border-t border-gray-100 p-4">
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100/60">
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs mb-1">
            <Sparkles size={14} className="text-blue-600" />
            <span>Glass Area Calculator</span>
          </div>
          <p className="text-[11px] text-blue-700/80 leading-relaxed">
            Auto Sq.Ft, Rft Polishing & GST Billing Engine
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200">
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </div>
    </>
  );
}
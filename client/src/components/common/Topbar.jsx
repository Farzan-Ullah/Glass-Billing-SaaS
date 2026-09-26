import {
  Search,
  Bell,
  Menu,
  Database,
  RefreshCw,
  LogOut,
  Building,
  Settings as SettingsIcon,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppStore } from "../../store/appStore";
import { seedService } from "../../services/dataService";
import { useAuth } from "../../contexts/AuthContext";

export default function Topbar() {
  const { setMobileSidebarOpen } = useAppStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedService.seed();
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Seed error", err);
      alert("Failed to seed database: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const userName = user?.name || "Business Owner";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const companyName = user?.business?.companyName || "Glass Enterprise";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden w-72 sm:block md:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search glass, invoice #, customer..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-9 pr-4 text-xs outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live MongoDB Status Pill */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Database size={12} />
          <span>MongoDB API Active</span>
        </div>

        {/* Quick Reset / Seed button */}
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition disabled:opacity-50"
          title="Reload fresh demo data for glass billing"
        >
          <RefreshCw size={13} className={seeding ? "animate-spin text-blue-600" : "text-gray-500"} />
          <span className="hidden md:inline">{seedSuccess ? "Data Ready!" : seeding ? "Seeding..." : "Reset Demo Data"}</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* User avatar & dropdown */}
        <div className="relative border-l border-gray-200 pl-3">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-50 transition"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={userName}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-semibold text-white shadow-sm">
                {userInitials}
              </div>
            )}
            <div className="hidden text-left xl:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{userName}</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{companyName}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden xl:block" />
          </button>

          {/* User profile dropdown popup */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-12 z-40 w-60 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-xs font-bold text-gray-900">{userName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    <Building size={11} />
                    <span className="truncate max-w-[170px]">{companyName}</span>
                  </div>
                </div>

                <div className="pt-1.5 space-y-0.5">
                  <Link
                    to="/setup"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Building size={14} className="text-gray-500" />
                    <span>Edit Glass Plant Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <SettingsIcon size={14} className="text-gray-500" />
                    <span>Business & GST Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut size={14} className="text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
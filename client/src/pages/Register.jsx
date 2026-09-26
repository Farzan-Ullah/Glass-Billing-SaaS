import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Layers,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      // New registered user immediately goes to Business Details setup
      navigate("/setup");
    } catch (err) {
      setError(err?.message || "Registration failed. Please try another email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      setGoogleLoading(true);
      const mockGoogleProfile = {
        name: "Farzan Glass Works",
        email: "farzan.newowner@gmail.com",
        googleId: "google_reg_9832749823",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      };

      await googleLogin({
        profile: mockGoogleProfile,
        credential: "mock_google_oauth_jwt_token_reg",
      });

      // After Google auth, direct user to fill in their glass enterprise details
      navigate("/setup");
    } catch (err) {
      setError(err?.message || "Google sign-up failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Left Column: Glass Industry Showcase */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-12 lg:flex">
        {/* Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">CrystalGlass</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 ring-1 ring-cyan-500/40">
                  ONBOARDING
                </span>
              </div>
              <p className="text-xs text-slate-400">Next-Gen Glass Business Management</p>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur-md">
              <Sparkles size={14} className="text-blue-400" />
              <span>Step 1 of 2: Register Account</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
              Set up your glass enterprise software in <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">under 2 minutes</span>.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Once registered, customize your glass cutting formulas, GSTIN numbers, bank details, and invoice prefixes. The entire dashboard is instantly tailored to your business.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Complete Multi-User Access with Owner/Admin Roles",
              "Instant GST Invoices & Delivery Challans for Glass Processing",
              "Automated Edge Polishing & Hole/Cutout Rate Calculation",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-slate-200">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  <CheckCircle2 size={14} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Secure Cloud Architecture with MongoDB</span>
          </div>
          <span>Confidential & Isolated Data</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-7">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2 lg:hidden">
              <Layers size={16} />
              <span>CrystalGlass SaaS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Create Glass Business Account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign up to customize your glass billing & plant management dashboard.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-200 backdrop-blur-md">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign Up First */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:shadow-cyan-500/10 active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Signing up with Google..." : "Sign up with Google"}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-800" />
              <span className="absolute bg-slate-950 px-3 text-[11px] font-medium tracking-wider uppercase text-slate-500">
                Or enter details manually
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Owner / Manager Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Farzan Merchant"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@glassplant.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-150 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? "Creating Account..." : "Continue to Business Setup"}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Next Step indicator */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Next Step: </span>
            You'll customize your Glass Company Profile (Company Name, GSTIN, Plant address, Bank details, and Cutting formulas).
          </div>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

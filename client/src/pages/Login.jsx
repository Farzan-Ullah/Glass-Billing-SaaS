import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Layers,
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

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.user?.businessCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/setup");
      }
    } catch (err) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      setGoogleLoading(true);
      // Seamless Google Authentication payload
      const mockGoogleProfile = {
        name: "Farzan Glass Tech",
        email: "farzan.glasstech@gmail.com",
        googleId: "google_10982348273491",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      };

      const res = await googleLogin({
        profile: mockGoogleProfile,
        credential: "mock_google_oauth_jwt_token_sample",
      });

      if (res.user?.businessCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/setup");
      }
    } catch (err) {
      setError(err?.message || "Google sign-in encountered an issue.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("admin@crystalglass.com");
    setPassword("admin1234");
    setError("");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Left Column: Glass Industry Hero Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-12 lg:flex">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">CrystalGlass</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 ring-1 ring-cyan-500/40">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400">Glass Manufacturing & Billing Operating System</p>
            </div>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Smart Glass Processing Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
              Precision billing built exclusively for <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">glass factories & dealers</span>.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Automate Inch/MM sq.ft conversions, edge polishing rates, GST calculation, job work delivery challans, and customer balance ledgers in one click.
            </p>
          </div>

          {/* Testimonial / Benefit Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-800">
              <div>
                <div className="text-xl font-bold text-white">100%</div>
                <div className="text-[11px] text-slate-400">Accurate Sq.Ft Math</div>
              </div>
              <div>
                <div className="text-xl font-bold text-cyan-400">GST Ready</div>
                <div className="text-[11px] text-slate-400">HSN 7007 Formats</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">Instant</div>
                <div className="text-[11px] text-slate-400">Custom Plant Setup</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>End-to-End Encrypted Cloud Multi-Tenancy</span>
          </div>
          <span>v2.4 Pro</span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2 lg:hidden">
              <Layers size={16} />
              <span>CrystalGlass SaaS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Access your personalized glass manufacturing dashboard and invoices.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-200 backdrop-blur-md">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In First (as requested) */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
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
              <span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</span>
            </button>

            {/* Separator */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-800" />
              <span className="absolute bg-slate-950 px-3 text-[11px] font-medium tracking-wider uppercase text-slate-500">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Manual Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@yourglasscompany.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                >
                  Fill Demo Creds
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-150 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Quick Demo Helper Card */}
          <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3.5 text-xs text-cyan-200/80">
            <div className="flex items-center gap-2 font-semibold text-cyan-300 mb-1">
              <Building2 size={15} />
              <span>Glass Business Workflow:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              New glass users are guided through the <strong>Glass Business Setup</strong> screen to customize company GST, plant address, bank details, and cutting rules before entering their tailored dashboard.
            </p>
          </div>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-400">
            Don't have a business account yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Register your Glass Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

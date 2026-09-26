import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Layers } from "lucide-react";

export default function ProtectedRoute({ requireBusiness = true, children }) {
  const { isAuthenticated, hasBusinessConfig, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25">
            <Layers className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Loading Glass Workspace</p>
            <p className="text-xs text-slate-400">Verifying security credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't filled their business profile yet, force them to onboarding
  if (requireBusiness && !hasBusinessConfig && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return children ? children : <Outlet />;
}

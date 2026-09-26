import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("glass_token") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("glass_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("glass_token");
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem("glass_user", JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn("Session restore check:", err?.message || err);
          // If token explicitly expired (401), clear it
          if (err?.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (data) => {
    if (data.token) {
      localStorage.setItem("glass_token", data.token);
      setToken(data.token);
    }
    if (data.user) {
      localStorage.setItem("glass_user", JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    handleAuthSuccess(res);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    handleAuthSuccess(res);
    return res;
  };

  const googleLogin = async (authPayload) => {
    const res = await authService.googleAuth(authPayload);
    handleAuthSuccess(res);
    return res;
  };

  const saveBusiness = async (businessData) => {
    const res = await authService.saveBusiness(businessData);
    if (res?.user) {
      localStorage.setItem("glass_user", JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("glass_token");
    localStorage.removeItem("glass_user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    hasBusinessConfig: !!user?.businessCompleted,
    login,
    register,
    googleLogin,
    saveBusiness,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

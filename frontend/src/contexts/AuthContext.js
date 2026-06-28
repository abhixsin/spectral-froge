import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("sf_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const r = await api.get("/auth/me");
      setUser(r.data);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    setAuthToken(r.data.access_token);
    setUser(r.data.user);
    return r.data.user;
  };

  const adminLogin = async (email, password) => {
    const r = await api.post("/auth/admin/login", { email, password });
    setAuthToken(r.data.access_token);
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (email, password, name) => {
    const r = await api.post("/auth/register", { email, password, name });
    setAuthToken(r.data.access_token);
    setUser(r.data.user);
    return r.data.user;
  };

  const emergentSession = async (sessionId) => {
    const r = await api.post("/auth/emergent/session", { session_id: sessionId });
    setAuthToken(r.data.access_token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, register, emergentSession, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
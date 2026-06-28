import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin(email, password);
      toast.success("Admin signed in");
      nav("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Admin login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-md px-6 pb-20 pt-10 md:pt-16">
        <div className="mb-8">
          <span className="chip chip-accent mb-4 inline-flex items-center gap-1.5">
            <Shield size={12} /> Restricted
          </span>
          <h1
            className="text-5xl font-normal text-foreground md:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            data-testid="admin-login-title"
          >
            Admin console
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            For Spectral Forge organisers only.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            data-testid="admin-login-email-input"
            className="field"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              data-testid="admin-login-password-input"
              className="field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={busy}
            data-testid="admin-login-submit-btn"
            className="btn btn-primary w-full"
          >
            {busy ? <span className="spinner" /> : "Sign in as admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

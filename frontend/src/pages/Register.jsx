import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(email, password, name);
      toast.success("Welcome to Spectral Forge");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-md px-6 pb-20 pt-10 md:pt-16">
        <div className="mb-8">
          <p className="eyebrow mb-2">Join the community</p>
          <h1
            className="text-5xl font-normal text-foreground md:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            data-testid="register-title"
          >
            Forge your space
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Create your members account to submit projects and connect with the community.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            data-testid="register-name-input"
            className="field"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            data-testid="register-email-input"
            className="field"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6)"
              data-testid="register-password-input"
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
            data-testid="register-submit-btn"
            className="btn btn-primary w-full"
          >
            {busy ? <span className="spinner" /> : "Create account"}
          </button>
        </form>

        <div className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" data-testid="register-login-link" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = () => {
    const redirectUrl = `${window.location.origin}/auth/emergent/callback`;
    window.location.href = `https://auth.emergentagent.com/?redirect_url=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-md px-6 pb-20 pt-10 md:pt-16">
        <div className="mb-8">
          <p className="eyebrow mb-2">Members</p>
          <h1
            className="text-5xl font-normal text-foreground md:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            data-testid="login-title"
          >
            Welcome back
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to manage your projects, view announcements and connect with the community.
          </p>
        </div>

        <button
          onClick={googleLogin}
          data-testid="login-google-btn"
          className="btn btn-primary w-full"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">or with email</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            data-testid="login-email-input"
            className="field"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              data-testid="login-password-input"
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
            data-testid="login-submit-btn"
            className="btn btn-glass w-full"
          >
            {busy ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <Link to="/register" data-testid="login-register-link" className="transition-colors hover:text-foreground">
            Create account
          </Link>
          <Link to="/admin/login" data-testid="login-admin-link" className="transition-colors hover:text-foreground">
            Admin login →
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

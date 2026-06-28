import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Primary navigation. "community" is shown only to logged-in members (brief §4.1).
const NAV_LINKS = [
  { label: "Home", to: "/", public: true },
  { label: "Projects", to: "/projects", public: true },
  { label: "Community", to: "/dashboard", public: false },
  { label: "Contact", to: "/contact", public: true },
];

const Brand = () => (
  <span
    className="text-xl tracking-tight text-foreground"
    style={{ fontFamily: "'Instrument Serif', serif" }}
  >
    Spectral Forge<sup className="text-[0.6em] align-super">®</sup>
  </span>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const links = NAV_LINKS.filter((l) => l.public || user);
  const close = () => setOpen(false);
  const isActive = (to) => (to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to));

  return (
    <header className="relative z-30 mx-auto w-full max-w-7xl px-5 pt-5 md:px-8 md:pt-7">
      <nav className="liquid-glass flex items-center justify-between gap-3 rounded-full py-2.5 pl-5 pr-3 md:pr-4">
        {/* Brand */}
        <Link
          to="/"
          onClick={close}
          data-testid="nav-brand"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <Brand />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                isActive(l.to)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={close}
                data-testid="nav-dashboard-btn"
                className="btn btn-ghost hidden sm:inline-flex"
              >
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <button
                onClick={() => { logout(); nav("/"); }}
                data-testid="nav-logout-btn"
                className="btn btn-primary"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/register"
              onClick={close}
              data-testid="nav-get-started-btn"
              className="btn btn-primary"
            >
              Begin Journey
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            data-testid="nav-mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="btn btn-glass px-2.5 py-2.5 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div
          data-testid="nav-mobile-panel"
          className="animate-fade-in liquid-glass mt-2 flex flex-col gap-1 rounded-3xl p-3 md:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={close}
              className={`rounded-2xl px-4 py-3 text-sm transition-colors ${
                isActive(l.to)
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to={user.role === "admin" ? "/admin" : "/dashboard"}
              onClick={close}
              className="rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground sm:hidden"
            >
              {user.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

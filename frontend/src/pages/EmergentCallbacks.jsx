import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function EmergentCallback() {
  const { emergentSession } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // Emergent returns session_id in the URL fragment: #session_id=...
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    if (!sessionId) {
      setError("missing session_id in callback");
      return;
    }
    (async () => {
      try {
        await emergentSession(sessionId);
        toast.success("Signed in with Google");
        window.history.replaceState(null, "", "/dashboard");
        nav("/dashboard");
      } catch (e) {
        setError(e?.response?.data?.detail || "Google sign-in failed");
      }
    })();
  }, [emergentSession, nav]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="glass-surface max-w-md p-10 text-center">
        {error ? (
          <>
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive ring-1 ring-destructive/40">
              <AlertCircle size={28} />
            </div>
            <p className="mb-2 text-2xl text-foreground" data-testid="emergent-error">Sign-in failed</p>
            <p className="mb-5 text-sm text-muted-foreground">{error}</p>
            <button onClick={() => nav("/login")} className="btn btn-primary text-sm">Back to login</button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <span className="spinner mb-4" style={{ width: 28, height: 28 }} />
            <p className="text-sm text-muted-foreground" data-testid="emergent-loading">Completing Google sign-in…</p>
          </div>
        )}
      </div>
    </div>
  );
}

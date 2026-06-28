import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Trash2, Plus, X, Shield } from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnn, setShowAnn] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", body: "" });
  const [annBusy, setAnnBusy] = useState(false);

  const load = async () => {
    try {
      const [p, u, c, a] = await Promise.all([
        api.get("/projects"),
        api.get("/admin/users"),
        api.get("/admin/contacts"),
        api.get("/announcements"),
      ]);
      setProjects(p.data); setUsers(u.data); setContacts(c.data); setAnnouncements(a.data);
    } catch (e) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const delProject = async (id) => {
    if (!window.confirm("Delete project?")) return;
    try { await api.delete(`/projects/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed"); }
  };

  const delAnn = async (id) => {
    try { await api.delete(`/announcements/${id}`); toast.success("Removed"); load(); }
    catch { toast.error("Failed"); }
  };

  const addAnn = async (e) => {
    e.preventDefault();
    setAnnBusy(true);
    try {
      await api.post("/announcements", annForm);
      toast.success("Announcement posted");
      setAnnForm({ title: "", body: "" });
      setShowAnn(false);
      load();
    } catch {
      toast.error("Failed to post");
    } finally {
      setAnnBusy(false);
    }
  };

  const TABS = [
    { k: "projects", label: "projects", count: projects.length },
    { k: "members", label: "members", count: users.length },
    { k: "contacts", label: "contacts", count: contacts.length },
    { k: "announcements", label: "announcements", count: announcements.length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-12">
        <p className="eyebrow mb-1 flex items-center gap-1.5">
          <Shield size={12} /> Admin console
        </p>
        <h1
          className="mb-8 text-5xl font-normal leading-none text-foreground md:text-6xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          data-testid="admin-title"
        >
          Spectral Forge
        </h1>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              data-testid={`admin-tab-${t.k}`}
              className={`btn text-sm ${tab === t.k ? "btn-primary" : "btn-glass"}`}
            >
              {t.label} <span className="opacity-60">({t.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            {tab === "projects" && (
              <div className="space-y-3" data-testid="admin-projects">
                {projects.length === 0 ? (
                  <EmptyState text="No projects yet." />
                ) : projects.map((p) => (
                  <div key={p.id} className="glass-surface glass-surface-hover flex items-start gap-4 p-5">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        by {p.owner_name || p.owner_email} · <span className="chip ml-1">{p.status.replace("_", " ")}</span>
                      </p>
                    </div>
                    <button onClick={() => delProject(p.id)} data-testid={`admin-delete-project-${p.id}`} className="btn btn-danger" aria-label="Delete project">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "members" && (
              <div className="glass-surface overflow-hidden" data-testid="admin-members">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3">Name</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Provider</th>
                        <th className="px-5 py-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t border-border/40 hover:bg-white/[0.03]">
                          <td className="px-5 py-3 text-foreground">{u.name || "—"}</td>
                          <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                          <td className="px-5 py-3"><span className={`chip ${u.role === "admin" ? "chip-light" : ""}`}>{u.role}</span></td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{u.provider}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "contacts" && (
              <div className="space-y-3" data-testid="admin-contacts">
                {contacts.length === 0 ? <EmptyState text="No contact submissions yet." /> :
                  contacts.map((c) => (
                    <div key={c.id} className="glass-surface p-5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{c.subject}</p>
                          <p className="text-xs text-muted-foreground">from {c.name} · {c.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{c.message}</p>
                    </div>
                  ))}
              </div>
            )}

            {tab === "announcements" && (
              <div data-testid="admin-announcements">
                <button onClick={() => setShowAnn(true)} data-testid="admin-new-ann-btn" className="btn btn-primary mb-6">
                  <Plus size={16} /> Post announcement
                </button>
                <div className="space-y-3">
                  {announcements.length === 0 ? <EmptyState text="No announcements yet." /> :
                    announcements.map((a) => (
                      <div key={a.id} className="glass-surface glass-surface-hover flex items-start gap-4 p-5">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{a.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{a.author} · {new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => delAnn(a.id)} data-testid={`admin-delete-ann-${a.id}`} className="btn btn-danger" aria-label="Delete announcement">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAnn && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur"
          onClick={(e) => e.target === e.currentTarget && setShowAnn(false)}
        >
          <form onSubmit={addAnn} className="glass-surface w-full max-w-lg space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-foreground">New announcement</h2>
              <button type="button" onClick={() => setShowAnn(false)} className="btn btn-ghost p-2" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <input required value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} placeholder="Title" data-testid="admin-ann-title" className="field" />
            <textarea required value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} placeholder="Message" rows={5} data-testid="admin-ann-body" className="field" />
            <button type="submit" disabled={annBusy} data-testid="admin-ann-submit" className="btn btn-primary w-full">
              {annBusy ? <span className="spinner" /> : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Trash2, Plus, X, Sparkles, Megaphone } from "lucide-react";

const EMPTY_FORM = { title: "", description: "", tags: "", image_url: "", repo_url: "", status: "in_progress" };

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [p, a] = await Promise.all([api.get("/projects/mine"), api.get("/announcements")]);
      setProjects(p.data);
      setAnnouncements(a.data);
    } catch (e) {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      await api.post("/projects", payload);
      toast.success("Project added");
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to create");
    } finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Deleted");
      load();
    } catch { toast.error("Failed"); }
  };

  const completed = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-12">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">Welcome back</p>
            <h1
              className="text-5xl font-normal leading-none text-foreground md:text-6xl"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              data-testid="dashboard-title"
            >
              {user?.name || user?.email}
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            data-testid="dashboard-new-project-btn"
            className="btn btn-primary"
          >
            <Plus size={16} /> New project
          </button>
        </div>

        {/* Stat strip */}
        <div className="mb-10 grid grid-cols-3 gap-3 md:gap-4">
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Completed" value={completed} />
          <StatCard label="Announcements" value={announcements.length} />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Projects */}
          <section className="md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg text-foreground/90">Your projects</h2>
              <button
                onClick={() => setShowForm(true)}
                data-testid="dashboard-new-project-btn-mobile"
                className="btn btn-glass px-4 py-2 text-xs md:hidden"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : projects.length === 0 ? (
              <div className="glass-surface flex flex-col items-center gap-3 p-12 text-center" data-testid="dashboard-empty">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm text-muted-foreground">No projects yet. Submit your first one.</p>
                <button onClick={() => setShowForm(true)} className="btn btn-glass mt-1 text-xs">New project</button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="dashboard-projects-list">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="glass-surface glass-surface-hover flex items-start gap-4 p-5"
                    data-testid={`dashboard-project-${p.id}`}
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-foreground">{p.title}</h3>
                        <span className={`chip ${p.status === "completed" ? "chip-accent" : ""}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                      {p.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.tags.map((t) => <span key={t} className="text-[11px] text-muted-foreground">#{t}</span>)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => del(p.id)}
                      data-testid={`dashboard-delete-${p.id}`}
                      className="btn btn-danger shrink-0"
                      aria-label="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Announcements */}
          <aside>
            <h2 className="mb-4 flex items-center gap-2 text-lg text-foreground/90">
              <Megaphone size={18} className="text-accent" /> Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              <div className="space-y-3" data-testid="dashboard-announcements">
                {announcements.map((a) => (
                  <div key={a.id} className="glass-surface p-4">
                    <div className="mb-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
                    <h3 className="mb-1 text-sm font-medium text-foreground">{a.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Create modal */}
      {showForm && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur"
          data-testid="project-form-modal"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <form onSubmit={submit} className="glass-surface w-full max-w-lg space-y-3 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-medium text-foreground">New project</h2>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost p-2" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" data-testid="form-title" className="field" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} data-testid="form-description" className="field" />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" data-testid="form-tags" className="field" />
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL (optional)" data-testid="form-image" className="field" />
            <input value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} placeholder="Repo URL (optional)" data-testid="form-repo" className="field" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="form-status" className="field">
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
            <button type="submit" disabled={busy} data-testid="form-submit" className="btn btn-primary w-full">
              {busy ? <span className="spinner" /> : "Create project"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-surface p-4 text-center md:p-5">
      <p className="text-2xl text-foreground md:text-3xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground md:text-xs">{label}</p>
    </div>
  );
}

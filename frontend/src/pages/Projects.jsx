import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { ArrowUpRight, Hammer } from "lucide-react";

const STATUS_LABEL = { in_progress: "in progress", completed: "completed", planned: "planned" };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/projects");
        setProjects(r.data);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-12">
        <p className="eyebrow mb-2">Our work</p>
        <h1
          className="mb-2 text-6xl font-normal leading-none text-foreground md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          data-testid="projects-title"
        >
          Projects
        </h1>
        <p className="mb-12 max-w-xl text-muted-foreground">
          Things we're building and have built — from kernels to ML pipelines, from playful prototypes to production tools.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="glass-surface flex flex-col items-center gap-3 p-16 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30">
              <Hammer size={24} />
            </div>
            <p className="text-2xl text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>Coming soon</p>
            <p className="text-sm text-muted-foreground">Our members are forging something. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="projects-grid">
            {projects.map((p) => (
              <article
                key={p.id}
                className="glass-surface glass-surface-hover group overflow-hidden"
                data-testid={`project-card-${p.id}`}
              >
                {p.image_url && (
                  <div className="aspect-[16/10] overflow-hidden bg-background">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`chip ${p.status === "completed" ? "chip-accent" : ""}`}>{STATUS_LABEL[p.status]}</span>
                    {p.repo_url && (
                      <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Repository">
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                  <h3 className="mb-1.5 text-lg font-medium text-foreground">{p.title}</h3>
                  <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">by {p.owner_name || "Spectral Forge"}</p>
                    {p.tags?.length > 0 && (
                      <div className="flex gap-1.5">
                        {p.tags.slice(0, 2).map((t) => <span key={t} className="text-[10px] text-muted-foreground">#{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

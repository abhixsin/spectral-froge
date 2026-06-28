import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Mail, Github, Twitter, CheckCircle2, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", form);
      setDone(true);
      toast.success("Message received");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto grid max-w-5xl gap-12 px-5 pb-20 pt-10 md:grid-cols-2 md:gap-16 md:px-8 md:pt-12">
        {/* Left: details */}
        <div>
          <p className="eyebrow mb-2">Say hi</p>
          <h1
            className="mb-6 text-6xl font-normal leading-none text-foreground md:text-7xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            data-testid="contact-title"
          >
            Contact us
          </h1>
          <p className="mb-8 text-muted-foreground">
            Whether you want to collaborate, sponsor a hackathon, or just learn more about Spectral Forge — we'd love to hear from you.
          </p>

          <div className="space-y-4 text-sm">
            <a href="mailto:spectral.forge.official@gmail.com" className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30"><Mail size={15} /></span>
              spectral.forge.official@gmail.com
            </a>
            <a href="https://github.com/spectral-forge" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30"><Github size={15} /></span>
              github.com/spectral-forge
            </a>
            <a href="https://twitter.com/spectralforge" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30"><Twitter size={15} /></span>
              @spectralforge
            </a>
          </div>
        </div>

        {/* Right: form / success */}
        <div>
          {done ? (
            <div className="glass-surface flex flex-col items-center p-8 text-center" data-testid="contact-success">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/40">
                <CheckCircle2 size={28} />
              </div>
              <p className="mb-2 text-3xl text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>Thanks ✦</p>
              <p className="mb-5 text-sm text-muted-foreground">We got your message. Someone from the forge will reach out soon.</p>
              <button onClick={() => setDone(false)} className="btn btn-glass text-sm">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="glass-surface space-y-3 p-6 md:p-7" data-testid="contact-form">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" data-testid="contact-name" className="field" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your email" data-testid="contact-email" className="field" />
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" data-testid="contact-subject" className="field" />
              <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message" rows={6} data-testid="contact-message" className="field resize-none" />
              <button type="submit" disabled={busy} data-testid="contact-submit" className="btn btn-primary w-full">
                {busy ? <span className="spinner" /> : <><Send size={15} /> Send message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

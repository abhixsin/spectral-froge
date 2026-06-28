import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Sparkles, MessageSquare } from "lucide-react";
import Navbar from "../components/Navbar";

const FEATURES = [
  {
    icon: Users,
    title: "Discover members",
    body: "Browse a directory of builders, designers and thinkers. Connect with the people behind the work.",
  },
  {
    icon: MessageSquare,
    title: "Message & connect",
    body: "Reach out one-to-one, swap ideas, and turn curiosity into collaboration within the community.",
  },
  {
    icon: Sparkles,
    title: "Share your craft",
    body: "Showcase your LinkedIn, GitHub, LeetCode and portfolio on a profile that actually reflects you.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ---------- Hero ---------- */}
      <section className="relative min-h-screen w-full overflow-hidden" data-testid="landing-hero">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        />

        <Navbar />

        <div className="relative z-10 flex min-h-[calc(100vh-110px)] flex-col items-center justify-center px-6 py-[90px] pb-40 pt-24 text-center">
          <h1
            className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            data-testid="hero-title"
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p
            className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            data-testid="hero-subtext"
          >
            Spectral Forge is a community where engineers, designers and curious
            builders come together to connect, collaborate and forge the future —
            one project, one conversation at a time.
          </p>

          <div className="animate-fade-rise-delay-2 mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="liquid-glass btn btn-glass cursor-pointer px-12 py-4 text-base"
              data-testid="hero-cta"
            >
              Begin Journey <ArrowRight size={18} />
            </Link>
            <Link
              to="/projects"
              className="btn btn-ghost px-6 py-4 text-base"
              data-testid="hero-secondary-cta"
            >
              Explore work
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- What we do ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow mb-3">What Spectral Forge is</p>
          <h2
            className="text-4xl font-normal leading-tight text-foreground md:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            A space where the community truly knows each other.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Register, build a profile, discover other members, message, and share
            your professional presence — so collaboration happens naturally.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-surface glass-surface-hover p-7">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30">
                <f.icon size={20} />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Stats / social proof ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="glass-surface grid grid-cols-2 gap-6 p-8 md:grid-cols-4 md:p-10">
          {[
            { k: "Open", v: "Community" },
            { k: "Member", v: "Profiles" },
            { k: "Project", v: "Showcase" },
            { k: "Direct", v: "Messaging" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <p
                className="text-3xl text-foreground md:text-4xl"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {s.k}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28 md:pb-36">
        <div className="liquid-glass relative overflow-hidden rounded-[2rem] px-8 py-16 text-center md:px-16 md:py-24">
          <h2
            className="mx-auto max-w-2xl text-4xl font-normal leading-tight text-foreground md:text-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Ready to forge something together?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            Join the community and start connecting with builders today.
          </p>
          <Link to="/register" className="btn btn-primary mx-auto mt-9 px-10 py-4 text-base">
            Begin Journey <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

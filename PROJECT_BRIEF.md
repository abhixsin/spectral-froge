# 🛠️ Spectral Forge — Project Brief & Reference Doc

> **⚠️ This is the master reference document.** Read it before starting any new feature or design work.
> Last updated: 2026-06-28

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | **Spectral Forge** |
| **Type** | Club / Community Website |
| **Tech Class** | **Web3** technology |
| **Goal** | Build a community where people can **collaborate and connect** with each other |

**Mission:** Create a space where members can register, build a profile, discover each other, message, and share their professional presence (LinkedIn, GitHub, LeetCode, Portfolio) so the community truly *knows each other*.

---

## 2. Tech Stack

- ⚛️ **React** (with Vite)
- ⚡ **Vite** (build tool / dev server)
- 🎨 **Tailwind CSS**
- 🔡 **TypeScript**
- 🧩 **shadcn/ui** (component library)
- 🌐 **Web3** (auth/identity layer — *integration TBD: e.g. wallet connect, decentralized identity*)

> **Repo note:** An existing CRA (Create React App) JavaScript project may be present in the working dir. Target stack is Vite + TS — migrate or adapt as needed during implementation.

> **Brand note:** Brand name is **Spectral Forge**. The hero design spec below references placeholder brand "Velorah®" and placeholder copy — swap these for "Spectral Forge" branding unless told otherwise.

---

## 3. Authentication

- ✅ Register / Login via **Google** (OAuth)
- ✅ Register / Login via **Email**
- 🔗 (Future) Web3 wallet connect

---

## 4. Core Features

### 4.1 Community & Messaging
- Dedicated **section in the navigation bar** for **logged-in users only**.
- Members can **connect** with each other.
- Members can **message** each other (1:1 chat).

### 4.2 User Profiles
Each member gets a personal profile page with:
- **Editable profile** — update info anytime.
- **About section** — share information about themselves.
- **Editable nickname** (separate from display name / real name).
- **Profile sharing** of professional links:
  - 🔗 **LinkedIn**
  - 🐙 **GitHub**
  - 💻 **LeetCode**
  - 🌐 **Portfolio** (personal website)

### 4.3 Community / Collaboration
- Discover other members.
- Collab and connect with each other.
- *(More collaboration features to be defined.)*

---

## 5. Design System

### 5.1 Fonts (Google Fonts)
- **Display:** `Instrument Serif` → CSS var `--font-display: 'Instrument Serif', serif`
- **Body:** `Inter` weights `400 / 500` → CSS var `--font-body: 'Inter', sans-serif`
- Usage: body uses `var(--font-body)`; headings use inline `fontFamily: "'Instrument Serif', serif"`.

### 5.2 Color Theme (Dark — HSL CSS variables)
```css
--background:        201 100% 13%;  /* deep navy blue */
--foreground:          0   0% 100%;  /* white */
--muted-foreground:  240   4%  66%;  /* muted gray */
--primary:            0   0% 100%;
--primary-foreground: 0   0%   4%;
--secondary:          0   0%  10%;
--muted:              0   0%  10%;
--accent:             0   0%  10%;
--border:             0   0%  18%;
--input:              0   0%  18%;
```

---

## 6. Liquid Glass Effect (CSS)

Reusable `.liquid-glass` class used on buttons & nav surfaces.

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0)    40%, rgba(255,255,255,0)    60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## 7. Hero Section Spec (Single Page)

### 7.1 Video Background
- Fullscreen `<video>` with `autoPlay`, `loop`, `muted`, `playsInline`.
- Source URL:
  `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`
- Classes: `absolute inset-0 w-full h-full object-cover z-0`

### 7.2 Navigation Bar
- `relative z-10`, flex row, `justify-between`, `px-8 py-6`, `max-w-7xl mx-auto`.
- **Logo:** `text-3xl tracking-tight`, Instrument Serif, `text-foreground` — *brand = **Spectral Forge** (spec shows placeholder "Velorah®"; `®` as `<sup className="text-xs">`)*.
- **Nav links** (hidden on mobile, `md:flex`): Home (active), Studio, About, Journal, Reach Us — `text-sm text-muted-foreground`, `hover:text-foreground transition-colors`.
- **CTA button:** "Begin Journey" — `liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03]`.

### 7.3 Hero Content
- `relative z-10`, flex column, centered, text-center, `px-6 pt-32 pb-40 py-[90px]`.
- **H1:** text-5xl / sm:text-7xl / md:text-8xl, `leading-[0.95]`, `tracking-[-2.46px]`, `max-w-7xl`, `font-normal`, Instrument Serif.
  - *"Where dreams rise through the silence."*
  - Words **"dreams"** and **"through the silence."** wrapped in `<em className="not-italic text-muted-foreground">` for contrast.
- **Subtext:** `text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed` — *"We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work."*
- **CTA button:** "Begin Journey" — `liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer`.

### 7.4 Animations
```css
@keyframes fade-rise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-rise          { animation: fade-rise 0.8s ease-out both; }
.animate-fade-rise-delay    { animation: fade-rise 0.8s ease-out 0.2s both; }
.animate-fade-rise-delay-2  { animation: fade-rise 0.8s ease-out 0.4s both; }
```
- H1 → `animate-fade-rise`
- Subtext → `animate-fade-rise-delay`
- Hero CTA → `animate-fade-rise-delay-2`

### 7.5 Layout Rules
- ❌ No decorative blobs, radial gradients, or overlays.
- ✅ Minimalist, cinematic, **vertically centered** hero.
- 🎥 The **video provides all visual depth**.

---

## 8. Open Questions / TODO

- [ ] Which **Web3** auth/identity approach? (wallet connect vs. decentralized identity)
- [ ] Messaging: real-time (sockets) vs. async?
- [ ] Profile link validation / verification?
- [ ] Hosting / domain for Spectral Forge?
- [ ] Replace placeholder "Velorah®" + hero copy with final Spectral Forge brand & copy.
- [ ] Confirm final nav items (must include Community/Connect section for logged-in users).

---

## 9. Quick Reference — Brand Swap Checklist

| Placeholder in spec | Replace with |
|---------------------|--------------|
| Velorah®            | **Spectral Forge** |
| "Begin Journey"     | Confirm final CTA copy |
| Nav: Home/Studio/About/Journal/Reach Us | Confirm final nav items (incl. Community/Connect for logged-in users) |

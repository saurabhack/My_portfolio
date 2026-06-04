# 🚀 Saurabh kamane — Developer Portfolio

A modern, fully responsive personal portfolio built with **React**, styled with inline CSS and keyframe animations, featuring a multi-step **Hire Me** modal, smooth scroll navigation, and a custom cursor — optimised for every screen size from mobile to widescreen desktop.

---

## ✨ Features

- **Responsive layout** — mobile hamburger drawer, tablet/desktop side-by-side hero, fluid grids
- **Custom cursor** — dot + lagging ring follower (hidden on touch devices)
- **Animated skill bars** — fill on scroll via IntersectionObserver
- **Scroll-triggered fade-ins** — every section animates in as it enters the viewport
- **Hire Me modal** — 2-step form with validation, budget/engagement chips, loading state, and success screen
- **Floating avatar** — conic-gradient spinning ring with pulse effect
- **Active nav tracking** — highlights the current section as you scroll
- **Mobile menu** — slide-in drawer with hamburger animation
- **No external CSS dependencies** — zero Tailwind, zero CSS modules; all styles are co-located

---

## 🗂 Project Structure

```
portfolio/
├── portfolio_responsive.jsx   # Main component (single file, self-contained)
└── README.md
```

The entire portfolio lives in a single JSX file for easy drop-in usage. Key internal components:

| Component | Purpose |
|---|---|
| `Portfolio` | Root component, layout, routing state |
| `HireMeModal` | 2-step contact form with validation |
| `FadeIn` | Scroll-triggered fade + slide wrapper |
| `AnimBar` | Animated skill progress bar |
| `Cursor` | Custom cursor with lagging ring |
| `useBreakpoint` | Reactive window-width hook |
| `useIntersect` | IntersectionObserver hook |

---

## 🖥 Sections

1. **Hero** — Name, tagline, CTA buttons, floating avatar, stat counters
2. **Skills** — 8 animated progress bars with category labels
3. **Projects** — 4 cards with tags, hover color accents, and year badges
4. **Experience** — Vertical timeline with glowing dot indicators
5. **Contact** — Social links + Hire Me CTA
6. **Footer** — Copyright line

---

## 📱 Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| `< 640px` (mobile) | Hamburger drawer, single-column grid, avatar hidden, stacked form fields |
| `640–900px` (tablet) | Avatar at 180px, 2-col projects, condensed nav |
| `> 900px` (desktop) | Full side-by-side hero, large avatar, custom cursor active |

---

## 🎨 Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#6C63FF` | Primary purple — buttons, bars, links |
| `--accent2` | `#00D4AA` | Teal — gradient partner, company names |
| Background | `#050510` | Deep navy base |
| Surface | `#07071a` / `#0d0d22` | Section & card backgrounds |
| Text | `#e8e8f0` | Primary copy |
| Muted | `#8888aa` | Secondary copy, labels |
| Font (display) | Sora 300–800 | All body and heading text |
| Font (mono) | JetBrains Mono 400/700 | Labels, badges, counters |

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- A React project (Vite, Next.js, or Create React App)

### Installation

```bash
# 1. Create a new Vite + React project (skip if you have one)
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm install

# 2. Drop in the portfolio file
cp portfolio_responsive.jsx src/App.jsx

# 3. Start the dev server
npm run dev
```

### Usage in an existing project

```jsx
// src/App.jsx  (or any entry point)
import Portfolio from './portfolio_responsive';

export default function App() {
  return <Portfolio />;
}
```

> **Fonts** are loaded via Google Fonts CDN inside the component's `<style>` block — no additional setup needed.

---

## 🛠 Customisation

All content lives in the data arrays at the top of the file — no hunting through JSX.

### Personal info / Hero

```jsx
// Find these lines near the top of Portfolio()
<h1>Alex Rivera</h1>
<p>I build fast, scalable…</p>
```

### Skills

```jsx
const SKILLS = [
  { name: "React / Next.js", level: 95, cat: "Frontend", color: "#6C63FF" },
  // Add or remove entries here
];
```

### Projects

```jsx
const PROJECTS = [
  { title: "My Project", desc: "…", tags: ["React"], color: "#6C63FF", icon: "🚀", year: "2024" },
];
```

### Experience

```jsx
const EXPERIENCE = [
  { role: "Senior Dev", company: "Acme", period: "2022 – Present", desc: "…" },
];
```

### Colours

Change `const A` and `const A2` at the top of the file:

```jsx
const A  = "#6C63FF";  // primary accent
const A2 = "#00D4AA";  // secondary accent
```

---

## 📦 Dependencies

| Package | Version | Notes |
|---|---|---|
| `react` | 18+ | Core framework |
| `react-dom` | 18+ | DOM renderer |

**Zero runtime dependencies beyond React.** No UI libraries, no animation libraries, no CSS frameworks.

Fonts are loaded from Google Fonts CDN at runtime:
- [Sora](https://fonts.google.com/specimen/Sora)
- [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

---

## 🧩 Hire Me Modal — Form Fields

| Field | Step | Required |
|---|---|---|
| Full Name | 1 | ✅ |
| Email | 1 | ✅ |
| Company / Project | 1 | ❌ |
| Type of engagement | 2 | ✅ |
| Budget range | 2 | ❌ |
| Timeline | 2 | ❌ |
| Project description | 2 | ✅ |

Validation runs on each step before advancing. On submission a 1.8 s simulated async call fires, then a success screen is shown. Wire up the `handleSubmit` function to your preferred backend (Resend, EmailJS, Formspree, etc.).

---

## 🔌 Connecting a Real Backend

Replace the simulated delay in `HireMeModal` with a real API call:

```jsx
// Find this block inside HireMeModal → step 2 submit handler
setSending(true);
await new Promise(r => setTimeout(r, 1800)); // ← replace this

// Example: Resend / any REST endpoint
const res = await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});
if (!res.ok) throw new Error("Failed");

setSending(false);
setStep(3);
```

---

## 📄 License

MIT — free to use, modify, and distribute. Attribution appreciated but not required.

---

## 🙏 Credits

- Fonts: [Google Fonts](https://fonts.google.com)
- Emoji avatars: System emoji set
- Inspired by the design aesthetics of [Linear](https://linear.app), [Vercel](https://vercel.com), and [Raycast](https://raycast.com)

---

*Built with ♥ in React · No frameworks were harmed in the making of this portfolio.*
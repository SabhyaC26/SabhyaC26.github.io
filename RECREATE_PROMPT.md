# Agent prompt — recreate the "terminal-portfolio" site in `Desktop/Website`

You are a coding agent. Build a personal website that behaves like a terminal
(a Claude Code–style slash-command TUI) inside an existing git repo. Follow this
document exactly. Create every file with the **exact contents** in section 5.

---

## 1. Target, environment, and gotchas

- **Target repo:** `/Users/sabhya.chhabria/Desktop/Website` — an existing git repo.
  **Do NOT delete or re-init `.git`.** It's fine to overwrite/replace any other
  files already there; this is the project's new home.
- **Stack:** Vite + React 19 + TypeScript, custom CSS (no UI framework), no backend.
- **A known-good reference copy exists at `/Users/sabhya.chhabria/Projects/terminal-portfolio`.**
  If it's present, the fastest path is to copy its files (everything except
  `node_modules`, `dist`, and this file) into the target. Otherwise, create files
  from section 5 below.

### ⚠️ macOS permission caveat (read this)
`Desktop` is a TCC-protected folder. Depending on how this app was granted
permissions, your file tools may be able to **create** files by explicit path but
be **blocked from listing the directory** (`ls` → "Operation not permitted") and
from **reading pre-existing files** you didn't create.

- Write files by explicit absolute path — that works even when listing doesn't.
- Don't rely on globbing / `ls` / reading existing repo files.
- If you must read existing files or the build fails with "Operation not
  permitted", ask the user to grant this app **Full Disk Access**
  (System Settings → Privacy & Security → Full Disk Access → enable the app →
  fully quit & reopen). That removes all these limits.
- Fallback if the build can't run in `Desktop`: build in a scratch dir
  (e.g. `~/Projects/terminal-portfolio`) to verify, then copy the verified files in.

### ⚠️ Node / Vite version pin (read this)
Node here is **20.15**, which is too old for the latest Vite (needs 20.19+).
So do **not** install the newest Vite. Install with these pins:

```bash
npm install react react-dom
npm install -D vite@^6 @vitejs/plugin-react@^4 typescript @types/react @types/react-dom
```

(React 19.x is fine. `@vitejs/plugin-react@^4` matches Vite 6.)

---

## 2. What you're building

A full-screen terminal "window" (mac traffic-light dots, centered card, status bar)
that boots with an ASCII wordmark banner + a neofetch-style info block, then a
prompt. It's a **simulated** terminal — a command router renders content; there is
no real shell.

Behavior:
- **Slash commands:** typing `/` opens an autocomplete menu of commands. Commands
  run as `/about`, `/projects`, etc. (a bare word without `/` also works as a
  lenient fallback).
- **Commands:** `/help /about /projects /experience /skills /resume /contact
  /theme /clear` plus a hidden `/sudo` easter egg. Aliases (`h`, `work`, `cv`,
  `stack`, `email`, `socials`, `links`, `cls`) work when typed but are hidden from
  the menu.
- **Keyboard:** `↑/↓` command history, `Tab` completes, `⌘K`/`Ctrl+K` command
  palette, `Ctrl+L` clears, `Esc` closes menus. Click anywhere to focus input.
- **Themes:** `dusk` (default), `amber`, `matrix`, `mono`, `paper`; persisted to
  `localStorage`; applied via CSS variables. The yellow traffic-light dot cycles
  themes, red clears, green reprints the banner.
- **Deep links:** `?cmd=projects` runs a command on load.
- **Polish:** blinking block cursor (mirror technique), reveal animation on new
  output, mobile-responsive (full-screen, trimmed status bar), respects
  `prefers-reduced-motion`.

---

## 3. File tree

```
Desktop/Website/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── public/
│   └── resume.pdf            # copy from ~/Downloads/Sabhya_2026.pdf
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── vite-env.d.ts
    ├── content/
    │   └── portfolio.ts       # all editable content lives here
    └── terminal/
        ├── Terminal.tsx
        ├── banner.ts
        ├── commands.tsx
        ├── themes.ts
        ├── types.ts
        └── components/
            ├── Autocomplete.tsx
            ├── Banner.tsx
            ├── CommandPalette.tsx
            ├── Prompt.tsx
            └── StatusBar.tsx
```

---

## 4. Steps

1. Work in `/Users/sabhya.chhabria/Desktop/Website`. Keep its `.git`.
2. Create all files from section 5 (or copy from the reference dir).
3. Copy the resume PDF into `public/`:
   ```bash
   mkdir -p /Users/sabhya.chhabria/Desktop/Website/public
   cp /Users/sabhya.chhabria/Downloads/Sabhya_2026.pdf /Users/sabhya.chhabria/Desktop/Website/public/resume.pdf
   ```
4. Install deps with the pinned versions from section 1.
5. Verify: `npm run build` (runs `tsc --noEmit && vite build`) must pass. Then
   `npm run dev` to preview at the printed localhost URL.
6. **Do not `git commit` or push unless the user explicitly asks.**

---

## 5. Files (exact contents)

### `package.json`
```json
{
  "name": "terminal-portfolio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "A Claude Code-inspired terminal UI for a personal site",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

### `vite.config.ts`
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
    // Allow tunnel hostnames (and any host) for shareable previews.
    allowedHosts: true,
  },
});
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "useDefineForClassFields": true,
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "vite.config.ts"]
}
```

### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
    <meta name="color-scheme" content="dark light" />
    <meta name="description" content="Sabhya Chhabria — AI software engineer. A personal site you explore through a terminal." />
    <title>sabhya — terminal</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230b0d10'/%3E%3Ctext x='16' y='68' font-family='monospace' font-size='56' fill='%23e8b17a'%3E%3E_%3C/text%3E%3C/svg%3E" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `.gitignore`
```text
node_modules
dist
dist-ssr
*.local
.DS_Store
.env
.env.*
!.env.example
```

### `src/vite-env.d.ts`
```ts
/// <reference types="vite/client" />
```

### `src/main.tsx`
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `src/App.tsx`
```tsx
import { Terminal } from "./terminal/Terminal";

export function App() {
  return <Terminal />;
}
```

### `src/content/portfolio.ts`
```ts
/**
 * ─────────────────────────────────────────────────────────────────────────
 *  EDIT ME — the only file you need to touch to make the site yours.
 *  Everything the terminal prints reads from the `portfolio` object below.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface Project {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  year?: string;
  link?: string;
}

export interface ExperienceItem {
  role: string;
  org: string;
  location?: string;
  period: string;
  summary: string;
  highlights?: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
  detail?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  handle: string;
  url: string;
}

export interface Portfolio {
  name: string;
  handle: string;
  role: string;
  location: string;
  tagline: string;
  about: string[];
  projects: Project[];
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  socials: SocialLink[];
  email: string;
  resumeUrl?: string;
}

export const portfolio: Portfolio = {
  name: "Sabhya Chhabria",
  handle: "sabhya",
  role: "AI Software Engineer @ Databricks",
  location: "San Francisco, CA",
  tagline: "I build AI agents and the tools around them.",

  about: [
    "I'm Sabhya — an AI software engineer at Databricks, where I work on coding agents and agentic systems. I was a core contributor to Omnigent, an open-source meta-harness that runs Claude Code, Codex, and Cursor behind one interface, and I helped take our Supervisor Agent and Knowledge Assistant products from 0 to 1,500+ weekly active customers.",
    "Before Databricks I did my M.S. in CS at Princeton (with the NLP group) and my B.A. in CS at Cornell, with ML research stints at Scale AI and Snap along the way.",
    "I like working close to both the metal and the user. This site is a terminal because the command line is one of the best interfaces ever designed — type /help to look around.",
  ],

  projects: [
    {
      name: "omnigent",
      tagline: "Open-source meta-harness for coding agents.",
      description:
        "Runs Claude Code, Codex, and Cursor behind a single command and unified interface. I built core Client/Server/Runner runtime and native harness support across agents, plus multiplayer collaboration and cloud sandboxes.",
      stack: ["python", "go", "typescript"],
      year: "2025",
      // link: "https://github.com/...", // TODO: add the Omnigent repo URL
    },
    {
      name: "supervisor-agent",
      tagline: "Databricks' 0-to-1 agent products.",
      description:
        "Supervisor Agent & Knowledge Assistant, built on the OpenAI and Anthropic Agents SDKs with async submit-and-poll execution and per-call MCP tool-approval gating. Demoed at the Data & AI Summit keynote; 100+ customers integrate custom MCP tools.",
      stack: ["fastapi", "python", "mcp"],
      year: "2024",
    },
    {
      name: "terminal-portfolio",
      tagline: "This website.",
      description:
        "A slash-command terminal UI for a personal site — command router, theming, autocomplete, and a ⌘K command palette. No real shell required.",
      stack: ["react", "typescript", "vite"],
      year: "2026",
      // link: "https://github.com/...", // TODO: add the repo URL
    },
  ],

  experience: [
    {
      role: "AI Software Engineer IV",
      org: "Databricks",
      location: "San Francisco, CA",
      period: "Jul 2024 — present",
      summary: "Building coding agents and agentic systems, 0-to-1.",
      highlights: [
        "Core contributor to Omnigent — an open-source (Apache 2.0) meta-harness running Claude Code, Codex, and Cursor behind one interface.",
        "Built multi-agent orchestration, real-time multiplayer collaboration (Polly), and cloud sandbox execution for remote coding agents.",
        "Led 0-to-1 Supervisor Agent & Knowledge Assistant; demoed at the Data & AI Summit keynote and scaled to 1,500+ weekly active customers.",
        "Hill-climbed OfficeQA quality from 21% to 50% and cut time-to-first-token from ~10s to <1s (~50% lower end-to-end latency).",
      ],
    },
    {
      role: "Graduate Research Assistant",
      org: "Princeton NLP",
      location: "Princeton, NJ",
      period: "Aug 2022 — May 2024",
      summary:
        "Research on LLM reasoning and data valuation: induced human-like thinking patterns in LLMs, used kNN-Shapley retrieval to cut data-valuation cost >90×, and built a task-agnostic datastore that beat SOTA on SuperGLUE.",
    },
    {
      role: "ML Research Intern",
      org: "Scale AI",
      location: "San Francisco, CA",
      period: "Summer 2022",
      summary:
        "Built a large-scale document-extraction pipeline (W2s, I9s); reframed NER as 2D object detection and finetuned YOLOv5 to a competitive 0.82 F1.",
    },
    {
      role: "Software Engineer Intern",
      org: "Snap Inc",
      location: "Santa Monica, CA",
      period: "Summer 2021",
      summary:
        "Built a concurrent model-assessment pipeline (1,000+ experiments) and ad-ranking reliability metrics to measure the reproducibility of production models.",
    },
  ],

  education: [
    {
      school: "Princeton University",
      degree: "M.S. Computer Science",
      period: "2022 — 2024",
      detail: "GPA 3.85 · NLP group",
    },
    {
      school: "Cornell University",
      degree: "B.A. Computer Science (Honors)",
      period: "2018 — 2021",
      detail: "GPA 3.82",
    },
  ],

  skills: [
    { label: "languages", items: ["Python", "Go", "TypeScript", "Java", "C/C++", "SQL", "Bash"] },
    {
      label: "agentic systems",
      items: [
        "MCP",
        "Claude Code",
        "Codex",
        "OpenAI & Anthropic Agents SDKs",
        "multi-agent orchestration",
        "evals & benchmarking",
      ],
    },
    { label: "ml / ai", items: ["PyTorch", "Hugging Face", "MLflow", "LangChain", "CUDA"] },
    {
      label: "infrastructure",
      items: ["Docker", "Kubernetes", "AWS", "GCP", "Spark", "Databricks", "FastAPI", "Modal", "CI/CD"],
    },
  ],

  socials: [
    // TODO: verify these handles/URLs are correct
    { label: "github", handle: "@sabhyachhabria", url: "https://github.com/sabhyachhabria" },
    { label: "linkedin", handle: "sabhyachhabria", url: "https://linkedin.com/in/sabhyachhabria" },
  ],

  email: "sabhyachhabria@gmail.com",
  resumeUrl: "/resume.pdf",
};
```

### `src/terminal/types.ts`
```ts
import type { ReactNode } from "react";

export type ThemeName = "dusk" | "amber" | "matrix" | "mono" | "paper";

export interface ThemeColors {
  bg: string;
  bgElevated: string;
  fg: string;
  fgMuted: string;
  fgFaint: string;
  accent: string;
  green: string;
  red: string;
  yellow: string;
  blue: string;
  border: string;
  selection: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
}

export type CommandCategory = "about" | "work" | "system" | "fun";

export interface CommandContext {
  /** Arguments after the command name, split on whitespace. */
  args: string[];
  /** The full raw input line. */
  raw: string;
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  /** Wipe the scrollback. */
  clearHistory: () => void;
  /** Programmatically run another command line. */
  runCommand: (input: string) => void;
}

/** A command returns a node to print, or nothing for side-effect-only commands. */
export type CommandRun = (ctx: CommandContext) => ReactNode | void;

export interface Command {
  name: string;
  aliases?: string[];
  summary: string;
  usage?: string;
  category: CommandCategory;
  /** Hidden commands don't show up in `help` (easter eggs). */
  hidden?: boolean;
  run: CommandRun;
}

export interface HistoryEntry {
  id: string;
  /** The command that produced this entry, or null for system/boot output. */
  prompt: string | null;
  node: ReactNode;
  /** Whether to play the reveal animation for this entry. */
  animate: boolean;
}
```

### `src/terminal/themes.ts`
```ts
import type { Theme, ThemeColors, ThemeName } from "./types";

export const themes: Record<ThemeName, Theme> = {
  dusk: {
    name: "dusk",
    label: "dusk",
    colors: {
      bg: "#0b0d10",
      bgElevated: "#11151b",
      fg: "#dfe3ea",
      fgMuted: "#98a2b2",
      fgFaint: "#5a6472",
      accent: "#e8b17a",
      green: "#8fce9b",
      red: "#e5896f",
      yellow: "#e6c07b",
      blue: "#83b3e6",
      border: "#1b2028",
      selection: "rgba(232, 177, 122, 0.22)",
    },
  },
  amber: {
    name: "amber",
    label: "amber",
    colors: {
      bg: "#140f02",
      bgElevated: "#1c1503",
      fg: "#ffcf6b",
      fgMuted: "#c8912f",
      fgFaint: "#7d5a17",
      accent: "#ffb000",
      green: "#e8c34a",
      red: "#ff8a4c",
      yellow: "#ffd166",
      blue: "#e0aa3e",
      border: "#33260a",
      selection: "rgba(255, 176, 0, 0.24)",
    },
  },
  matrix: {
    name: "matrix",
    label: "matrix",
    colors: {
      bg: "#000502",
      bgElevated: "#02110a",
      fg: "#7dffa0",
      fgMuted: "#37b060",
      fgFaint: "#1c6236",
      accent: "#b8ff9e",
      green: "#7dffa0",
      red: "#ff7b7b",
      yellow: "#d6ff7d",
      blue: "#7dffd1",
      border: "#0c2a19",
      selection: "rgba(125, 255, 160, 0.20)",
    },
  },
  mono: {
    name: "mono",
    label: "mono",
    colors: {
      bg: "#0a0a0a",
      bgElevated: "#121212",
      fg: "#ededed",
      fgMuted: "#8a8a8a",
      fgFaint: "#555555",
      accent: "#ffffff",
      green: "#cfcfcf",
      red: "#d99",
      yellow: "#e3e3e3",
      blue: "#bcbcbc",
      border: "#1e1e1e",
      selection: "rgba(255, 255, 255, 0.16)",
    },
  },
  paper: {
    name: "paper",
    label: "paper",
    colors: {
      bg: "#f4f1ea",
      bgElevated: "#eae6dc",
      fg: "#2c2a26",
      fgMuted: "#6d685f",
      fgFaint: "#a49d90",
      accent: "#b5651d",
      green: "#4f7a3f",
      red: "#b5432f",
      yellow: "#a9812a",
      blue: "#2f6f9f",
      border: "#ddd6c8",
      selection: "rgba(181, 101, 29, 0.18)",
    },
  },
};

export const defaultTheme: ThemeName = "dusk";

export const themeOrder: ThemeName[] = ["dusk", "amber", "matrix", "mono", "paper"];

/** Build the inline CSS-variable style object for a theme. */
export function themeVars(colors: ThemeColors): Record<string, string> {
  return {
    "--bg": colors.bg,
    "--bg-elevated": colors.bgElevated,
    "--fg": colors.fg,
    "--fg-muted": colors.fgMuted,
    "--fg-faint": colors.fgFaint,
    "--accent": colors.accent,
    "--green": colors.green,
    "--red": colors.red,
    "--yellow": colors.yellow,
    "--blue": colors.blue,
    "--border": colors.border,
    "--selection": colors.selection,
  };
}
```

### `src/terminal/banner.ts`
```ts
// Wordmark generated with figlet (ANSI Shadow). Swap it for your own handle by
// running:  npx figlet-cli -f "ANSI Shadow" "yourname"
export const wordmark = `███████╗ █████╗ ██████╗ ██╗  ██╗██╗   ██╗ █████╗ 
██╔════╝██╔══██╗██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
███████╗███████║██████╔╝███████║ ╚████╔╝ ███████║
╚════██║██╔══██║██╔══██╗██╔══██║  ╚██╔╝  ██╔══██║
███████║██║  ██║██████╔╝██║  ██║   ██║   ██║  ██║
╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝`;
```

### `src/terminal/commands.tsx`
```tsx
import type { Command, CommandCategory, ThemeName } from "./types";
import { portfolio } from "../content/portfolio";
import { themeOrder, themes } from "./themes";

/* ───────────────────────── presentational helpers ───────────────────────── */

function About() {
  return (
    <div className="out">
      {portfolio.about.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <div className="section-label">education</div>
      {portfolio.education.map((e, i) => (
        <div className="edu-item" key={i}>
          <div>
            <span className="edu-school">{e.school}</span>
            <span className="edu-degree"> · {e.degree}</span>
          </div>
          <div className="edu-meta">
            {e.period}
            {e.detail ? ` · ${e.detail}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

function Projects() {
  return (
    <div className="out">
      {portfolio.projects.map((proj) => (
        <div className="card" key={proj.name}>
          <div className="card-head">
            {proj.link ? (
              <a className="card-name" href={proj.link} target="_blank" rel="noreferrer">
                {proj.name}
              </a>
            ) : (
              <span className="card-name">{proj.name}</span>
            )}
            {proj.year && <span className="card-year">{proj.year}</span>}
          </div>
          <div className="card-tag">{proj.tagline}</div>
          <div className="card-desc">{proj.description}</div>
          <div className="stack">
            {proj.stack.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Experience() {
  return (
    <div className="out">
      {portfolio.experience.map((job, i) => (
        <div className="card" key={i}>
          <div className="card-head">
            <span className="card-name">{job.role}</span>
            <span className="card-year">{job.period}</span>
          </div>
          <div className="card-tag muted">
            {job.org}
            {job.location ? ` · ${job.location}` : ""}
          </div>
          <div className="card-desc">{job.summary}</div>
          {job.highlights && (
            <ul className="list-tight" style={{ marginTop: "6px" }}>
              {job.highlights.map((h, j) => (
                <li key={j} className="muted">
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function Skills() {
  return (
    <div className="out kv">
      {portfolio.skills.map((group) => (
        <span key={group.label} style={{ display: "contents" }}>
          <span className="k">{group.label}</span>
          <span className="v muted">{group.items.join(", ")}</span>
        </span>
      ))}
    </div>
  );
}

function Contact() {
  return (
    <div className="out">
      <p>Reach me here:</p>
      <div className="kv">
        <span className="k">email</span>
        <span className="v">
          <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
        </span>
        {portfolio.socials.map((s) => (
          <span key={s.label} style={{ display: "contents" }}>
            <span className="k">{s.label}</span>
            <span className="v">
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.handle}
              </a>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const categoryLabels: Record<CommandCategory, string> = {
  about: "about me",
  work: "work",
  system: "terminal",
  fun: "for fun",
};

function Help() {
  const order: CommandCategory[] = ["about", "work", "system"];
  const visible = commands.filter((c) => !c.hidden);
  return (
    <div className="out">
      <div className="help-grid">
        {order.map((cat) => {
          const inCat = visible.filter((c) => c.category === cat);
          if (inCat.length === 0) return null;
          return (
            <div key={cat} style={{ display: "contents" }}>
              <div className="help-cat">{categoryLabels[cat]}</div>
              {inCat.map((c) => (
                <div key={c.name} style={{ display: "contents" }}>
                  <span className="help-cmd">/{c.name}</span>
                  <span className="help-desc">{c.summary}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <p className="faint" style={{ marginTop: "12px" }}>
        ↑/↓ history · Tab to complete · ⌘K / Ctrl+K command palette
      </p>
    </div>
  );
}

/* ───────────────────────────── the commands ───────────────────────────── */

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["h"],
    summary: "list what you can do here",
    category: "system",
    run: () => <Help />,
  },
  {
    name: "about",
    summary: "who I am",
    category: "about",
    run: () => <About />,
  },
  {
    name: "projects",
    summary: "things I've built",
    category: "work",
    run: () => <Projects />,
  },
  {
    name: "experience",
    aliases: ["work", "cv"],
    summary: "where I've worked",
    category: "work",
    run: () => <Experience />,
  },
  {
    name: "skills",
    aliases: ["stack"],
    summary: "tools I reach for",
    category: "work",
    run: () => <Skills />,
  },
  {
    name: "resume",
    summary: "open my resume (pdf)",
    category: "work",
    run: () => {
      if (portfolio.resumeUrl) {
        window.open(portfolio.resumeUrl, "_blank", "noopener");
        return <span className="muted">opening resume…</span>;
      }
      return <span className="muted">no resume linked yet.</span>;
    },
  },
  {
    name: "contact",
    aliases: ["email", "socials", "links"],
    summary: "how to reach me",
    category: "about",
    run: () => <Contact />,
  },
  {
    name: "theme",
    usage: "/theme <name>",
    summary: "switch color theme",
    category: "system",
    run: (ctx) => {
      const name = ctx.args[0]?.toLowerCase();
      if (!name) {
        return (
          <div className="out">
            <p className="muted">
              current theme: <span className="accent">{ctx.theme}</span>
            </p>
            <div className="stack">
              {themeOrder.map((t) => (
                <span
                  key={t}
                  className="chip"
                  style={{
                    borderColor: t === ctx.theme ? themes[t].colors.accent : undefined,
                    color: t === ctx.theme ? themes[t].colors.accent : undefined,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="faint">usage: /theme &lt;name&gt;</p>
          </div>
        );
      }
      if ((themeOrder as string[]).includes(name)) {
        ctx.setTheme(name as ThemeName);
        return (
          <span className="muted">
            theme → <span className="accent">{name}</span>
          </span>
        );
      }
      return (
        <span className="red">
          unknown theme “{name}”. options: {themeOrder.join(", ")}
        </span>
      );
    },
  },
  {
    name: "clear",
    aliases: ["cls"],
    summary: "clear the screen",
    category: "system",
    run: (ctx) => {
      ctx.clearHistory();
    },
  },
  // ── hidden easter egg ──
  {
    name: "sudo",
    hidden: true,
    summary: "",
    category: "fun",
    run: () => (
      <span className="red">
        {portfolio.handle} is not in the sudoers file. This incident will be reported. 🚨
      </span>
    ),
  },
];

/* ───────────────────────────── lookup helpers ───────────────────────────── */

const byName = new Map<string, Command>();
for (const cmd of commands) {
  byName.set(cmd.name, cmd);
  for (const alias of cmd.aliases ?? []) byName.set(alias, cmd);
}

export function findCommand(name: string): Command | undefined {
  return byName.get(name.toLowerCase());
}

/** Primary (canonical) command names for the `/` menu — aliases still work when typed. */
export const completionNames: string[] = commands
  .filter((c) => !c.hidden)
  .map((c) => c.name);

/** Levenshtein distance for "did you mean" suggestions. */
function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

export function suggestCommand(input: string): string | undefined {
  const name = input.toLowerCase();
  let best: string | undefined;
  let bestDist = 3;
  for (const candidate of completionNames) {
    const d = distance(name, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  return best;
}
```

### `src/terminal/components/Banner.tsx`
```tsx
import { wordmark } from "../banner";
import { portfolio } from "../../content/portfolio";

export function Banner() {
  return (
    <div className="banner reveal">
      <pre aria-label={`${portfolio.name}`}>{wordmark}</pre>
      <div className="banner-info">
        <span className="k">name</span>
        <span className="v">{portfolio.name}</span>
        <span className="k">role</span>
        <span className="v">{portfolio.role}</span>
        <span className="k">loc</span>
        <span className="v">{portfolio.location}</span>
        <span className="k">links</span>
        <span className="v">
          {portfolio.socials.map((s, i) => (
            <span key={s.label}>
              {i > 0 && <span className="faint"> · </span>}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </span>
          ))}
        </span>
        <span className="rule">───────────────────────</span>
        <span className="k">help</span>
        <span className="v">
          type <span className="accent">/help</span> to begin
        </span>
      </div>
    </div>
  );
}
```

### `src/terminal/components/Prompt.tsx`
```tsx
import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

interface PromptProps {
  value: string;
  placeholder: string;
  focused: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function Prompt({
  value,
  placeholder,
  focused,
  inputRef,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
}: PromptProps) {
  const cursorClass = `cursor ${focused ? "blink" : "idle"}`;
  return (
    <div className="promptline">
      <span className="sym">❯</span>
      <div className="input-wrap">
        <div className="mirror" aria-hidden="true">
          {value.length === 0 ? (
            <>
              <span className={cursorClass} />
              <span className="placeholder">{placeholder}</span>
            </>
          ) : (
            <>
              {value}
              <span className={cursorClass} />
            </>
          )}
        </div>
        <input
          ref={inputRef}
          className="real-input"
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="terminal input"
        />
      </div>
    </div>
  );
}
```

### `src/terminal/components/StatusBar.tsx`
```tsx
interface StatusBarProps {
  theme: string;
  metaLabel: string;
  onOpenPalette: () => void;
}

export function StatusBar({ theme, metaLabel, onOpenPalette }: StatusBarProps) {
  return (
    <div className="statusbar">
      <span className="seg path sm-hide">~/portfolio</span>
      <span className="dim sm-hide">·</span>
      <span className="seg">
        theme&nbsp;<span className="badge">{theme}</span>
      </span>
      <span className="spacer" />
      <span className="dim sm-hide">
        type <span className="accent">/help</span>
      </span>
      <span className="dim sm-hide">·</span>
      <span
        className="dim"
        role="button"
        tabIndex={-1}
        style={{ cursor: "pointer" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onOpenPalette();
        }}
      >
        <span className="accent">{metaLabel}K</span> palette
      </span>
    </div>
  );
}
```

### `src/terminal/components/Autocomplete.tsx`
```tsx
export interface Suggestion {
  name: string;
  summary: string;
}

interface AutocompleteProps {
  items: Suggestion[];
  activeIndex: number;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
}

export function Autocomplete({ items, activeIndex, onSelect, onHover }: AutocompleteProps) {
  return (
    <div className="autocomplete">
      {items.map((item, i) => (
        <div
          key={item.name}
          className={`ac-item${i === activeIndex ? " active" : ""}`}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item.name);
          }}
        >
          <span className="name">/{item.name}</span>
          <span className="desc">{item.summary}</span>
        </div>
      ))}
    </div>
  );
}
```

### `src/terminal/components/CommandPalette.tsx`
```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { commands } from "../commands";

interface CommandPaletteProps {
  onClose: () => void;
  onRun: (name: string) => void;
}

export function CommandPalette({ onClose, onRun }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => commands.filter((c) => !c.hidden), []);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\//, "");
    if (!q) return visible;
    return visible.filter(
      (c) =>
        c.name.includes(q) ||
        (c.aliases ?? []).some((a) => a.includes(q)) ||
        c.summary.toLowerCase().includes(q),
    );
  }, [query, visible]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setActive(0);
  }, [query]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) {
        onRun(cmd.name);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      className="palette-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Search commands…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="palette-list">
          {results.length === 0 && (
            <div className="palette-empty">no commands match “{query}”.</div>
          )}
          {results.map((cmd, i) => (
            <div
              key={cmd.name}
              className={`palette-item${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onRun(cmd.name);
                onClose();
              }}
            >
              <span className="name">/{cmd.name}</span>
              <span className="desc">{cmd.summary}</span>
              <span className="cat">{cmd.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### `src/terminal/Terminal.tsx`
```tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import type { CommandContext, HistoryEntry, ThemeName } from "./types";
import { completionNames, findCommand, suggestCommand } from "./commands";
import { defaultTheme, themeOrder, themeVars, themes } from "./themes";
import { portfolio } from "../content/portfolio";
import { Banner } from "./components/Banner";
import { Prompt } from "./components/Prompt";
import { StatusBar } from "./components/StatusBar";
import { Autocomplete } from "./components/Autocomplete";
import type { Suggestion } from "./components/Autocomplete";
import { CommandPalette } from "./components/CommandPalette";

const THEME_KEY = "tp:theme";
const isMac =
  typeof navigator !== "undefined" &&
  /mac|iphone|ipad/i.test(navigator.userAgent);
const META_LABEL = isMac ? "⌘" : "Ctrl+";

function loadTheme(): ThemeName {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
  if (saved && (themeOrder as string[]).includes(saved)) {
    return saved as ThemeName;
  }
  return defaultTheme;
}

function UnknownCommand({ name, suggestion }: { name: string; suggestion?: string }) {
  return (
    <div className="out">
      <p className="red">command not found: /{name}</p>
      {suggestion && (
        <p className="faint">
          did you mean <span className="accent">/{suggestion}</span>?
        </p>
      )}
      <p className="faint">
        type <span className="accent">/help</span> for a list of commands.
      </p>
    </div>
  );
}

export function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState<ThemeName>(loadTheme);
  const [focused, setFocused] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [acIndex, setAcIndex] = useState(0);
  const [acDismissed, setAcDismissed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const cmdHistoryRef = useRef<string[]>([]);
  const histIndexRef = useRef<number | null>(null);
  const bootedRef = useRef(false);

  const addEntry = useCallback(
    (prompt: string | null, node: ReactNode, animate = true) => {
      setHistory((h) => [
        ...h,
        { id: String(idRef.current++), prompt, node, animate },
      ]);
    },
    [],
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  const applyTheme = useCallback((name: ThemeName) => {
    setTheme(name);
    try {
      localStorage.setItem(THEME_KEY, name);
    } catch {
      /* ignore storage errors (private mode) */
    }
  }, []);

  const execute = useCallback(
    (line: string) => {
      const raw = line;
      const trimmed = line.trim();

      if (trimmed) {
        cmdHistoryRef.current.push(trimmed);
      }
      histIndexRef.current = null;

      if (!trimmed) {
        addEntry(raw, null, false);
        return;
      }

      const withoutSlash = trimmed.startsWith("/") ? trimmed.slice(1).trim() : trimmed;
      if (!withoutSlash) {
        addEntry(raw, null, false);
        return;
      }
      const parts = withoutSlash.split(/\s+/);
      const name = parts[0];
      const args = parts.slice(1);
      const cmd = findCommand(name);

      if (!cmd) {
        addEntry(raw, <UnknownCommand name={name} suggestion={suggestCommand(name)} />);
        return;
      }

      const ctx: CommandContext = {
        args,
        raw,
        theme,
        setTheme: applyTheme,
        clearHistory,
        runCommand: (next) => execute(next),
      };

      const result = cmd.run(ctx);
      if (cmd.name === "clear") return; // clearHistory already wiped the screen
      addEntry(raw, result ?? null);
    },
    [addEntry, applyTheme, clearHistory, theme],
  );

  // Boot sequence (guarded against StrictMode double-invoke).
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    addEntry(null, <Banner />, true);
    addEntry(
      null,
      <p className="muted out">
        Welcome. Type <span className="accent">/</span> to see commands, press{" "}
        <span className="accent">{META_LABEL}K</span>, or try{" "}
        <span className="accent">/about</span>.
      </p>,
      true,
    );

    const deepLink = new URLSearchParams(window.location.search).get("cmd");
    if (deepLink) execute(deepLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the view pinned to the latest output.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  // Global shortcut: toggle the command palette.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Refocus the input when the palette closes.
  useEffect(() => {
    if (!paletteOpen) inputRef.current?.focus();
  }, [paletteOpen]);

  // Apply theme colors as CSS variables (before paint, so no flash).
  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const vars = themeVars(themes[theme].colors);
    for (const [key, value] of Object.entries(vars)) {
      el.style.setProperty(key, value);
    }
  }, [theme]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput.startsWith("/") || input.includes(" ")) return [];
    const q = trimmedInput.slice(1).toLowerCase();
    return completionNames
      .filter((n) => n.startsWith(q))
      .slice(0, 10)
      .map((n) => ({ name: n, summary: findCommand(n)?.summary ?? "" }));
  }, [input]);

  const showAutocomplete =
    focused && !paletteOpen && !acDismissed && suggestions.length > 0;

  const handleChange = useCallback((value: string) => {
    setInput(value);
    setAcIndex(0);
    setAcDismissed(false);
  }, []);

  const complete = useCallback((name: string) => {
    setInput(`/${name}`);
    setAcDismissed(true);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = input;
        setInput("");
        setAcDismissed(true);
        execute(value);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (showAutocomplete) {
          const pick = suggestions[acIndex] ?? suggestions[0];
          if (pick) complete(pick.name);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (showAutocomplete) {
          setAcIndex((i) => Math.max(0, i - 1));
          return;
        }
        const hist = cmdHistoryRef.current;
        if (hist.length === 0) return;
        const current = histIndexRef.current;
        const next = current === null ? hist.length - 1 : Math.max(0, current - 1);
        histIndexRef.current = next;
        setInput(hist[next]);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (showAutocomplete) {
          setAcIndex((i) => Math.min(suggestions.length - 1, i + 1));
          return;
        }
        const hist = cmdHistoryRef.current;
        const current = histIndexRef.current;
        if (current === null) return;
        const next = current + 1;
        if (next >= hist.length) {
          histIndexRef.current = null;
          setInput("");
        } else {
          histIndexRef.current = next;
          setInput(hist[next]);
        }
        return;
      }
      if (e.key === "Escape") {
        setAcDismissed(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        clearHistory();
      }
    },
    [acIndex, clearHistory, complete, execute, input, showAutocomplete, suggestions],
  );

  const cycleTheme = useCallback(() => {
    const idx = themeOrder.indexOf(theme);
    applyTheme(themeOrder[(idx + 1) % themeOrder.length]);
  }, [applyTheme, theme]);

  const focusInput = useCallback((e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  }, []);

  return (
    <div className="screen" ref={screenRef}>
      <div className="window">
        <div className="titlebar">
          <div className="traffic">
            <button
              className="dot red"
              title="clear"
              aria-label="clear"
              onClick={clearHistory}
            />
            <button
              className="dot yellow"
              title="cycle theme"
              aria-label="cycle theme"
              onClick={cycleTheme}
            />
            <button
              className="dot green"
              title="print banner"
              aria-label="print banner"
              onClick={() => addEntry(null, <Banner />, true)}
            />
          </div>
          <div className="title">
            {portfolio.handle} — ~/portfolio
          </div>
          <div className="title-hint">
            press <kbd>{META_LABEL}K</kbd>
          </div>
        </div>

        <div className="body" ref={bodyRef} onClick={focusInput}>
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`entry${entry.animate ? " reveal" : ""}`}
            >
              {entry.prompt !== null && (
                <div className="entry-input">
                  <span className="sym">❯</span>
                  <span>{entry.prompt}</span>
                </div>
              )}
              {entry.node != null && (
                <div className="entry-output">{entry.node}</div>
              )}
            </div>
          ))}
        </div>

        <div className="ac-wrap" onClick={focusInput}>
          {showAutocomplete && (
            <Autocomplete
              items={suggestions}
              activeIndex={acIndex}
              onSelect={complete}
              onHover={setAcIndex}
            />
          )}
          <Prompt
            value={input}
            placeholder="type / for commands…"
            focused={focused}
            inputRef={inputRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>

        <StatusBar
          theme={theme}
          metaLabel={META_LABEL}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        {paletteOpen && (
          <CommandPalette
            onClose={() => setPaletteOpen(false)}
            onRun={(name) => execute(name)}
          />
        )}
      </div>
    </div>
  );
}
```

### `src/styles.css`
```css
/* ───────────────────────────── base ───────────────────────────── */

*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --font-mono: ui-monospace, "SF Mono", "JetBrains Mono", "Fira Code",
    "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace;
  --radius: 12px;
  --line: 1.55;
  --pad: clamp(14px, 3vw, 28px);
}

html,
body {
  margin: 0;
  height: 100%;
}

body {
  font-family: var(--font-mono);
  background: #000;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

#root {
  height: 100%;
}

::selection {
  background: var(--selection);
}

/* ─────────────────────────── screen / window ─────────────────────────── */

.screen {
  height: 100dvh;
  width: 100%;
  background:
    radial-gradient(
      120% 90% at 50% -10%,
      color-mix(in srgb, var(--accent) 7%, var(--bg)) 0%,
      var(--bg) 55%
    );
  color: var(--fg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0px, 2.5vw, 40px);
  transition: background 0.4s ease, color 0.4s ease;
  overflow: hidden;
}

.window {
  width: min(920px, 100%);
  height: min(88dvh, 760px);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow:
    0 1px 0 color-mix(in srgb, var(--fg) 6%, transparent) inset,
    0 30px 80px -30px rgba(0, 0, 0, 0.7),
    0 10px 30px -20px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ─────────────────────────────── titlebar ─────────────────────────────── */

.titlebar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--fg) 4%, var(--bg));
  border-bottom: 1px solid var(--border);
  flex: none;
  user-select: none;
}

.traffic {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0.9;
  transition: transform 0.12s ease, opacity 0.12s ease;
}
.dot:hover {
  transform: scale(1.12);
  opacity: 1;
}
.dot:active {
  transform: scale(0.95);
}
.dot.red {
  background: #ff5f57;
}
.dot.yellow {
  background: #febc2e;
}
.dot.green {
  background: #28c840;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: var(--fg-muted);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-hint {
  font-size: 12px;
  color: var(--fg-faint);
  white-space: nowrap;
}
.title-hint kbd {
  font-family: inherit;
  color: var(--fg-muted);
  background: color-mix(in srgb, var(--fg) 8%, transparent);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 1px 5px;
  font-size: 11px;
}

/* ──────────────────────────────── body ──────────────────────────────── */

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--pad);
  font-size: 14px;
  line-height: var(--line);
  scroll-behavior: smooth;
  cursor: text;
}

.body::-webkit-scrollbar {
  width: 10px;
}
.body::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--fg) 14%, transparent);
  border-radius: 10px;
  border: 3px solid var(--bg);
}
.body::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--fg) 22%, transparent);
}

/* ─────────────────────────────── history ─────────────────────────────── */

.entry {
  margin-bottom: 14px;
}
.entry:last-child {
  margin-bottom: 0;
}

.entry-input {
  display: flex;
  gap: 8px;
  align-items: baseline;
  color: var(--fg);
  white-space: pre-wrap;
  word-break: break-word;
}
.entry-input .sym {
  color: var(--accent);
  flex: none;
}
.entry-output {
  margin-top: 6px;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.reveal {
  animation: reveal 0.22s ease both;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
  }
  .body {
    scroll-behavior: auto;
  }
}

/* ─────────────────────────── output primitives ─────────────────────────── */

.muted {
  color: var(--fg-muted);
}
.faint {
  color: var(--fg-faint);
}
.accent {
  color: var(--accent);
}
.green {
  color: var(--green);
}
.red {
  color: var(--red);
}
.yellow {
  color: var(--yellow);
}
.blue {
  color: var(--blue);
}
.bold {
  font-weight: 700;
}

.out p {
  margin: 0 0 8px;
  max-width: 68ch;
}
.out p:last-child {
  margin-bottom: 0;
}
.out a {
  color: var(--accent);
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent);
}
.out a:hover {
  text-decoration-color: var(--accent);
}

.section-label {
  color: var(--fg-faint);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  margin: 14px 0 6px;
}
.edu-item {
  margin-bottom: 8px;
}
.edu-item:last-child {
  margin-bottom: 0;
}
.edu-school {
  color: var(--accent);
}
.edu-degree {
  color: var(--fg-muted);
}
.edu-meta {
  color: var(--fg-faint);
  font-size: 13px;
}

.banner {
  display: flex;
  gap: clamp(14px, 4vw, 34px);
  align-items: center;
  flex-wrap: wrap;
}
.banner pre {
  margin: 0;
  color: var(--accent);
  font-size: clamp(5px, 1.7vw, 11px);
  line-height: 1.05;
  letter-spacing: 0;
  text-shadow: 0 0 24px color-mix(in srgb, var(--accent) 35%, transparent);
}
.banner-info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 14px;
  font-size: 13px;
  align-content: center;
}
.banner-info .k {
  color: var(--accent);
}
.banner-info .v {
  color: var(--fg-muted);
}
.banner-info a {
  color: var(--accent);
  text-decoration: none;
  text-underline-offset: 3px;
}
.banner-info a:hover {
  text-decoration: underline;
}
.banner-info .rule {
  grid-column: 1 / -1;
  color: var(--fg-faint);
  margin: 2px 0;
}

.help-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 3px 18px;
}
.help-cat {
  grid-column: 1 / -1;
  color: var(--fg-faint);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  margin-top: 10px;
}
.help-cat:first-child {
  margin-top: 0;
}
.help-cmd {
  color: var(--accent);
}
.help-desc {
  color: var(--fg-muted);
}

.card {
  border-left: 2px solid var(--border);
  padding: 2px 0 2px 14px;
  margin: 0 0 14px;
}
.card:last-child {
  margin-bottom: 0;
}
.card-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.card-name {
  color: var(--accent);
  font-weight: 700;
}
.card-year {
  color: var(--fg-faint);
  font-size: 12px;
}
.card-tag {
  color: var(--fg);
  margin: 3px 0 4px;
}
.card-desc {
  color: var(--fg-muted);
  max-width: 68ch;
}
.stack {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  font-size: 11px;
  color: var(--fg-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 9px;
}

.kv {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 16px;
}
.kv .k {
  color: var(--fg-faint);
}
.kv .v a {
  color: var(--accent);
}

.list-tight {
  margin: 0;
  padding: 0;
  list-style: none;
}
.list-tight li {
  padding-left: 16px;
  position: relative;
}
.list-tight li::before {
  content: "›";
  position: absolute;
  left: 0;
  color: var(--accent);
}

/* ─────────────────────────────── prompt ─────────────────────────────── */

.promptline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 2px var(--pad) calc(var(--pad) - 4px);
  flex: none;
  cursor: text;
}
.promptline .sym {
  color: var(--accent);
  flex: none;
  font-weight: 700;
}

.input-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}
.mirror {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--fg);
  min-height: 1.55em;
}
.mirror .placeholder {
  color: var(--fg-faint);
}
.cursor {
  display: inline-block;
  width: 0.6ch;
  height: 1.05em;
  background: var(--accent);
  vertical-align: text-bottom;
  transform: translateY(2px);
  margin-left: 1px;
}
.cursor.blink {
  animation: blink 1.05s step-end infinite;
}
.cursor.idle {
  opacity: 0.45;
  animation: none;
}
@keyframes blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.real-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  font: inherit;
  padding: 0;
  margin: 0;
  resize: none;
  overflow: hidden;
}

/* ─────────────────────────────── statusbar ─────────────────────────────── */

.statusbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  font-size: 12px;
  background: color-mix(in srgb, var(--fg) 4%, var(--bg));
  border-top: 1px solid var(--border);
  color: var(--fg-faint);
  flex: none;
  white-space: nowrap;
  overflow: hidden;
}
.statusbar .seg {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.statusbar .seg.path {
  color: var(--fg-muted);
}
.statusbar .seg .badge {
  color: var(--bg);
  background: var(--accent);
  border-radius: 5px;
  padding: 0 6px;
  font-weight: 700;
}
.statusbar .spacer {
  flex: 1;
}
.statusbar .dim {
  color: var(--fg-faint);
}

/* ───────────────────────── autocomplete dropdown ───────────────────────── */

.autocomplete {
  position: absolute;
  left: var(--pad);
  right: var(--pad);
  bottom: calc(100% + 6px);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  z-index: 5;
}
.ac-wrap {
  position: relative;
}
.ac-item {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 7px 12px;
  cursor: pointer;
}
.ac-item .name {
  color: var(--fg);
}
.ac-item .desc {
  color: var(--fg-faint);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ac-item.active {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
.ac-item.active .name {
  color: var(--accent);
}

/* ─────────────────────────── command palette ─────────────────────────── */

.palette-backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, #000 55%, transparent);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  z-index: 20;
  animation: reveal 0.14s ease both;
}
.palette {
  width: min(560px, 92%);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 40px 90px -30px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}
.palette-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 15px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border);
  caret-color: var(--accent);
}
.palette-input::placeholder {
  color: var(--fg-faint);
}
.palette-list {
  max-height: 44vh;
  overflow-y: auto;
  padding: 6px;
}
.palette-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 9px;
  cursor: pointer;
}
.palette-item .name {
  color: var(--fg);
}
.palette-item .desc {
  color: var(--fg-faint);
  font-size: 12px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.palette-item .cat {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-faint);
}
.palette-item.active {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
.palette-item.active .name {
  color: var(--accent);
}
.palette-empty {
  padding: 18px;
  color: var(--fg-faint);
  text-align: center;
}

/* ─────────────────────────────── mobile ─────────────────────────────── */

@media (max-width: 640px) {
  .screen {
    padding: 0;
  }
  .window {
    width: 100%;
    height: 100dvh;
    border: none;
    border-radius: 0;
  }
  .title-hint {
    display: none;
  }
  .body {
    font-size: 13.5px;
  }
  .statusbar .sm-hide {
    display: none;
  }
}
```

---

## 6. Acceptance criteria

- `npm run build` passes (`tsc --noEmit` clean + `vite build` succeeds).
- Boot shows the **SABHYA** ASCII banner, an info block (name / role / loc /
  clickable github·linkedin links / `/help` hint), and a welcome line.
- Typing `/` opens the menu with exactly:
  `/help /about /projects /experience /skills /resume /contact /theme /clear`
  (no `/?`; aliases hidden from the menu but still work when typed).
- Each command renders the real content from `portfolio.ts`.
- `/theme matrix` (etc.) switches theme and persists across reload.
- `⌘K`/`Ctrl+K` opens the palette; `↑/↓` navigate history; `Tab` completes.
- `/resume` opens `/resume.pdf`; social links open in new tabs.
- Mobile (≤640px) is full-screen with a trimmed status bar.
- No console errors.
- Do not commit unless the user asks.

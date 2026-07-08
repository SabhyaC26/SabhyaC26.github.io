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

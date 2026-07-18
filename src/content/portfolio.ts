/**
 * ─────────────────────────────────────────────────────────────────────────
 *  EDIT ME — the only file you need to touch to make the site yours.
 *  Everything the terminal prints reads from the `portfolio` object below.
 * ─────────────────────────────────────────────────────────────────────────
 */

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
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  socials: SocialLink[];
  email: string;
}

export const portfolio: Portfolio = {
  name: "Sabhya Chhabria",
  handle: "sabhya",
  role: "AI Software Engineer @ Databricks",
  location: "San Francisco, CA",
  tagline:
    "AI software engineer at Databricks building coding agents. Outside of work I cycle, hike, run, swim, eat, and tinker.",

  about: [
    "I'm Sabhya — an AI software engineer at Databricks, where I work on coding agents and agentic systems. I was a core contributor to Omnigent, an open-source meta-harness that runs Claude Code, Codex, and Cursor behind one interface, and I helped take our Supervisor Agent and Knowledge Assistant products from 0 to XXXX+ weekly active customers.",
    "Before Databricks I did my M.S. in CS at Princeton (with the NLP group) and my B.A. in CS at Cornell, with ML research stints at Scale AI and Snap along the way.",
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
        "Led 0-to-1 Supervisor Agent & Knowledge Assistant; demoed at the Data & AI Summit keynote and scaled to XXXX+ weekly active customers.",
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
    { label: "github", handle: "@SabhyaC26", url: "https://github.com/SabhyaC26" },
    { label: "linkedin", handle: "sabhyachhabria", url: "https://linkedin.com/in/sabhyachhabria" },
    { label: "x", handle: "@sabhyac267", url: "https://x.com/sabhyac267" },
    { label: "substack", handle: "@sabhyachhabria", url: "https://substack.com/@sabhyachhabria" },
    { label: "strava", handle: "sabhyachhabria", url: "https://www.strava.com/athletes/105348209" },
  ],

  email: "sabhyachhabria@gmail.com",
};

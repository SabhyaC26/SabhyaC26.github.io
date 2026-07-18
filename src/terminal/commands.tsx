import { useState } from "react";
import type { Command, CommandCategory, ThemeId } from "./types";
import { portfolio } from "../content/portfolio";
import { themeMeta, themeOrder, themes } from "./themes";

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

function Experience() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="out">
      <div className="exp-list">
        {portfolio.experience.map((job, i) => {
          const isOpen = open === i;
          return (
            <div className={`exp-item${isOpen ? " is-open" : ""}`} key={i}>
              <button
                type="button"
                className="exp-row"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="exp-org">{job.org}</span>
                <span className="exp-role">{job.role}</span>
                <span className="exp-period">{job.period}</span>
              </button>
              {isOpen && (
                <div className="exp-detail">
                  {job.location && <div className="exp-location muted">{job.location}</div>}
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
              )}
            </div>
          );
        })}
      </div>
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
  const order: CommandCategory[] = ["about", "work", "system", "fun"];
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
        ↑/↓ history · Tab to complete · Enter to select · ⌘K / Ctrl+K command palette
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
    usage: "/theme [name]",
    summary: "switch color theme",
    category: "system",
    run: (ctx) => {
      const name = ctx.args[0]?.toLowerCase();
      if (!name) {
        ctx.openThemePicker();
        return (
          <div className="out">
            <p className="muted">
              current theme:{" "}
              <span className="accent">{themes[ctx.theme].label}</span>
            </p>
            <div className="stack">
              {themeOrder.map((id) => {
                const t = themeMeta(id);
                const active = themes[ctx.theme].id === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`chip chip-btn${active ? " chip-active" : ""}`}
                    style={{
                      borderColor: active ? t.colors.accent : undefined,
                      color: active ? t.colors.accent : undefined,
                    }}
                    onClick={() => ctx.setThemeId(id)}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="faint">click a theme, or use the picker</p>
          </div>
        );
      }
      if ((themeOrder as string[]).includes(name)) {
        ctx.setThemeId(name as ThemeId);
        return (
          <span className="muted">
            theme → <span className="accent">{themeMeta(name as ThemeId).label}</span>
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

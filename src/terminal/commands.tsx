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

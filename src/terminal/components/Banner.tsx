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

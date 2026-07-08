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

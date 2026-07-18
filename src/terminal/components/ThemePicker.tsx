import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ThemeName } from "../types";
import { themeOrder, themes } from "../themes";

interface ThemePickerProps {
  current: ThemeName;
  onSelect: (name: ThemeName) => void;
  onClose: () => void;
}

export function ThemePicker({ current, onSelect, onClose }: ThemePickerProps) {
  const initial = Math.max(0, themeOrder.indexOf(current));
  const [active, setActive] = useState(initial);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-theme-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(name: ThemeName) {
    onSelect(name);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, themeOrder.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(themeOrder.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(themeOrder[active]);
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
      <div
        className="palette theme-picker"
        onMouseDown={(e) => e.stopPropagation()}
        ref={listRef}
        tabIndex={-1}
        role="listbox"
        aria-label="Color themes"
        onKeyDown={handleKeyDown}
      >
        <div className="theme-picker-header">
          <span className="theme-picker-title">Themes</span>
          <span className="theme-picker-hint">↑↓ · Enter · Esc</span>
        </div>
        <div className="palette-list">
          {themeOrder.map((name, i) => {
            const t = themes[name];
            const selected = name === current;
            return (
              <div
                key={name}
                data-theme-index={i}
                role="option"
                aria-selected={selected}
                className={`palette-item theme-picker-item${i === active ? " active" : ""}${selected ? " selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(name);
                }}
              >
                <span className="theme-swatch" aria-hidden>
                  <span style={{ background: t.colors.bg }} />
                  <span style={{ background: t.colors.fg }} />
                  <span style={{ background: t.colors.accent }} />
                  <span style={{ background: t.colors.green }} />
                </span>
                <span className="name">{t.label}</span>
                {selected && <span className="theme-check">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

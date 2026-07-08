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
    const [currentBrand, currentMode] = theme.split("-") as [string, string];
    const brands = ["github", "vercel", "claude"];
    const nextBrand = brands[(brands.indexOf(currentBrand) + 1) % brands.length];
    applyTheme(`${nextBrand}-${currentMode}` as ThemeName);
  }, [applyTheme, theme]);

  const toggleMode = useCallback(() => {
    const [currentBrand, currentMode] = theme.split("-") as [string, string];
    const nextMode = currentMode === "dark" ? "light" : "dark";
    applyTheme(`${currentBrand}-${nextMode}` as ThemeName);
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
            {portfolio.name.toLowerCase()}
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
          onCycleTheme={cycleTheme}
          onToggleMode={toggleMode}
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const COLS = 28;
const ROWS = 16;
const BIN_COUNT = 5;
/** How far (px) the magnification bubble reaches — wide like the show. */
const LENS_RADIUS = 190;
const SELECT_RADIUS = 64;
/** Peak scale at the cursor center. */
const LENS_MAX_SCALE = 4.2;

const FILE_NAMES = [
  "Cold Harbour",
  "Allentown",
  "Cairns",
  "Siena",
  "Dranesville",
];

const PRAISE = [
  "The numbers are grateful.",
  "Praise Kier!",
  "A job well refined.",
  "The bins accept your offering.",
  "Macrodata soothed. Temper cooled.",
  "You have pleased the board.",
  "The numbers yearned for the bins.",
  "Refinement complete. Mostly.",
  "Scary numbers neutralized (probably).",
  "Kier would be… fine with this.",
];

const SCOLD = [
  "Those numbers were not scared.",
  "You refined the wrong feelings.",
  "The bins are confused but polite.",
  "Please only refine the woeful ones.",
  "That cluster was… fine, actually.",
];

type Cell = {
  id: number;
  digit: number;
  tempered: boolean;
};

type Point = { x: number; y: number };

function makeGrid(): Cell[] {
  const cells: Cell[] = [];
  let id = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        id: id++,
        digit: Math.floor(Math.random() * 10),
        tempered: Math.random() < 0.14,
      });
    }
  }
  return cells;
}

function hexNoise(): string {
  const a = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase();
  const b = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase();
  return `0x${a} : 0x${b}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface MacrodataRefinementProps {
  onClose: () => void;
}

export function MacrodataRefinement({ onClose }: MacrodataRefinementProps) {
  const [cells, setCells] = useState(makeGrid);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [bins, setBins] = useState<number[]>(() => Array(BIN_COUNT).fill(0));
  const [toast, setToast] = useState("Find the woeful numbers. Refine them.");
  const [fileName] = useState(() => pick(FILE_NAMES));
  const [statusHex, setStatusHex] = useState(hexNoise);
  const [dragOverBin, setDragOverBin] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellEls = useRef<Map<number, HTMLButtonElement>>(new Map());
  const pointerRef = useRef<Point | null>(null);
  const selectingRef = useRef(false);
  const selectedRef = useRef(selected);
  const rafRef = useRef<number | null>(null);

  selectedRef.current = selected;

  const overall = useMemo(() => {
    const sum = bins.reduce((a, b) => a + b, 0);
    return Math.min(100, Math.round(sum / BIN_COUNT));
  }, [bins]);

  const refineInto = useCallback(
    (binIndex: number) => {
      const ids = selectedRef.current;
      if (ids.size === 0) {
        setToast("Nothing to refine. Click and drag a cluster first.");
        return;
      }

      let temperedCount = 0;
      for (const id of ids) {
        if (cells[id]?.tempered) temperedCount++;
      }
      const mostlyTempered = temperedCount >= Math.max(1, Math.floor(ids.size * 0.4));
      const gain = Math.min(
        22,
        Math.max(4, Math.round(ids.size * (mostlyTempered ? 1.8 : 0.7))),
      );

      setBins((prev) => {
        const next = [...prev];
        next[binIndex] = Math.min(100, next[binIndex] + gain);
        return next;
      });

      setCells((prev) =>
        prev.map((cell) =>
          ids.has(cell.id)
            ? {
                ...cell,
                digit: Math.floor(Math.random() * 10),
                tempered: Math.random() < 0.12,
              }
            : cell,
        ),
      );

      setSelected(new Set());
      setStatusHex(hexNoise());
      setToast(mostlyTempered ? pick(PRAISE) : pick(SCOLD));
      setDragOverBin(null);
    },
    [cells],
  );

  // Escape + number keys for bins
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= BIN_COUNT) {
        e.preventDefault();
        refineInto(n - 1);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, refineInto]);

  // Focus trap / focus root for a11y
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Lens effect via direct DOM (avoids re-rendering the whole grid on mousemove).
  // Uses layout math (not getBoundingClientRect on scaled cells) so zoom stays stable.
  const applyLens = useCallback(() => {
    rafRef.current = null;
    const p = pointerRef.current;
    const grid = gridRef.current;
    const map = cellEls.current;
    if (!grid) return;

    const gridRect = grid.getBoundingClientRect();
    const cellW = gridRect.width / COLS;
    const cellH = gridRect.height / ROWS;

    for (const [id, el] of map) {
      if (!p) {
        el.style.setProperty("--mdr-scale", "1");
        el.style.setProperty("--mdr-bright", "0.5");
        el.style.setProperty("--mdr-z", "0");
        continue;
      }

      const col = id % COLS;
      const row = Math.floor(id / COLS);
      const cx = gridRect.left + (col + 0.5) * cellW;
      const cy = gridRect.top + (row + 0.5) * cellH;
      const dist = Math.hypot(cx - p.x, cy - p.y);
      const t = Math.max(0, 1 - dist / LENS_RADIUS);
      // Smooth radial bulge — lots of digits swell, strongest at the center
      const bulge = t * t * (3 - 2 * t);
      const scale = 1 + bulge * (LENS_MAX_SCALE - 1);
      const bright = 0.38 + bulge * 0.62;
      el.style.setProperty("--mdr-scale", String(scale));
      el.style.setProperty("--mdr-bright", String(bright));
      el.style.setProperty("--mdr-z", String(Math.round(bulge * 50)));

      if (selectingRef.current && dist < SELECT_RADIUS) {
        if (!selectedRef.current.has(id)) {
          setSelected((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }
      }
    }
  }, []);

  const scheduleLens = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(applyLens);
  }, [applyLens]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Re-apply lens when selection/cells change so scales stay correct
  useEffect(() => {
    scheduleLens();
  }, [cells, selected, scheduleLens]);

  function onGridPointerMove(e: ReactPointerEvent) {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    scheduleLens();
  }

  function onGridPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    selectingRef.current = true;
    setSelected(new Set());
    selectedRef.current = new Set();
    pointerRef.current = { x: e.clientX, y: e.clientY };
    scheduleLens();
  }

  function onGridPointerUp(e: ReactPointerEvent) {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    selectingRef.current = false;

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const binBtn = under?.closest<HTMLElement>("[data-mdr-bin]");
    if (binBtn && selectedRef.current.size > 0) {
      const idx = Number(binBtn.dataset.mdrBin);
      if (!Number.isNaN(idx)) {
        refineInto(idx);
        return;
      }
    }

    if (selectedRef.current.size > 0) {
      setToast(`Selected ${selectedRef.current.size}. Drop on a bin (or press 1–5).`);
    }
  }

  function onGridPointerLeave() {
    if (!selectingRef.current) {
      pointerRef.current = null;
      scheduleLens();
    }
  }

  function resetBoard() {
    setCells(makeGrid());
    setSelected(new Set());
    setBins(Array(BIN_COUNT).fill(0));
    setToast("Fresh file loaded. The numbers await.");
    setStatusHex(hexNoise());
  }

  return (
    <div
      className="mdr"
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Macrodata Refinement"
    >
      <div className="mdr-crt" aria-hidden="true" />
      <div className="mdr-vignette" aria-hidden="true" />

      <header className="mdr-header">
        <div className="mdr-file">{fileName}</div>
        <div className="mdr-progress-label">{overall}% Complete</div>
        <div className="mdr-logo" aria-hidden="true">
          <svg viewBox="0 0 120 40" className="mdr-logo-svg">
            <ellipse cx="60" cy="20" rx="56" ry="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="60" cy="20" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <path
              d="M60 10 Q68 20 60 30 Q52 20 60 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <text x="60" y="24" textAnchor="middle" className="mdr-logo-text">
              LUMON
            </text>
          </svg>
        </div>
      </header>

      <div className="mdr-toast" aria-live="polite">
        {toast}
        {overall >= 100 && (
          <button type="button" className="mdr-reset" onClick={resetBoard}>
            open next file
          </button>
        )}
      </div>

      <div
        className="mdr-grid"
        ref={gridRef}
        onPointerMove={onGridPointerMove}
        onPointerDown={onGridPointerDown}
        onPointerUp={onGridPointerUp}
        onPointerCancel={onGridPointerUp}
        onPointerLeave={onGridPointerLeave}
      >
        {cells.map((cell) => {
          const isSelected = selected.has(cell.id);
          return (
            <button
              key={cell.id}
              type="button"
              className={[
                "mdr-cell",
                cell.tempered ? "is-tempered" : "",
                isSelected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              ref={(el) => {
                if (el) cellEls.current.set(cell.id, el);
                else cellEls.current.delete(cell.id);
              }}
              tabIndex={-1}
              aria-label={`digit ${cell.digit}${cell.tempered ? ", woeful" : ""}`}
            >
              {cell.digit}
            </button>
          );
        })}
      </div>

      <div className="mdr-bins">
        {bins.map((pct, i) => (
          <button
            key={i}
            type="button"
            data-mdr-bin={i}
            className={`mdr-bin${dragOverBin === i ? " is-hot" : ""}`}
            onClick={() => refineInto(i)}
            onPointerEnter={() => {
              if (selected.size > 0) setDragOverBin(i);
            }}
            onPointerLeave={() => setDragOverBin(null)}
            onPointerUp={() => {
              if (selected.size > 0) refineInto(i);
            }}
          >
            <div className="mdr-bin-label">{String(i + 1).padStart(2, "0")}</div>
            <div className="mdr-bin-track">
              <div className="mdr-bin-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="mdr-bin-pct">{pct}%</div>
          </button>
        ))}
      </div>

      <footer className="mdr-footer">
        <span className="mdr-hex">{statusHex}</span>
        <span className="mdr-hint">drag clusters · click bins · Esc to leave</span>
      </footer>
    </div>
  );
}

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type Bounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type WindowProps = {
  title: ReactNode;
  titleTrailing?: ReactNode;
  traffic: ReactNode;
  children: ReactNode;
  /** Element that receives theme CSS variables. */
  contentRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
};

const EDGE_CURSORS: Record<ResizeEdge, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  sw: "nesw-resize",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
}

function centeredBounds(
  defaultWidth: number,
  defaultHeight: number,
): Bounds {
  const pad = 24;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(defaultWidth, vw - pad * 2);
  const h = Math.min(defaultHeight, vh - pad * 2);
  return {
    x: Math.max(pad, Math.round((vw - w) / 2)),
    y: Math.max(pad, Math.round((vh - h) / 2)),
    w,
    h,
  };
}

function constrainBounds(
  next: Bounds,
  minWidth: number,
  minHeight: number,
): Bounds {
  const margin = 48;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = clamp(next.w, minWidth, vw);
  const h = clamp(next.h, minHeight, vh);
  const x = clamp(next.x, margin - w, vw - margin);
  const y = clamp(next.y, 0, vh - margin);
  return { x, y, w, h };
}

export function Window({
  title,
  titleTrailing,
  traffic,
  children,
  contentRef,
  className,
  defaultWidth = 920,
  defaultHeight = 680,
  minWidth = 420,
  minHeight = 280,
}: WindowProps) {
  const [bounds, setBounds] = useState<Bounds>(() =>
    typeof window === "undefined"
      ? { x: 40, y: 40, w: defaultWidth, h: defaultHeight }
      : centeredBounds(defaultWidth, defaultHeight),
  );
  const [maximized, setMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mobile, setMobile] = useState(isMobileViewport);

  const preMaxRef = useRef<Bounds | null>(null);
  const dragRef = useRef<{
    kind: "move" | "resize";
    edge?: ResizeEdge;
    startX: number;
    startY: number;
    origin: Bounds;
  } | null>(null);

  // Keep mobile fullscreen in sync with viewport.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Re-center if the window would fall off-screen after a resize.
  useLayoutEffect(() => {
    if (mobile || maximized) return;
    setBounds((b) => constrainBounds(b, minWidth, minHeight));
  }, [mobile, maximized, minWidth, minHeight]);

  const toggleMaximize = useCallback(() => {
    if (mobile) return;
    setMaximized((m) => {
      if (m) {
        if (preMaxRef.current) setBounds(preMaxRef.current);
        preMaxRef.current = null;
        return false;
      }
      setBounds((current) => {
        preMaxRef.current = current;
        return {
          x: 0,
          y: 0,
          w: window.innerWidth,
          h: window.innerHeight,
        };
      });
      return true;
    });
  }, [mobile]);

  // Keep maximized windows flush with the viewport.
  useEffect(() => {
    if (!maximized || mobile) return;
    function onResize() {
      setBounds({
        x: 0,
        y: 0,
        w: window.innerWidth,
        h: window.innerHeight,
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maximized, mobile]);

  const endPointer = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      e.preventDefault();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const o = drag.origin;

      if (drag.kind === "move") {
        setBounds(
          constrainBounds(
            { ...o, x: o.x + dx, y: o.y + dy },
            minWidth,
            minHeight,
          ),
        );
        return;
      }

      const edge = drag.edge!;
      let { x, y, w, h } = o;
      if (edge.includes("e")) w = o.w + dx;
      if (edge.includes("s")) h = o.h + dy;
      if (edge.includes("w")) {
        w = o.w - dx;
        x = o.x + dx;
      }
      if (edge.includes("n")) {
        h = o.h - dy;
        y = o.y + dy;
      }

      // Prevent flipping past min size when dragging left/top edges.
      if (w < minWidth) {
        if (edge.includes("w")) x = o.x + o.w - minWidth;
        w = minWidth;
      }
      if (h < minHeight) {
        if (edge.includes("n")) y = o.y + o.h - minHeight;
        h = minHeight;
      }

      setBounds(constrainBounds({ x, y, w, h }, minWidth, minHeight));
    }

    function onUp() {
      endPointer();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [endPointer, minHeight, minWidth]);

  const startMove = useCallback(
    (e: ReactPointerEvent) => {
      if (mobile || maximized) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input")) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      dragRef.current = {
        kind: "move",
        startX: e.clientX,
        startY: e.clientY,
        origin: bounds,
      };
      setDragging(true);
    },
    [bounds, maximized, mobile],
  );

  const startResize = useCallback(
    (edge: ResizeEdge) => (e: ReactPointerEvent) => {
      if (mobile || maximized) return;
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        kind: "resize",
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origin: bounds,
      };
      setDragging(true);
    },
    [bounds, maximized, mobile],
  );

  const onTitleDoubleClick = useCallback(() => {
    toggleMaximize();
  }, [toggleMaximize]);

  const style: CSSProperties | undefined = mobile
    ? undefined
    : maximized
      ? { left: 0, top: 0, width: "100%", height: "100%" }
      : {
          left: bounds.x,
          top: bounds.y,
          width: bounds.w,
          height: bounds.h,
        };

  const cls = [
    "window",
    mobile ? "window--mobile" : "window--floating",
    maximized ? "window--maximized" : "",
    dragging ? "window--dragging" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      style={style}
      ref={contentRef}
      role="dialog"
      aria-label="Terminal"
    >
      <div
        className="titlebar"
        onPointerDown={startMove}
        onDoubleClick={onTitleDoubleClick}
      >
        <div className="traffic">{traffic}</div>
        <div className="title">{title}</div>
        {titleTrailing ? <div className="title-hint">{titleTrailing}</div> : null}
      </div>

      {children}

      {!mobile && !maximized && (
        <div className="resize-handles" aria-hidden="true">
          {(Object.keys(EDGE_CURSORS) as ResizeEdge[]).map((edge) => (
            <div
              key={edge}
              className={`resize-handle resize-handle--${edge}`}
              style={{ cursor: EDGE_CURSORS[edge] }}
              onPointerDown={startResize(edge)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

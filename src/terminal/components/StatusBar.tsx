interface StatusBarProps {
  themeLabel: string;
  metaLabel: string;
  onOpenPalette: () => void;
  onOpenThemePicker: () => void;
}

export function StatusBar({
  themeLabel,
  metaLabel,
  onOpenPalette,
  onOpenThemePicker,
}: StatusBarProps) {
  return (
    <div className="statusbar">
      <span
        className="seg"
        role="button"
        tabIndex={0}
        title="Choose theme"
        aria-label={`Theme ${themeLabel}. Click to choose a theme.`}
        style={{ cursor: "pointer", userSelect: "none" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onOpenThemePicker();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenThemePicker();
          }
        }}
      >
        theme&nbsp;<span className="badge">{themeLabel}</span>
      </span>
      <span className="spacer" />
      <span className="dim sm-hide">
        type <span className="accent">/help</span>
      </span>
      <span className="dim sm-hide">·</span>
      <span
        className="dim"
        role="button"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onOpenPalette();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenPalette();
          }
        }}
      >
        <span className="accent">{metaLabel}K</span> palette
      </span>
    </div>
  );
}

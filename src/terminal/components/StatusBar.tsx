interface StatusBarProps {
  theme: string;
  metaLabel: string;
  onOpenPalette: () => void;
  onOpenThemePicker: () => void;
  onToggleMode: () => void;
}

export function StatusBar({
  theme,
  metaLabel,
  onOpenPalette,
  onOpenThemePicker,
  onToggleMode,
}: StatusBarProps) {
  const [themeName, themeMode] = theme.split("-") as [string, string];

  return (
    <div className="statusbar">
      <span
        className="seg"
        role="button"
        tabIndex={0}
        title="Choose theme"
        aria-label={`Theme ${themeName}. Click to choose a theme.`}
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
        theme&nbsp;<span className="badge">{themeName}</span>
      </span>
      <span className="dim">·</span>
      <span
        className="seg"
        role="button"
        tabIndex={0}
        title="Toggle light / dark"
        aria-label={`Mode ${themeMode}. Click to toggle light or dark.`}
        style={{ cursor: "pointer", userSelect: "none" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onToggleMode();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleMode();
          }
        }}
      >
        mode&nbsp;<span className="badge">{themeMode}</span>
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

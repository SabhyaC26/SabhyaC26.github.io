interface StatusBarProps {
  theme: string;
  metaLabel: string;
  onOpenPalette: () => void;
  onCycleTheme: () => void;
  onToggleMode: () => void;
}

export function StatusBar({
  theme,
  metaLabel,
  onOpenPalette,
  onCycleTheme,
  onToggleMode,
}: StatusBarProps) {
  const [themeName, themeMode] = theme.split("-") as [string, string];

  return (
    <div className="statusbar">
      <span
        className="seg"
        role="button"
        tabIndex={-1}
        style={{ cursor: "pointer", userSelect: "none" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onCycleTheme();
        }}
      >
        theme&nbsp;<span className="badge">{themeName}</span>
      </span>
      <span className="dim">·</span>
      <span
        className="seg"
        role="button"
        tabIndex={-1}
        style={{ cursor: "pointer", userSelect: "none" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onToggleMode();
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
        tabIndex={-1}
        style={{ cursor: "pointer" }}
        onMouseDown={(e) => {
          e.preventDefault();
          onOpenPalette();
        }}
      >
        <span className="accent">{metaLabel}K</span> palette
      </span>
    </div>
  );
}

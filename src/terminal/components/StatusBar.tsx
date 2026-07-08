interface StatusBarProps {
  theme: string;
  metaLabel: string;
  onOpenPalette: () => void;
}

export function StatusBar({ theme, metaLabel, onOpenPalette }: StatusBarProps) {
  return (
    <div className="statusbar">
      <span className="seg path sm-hide">~/portfolio</span>
      <span className="dim sm-hide">·</span>
      <span className="seg">
        theme&nbsp;<span className="badge">{theme}</span>
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

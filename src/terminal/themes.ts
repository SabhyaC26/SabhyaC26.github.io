import type { Theme, ThemeColors, ThemeId, ThemeMode, ThemeName } from "./types";

export const themeIds: ThemeId[] = ["github", "claude", "monokai"];

export const themes: Record<ThemeName, Theme> = {
  "github-dark": {
    name: "github-dark",
    id: "github",
    mode: "dark",
    label: "GitHub",
    preview: { bg: "#e7f0ff", fg: "#0969da" },
    colors: {
      bg: "#0d1117",
      bgElevated: "#161b22",
      fg: "#c9d1d9",
      fgMuted: "#8b949e",
      fgFaint: "#484f58",
      accent: "#58a6ff",
      green: "#3fb950",
      red: "#f85149",
      yellow: "#d29922",
      blue: "#58a6ff",
      border: "#30363d",
      selection: "rgba(56, 139, 253, 0.18)",
    },
  },
  "github-light": {
    name: "github-light",
    id: "github",
    mode: "light",
    label: "GitHub",
    preview: { bg: "#e7f0ff", fg: "#0969da" },
    colors: {
      bg: "#ffffff",
      bgElevated: "#f6f8fa",
      fg: "#24292f",
      fgMuted: "#57606a",
      fgFaint: "#8c959f",
      accent: "#0969da",
      green: "#1a7f37",
      red: "#cf222e",
      yellow: "#9a6700",
      blue: "#0969da",
      border: "#d0d7de",
      selection: "rgba(9, 105, 218, 0.12)",
    },
  },
  "claude-dark": {
    name: "claude-dark",
    id: "claude",
    mode: "dark",
    label: "Claude",
    preview: { bg: "#fde8df", fg: "#c45c38" },
    colors: {
      bg: "#1b1816",
      bgElevated: "#26211e",
      fg: "#f7f4eb",
      fgMuted: "#b4b0a9",
      fgFaint: "#6e6a64",
      accent: "#e05c38",
      green: "#52a875",
      red: "#e05c38",
      yellow: "#e2b13c",
      blue: "#60a5fa",
      border: "#3a3530",
      selection: "rgba(224, 92, 56, 0.18)",
    },
  },
  "claude-light": {
    name: "claude-light",
    id: "claude",
    mode: "light",
    label: "Claude",
    preview: { bg: "#fde8df", fg: "#c45c38" },
    colors: {
      bg: "#fbfaf7",
      bgElevated: "#f5f2eb",
      fg: "#191919",
      fgMuted: "#6e6a64",
      fgFaint: "#b4b0a9",
      accent: "#d97753",
      green: "#3b7a57",
      red: "#c84b31",
      yellow: "#b8860b",
      blue: "#2563eb",
      border: "#e9e5dc",
      selection: "rgba(217, 119, 83, 0.12)",
    },
  },
  "monokai-dark": {
    name: "monokai-dark",
    id: "monokai",
    mode: "dark",
    label: "Monokai",
    preview: { bg: "#fce7f3", fg: "#e14775" },
    colors: {
      bg: "#272822",
      bgElevated: "#1e1f1c",
      fg: "#f8f8f2",
      fgMuted: "#a59f85",
      fgFaint: "#75715e",
      accent: "#a6e22e",
      green: "#a6e22e",
      red: "#f92672",
      yellow: "#e6db74",
      blue: "#66d9ef",
      border: "#3e3d32",
      selection: "rgba(166, 226, 46, 0.16)",
    },
  },
  "monokai-light": {
    name: "monokai-light",
    id: "monokai",
    mode: "light",
    label: "Monokai",
    preview: { bg: "#fce7f3", fg: "#e14775" },
    colors: {
      bg: "#faf8f5",
      bgElevated: "#f3f0e9",
      fg: "#2d2a2e",
      fgMuted: "#6e6a64",
      fgFaint: "#b0ada5",
      accent: "#e14775",
      green: "#269d6b",
      red: "#e14775",
      yellow: "#c18401",
      blue: "#1c8dc7",
      border: "#e5e1d8",
      selection: "rgba(225, 71, 117, 0.12)",
    },
  },
};

export const defaultTheme: ThemeName = "github-dark";
export const defaultThemeId: ThemeId = "github";
export const defaultThemeMode: ThemeMode = "dark";

/** Brand order shown in the theme picker. */
export const themeOrder: ThemeId[] = ["github", "claude", "monokai"];

export function themeName(id: ThemeId, mode: ThemeMode): ThemeName {
  return `${id}-${mode}`;
}

export function parseThemeName(name: string): { id: ThemeId; mode: ThemeMode } | null {
  const [id, mode] = name.split("-") as [string, string];
  if (!(themeIds as string[]).includes(id)) return null;
  if (mode !== "dark" && mode !== "light") return null;
  return { id: id as ThemeId, mode };
}

/** Resolve a saved value, migrating old vercel-* keys. */
export function resolveSavedTheme(saved: string | null): ThemeName {
  if (!saved) return defaultTheme;
  if (saved.startsWith("vercel-")) {
    const mode = saved.endsWith("light") ? "light" : "dark";
    return themeName("github", mode);
  }
  if (parseThemeName(saved)) return saved as ThemeName;
  return defaultTheme;
}

/** Representative theme entry for picker previews (mode-independent). */
export function themeMeta(id: ThemeId): Theme {
  return themes[themeName(id, "dark")];
}

/** Build the inline CSS-variable style object for a theme. */
export function themeVars(colors: ThemeColors): Record<string, string> {
  return {
    "--bg": colors.bg,
    "--bg-elevated": colors.bgElevated,
    "--fg": colors.fg,
    "--fg-muted": colors.fgMuted,
    "--fg-faint": colors.fgFaint,
    "--accent": colors.accent,
    "--green": colors.green,
    "--red": colors.red,
    "--yellow": colors.yellow,
    "--blue": colors.blue,
    "--border": colors.border,
    "--selection": colors.selection,
  };
}

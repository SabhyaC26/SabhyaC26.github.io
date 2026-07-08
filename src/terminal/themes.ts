import type { Theme, ThemeColors, ThemeName } from "./types";

export const themes: Record<ThemeName, Theme> = {
  dusk: {
    name: "dusk",
    label: "dusk",
    colors: {
      bg: "#0b0d10",
      bgElevated: "#11151b",
      fg: "#dfe3ea",
      fgMuted: "#98a2b2",
      fgFaint: "#5a6472",
      accent: "#e8b17a",
      green: "#8fce9b",
      red: "#e5896f",
      yellow: "#e6c07b",
      blue: "#83b3e6",
      border: "#1b2028",
      selection: "rgba(232, 177, 122, 0.22)",
    },
  },
  amber: {
    name: "amber",
    label: "amber",
    colors: {
      bg: "#140f02",
      bgElevated: "#1c1503",
      fg: "#ffcf6b",
      fgMuted: "#c8912f",
      fgFaint: "#7d5a17",
      accent: "#ffb000",
      green: "#e8c34a",
      red: "#ff8a4c",
      yellow: "#ffd166",
      blue: "#e0aa3e",
      border: "#33260a",
      selection: "rgba(255, 176, 0, 0.24)",
    },
  },
  matrix: {
    name: "matrix",
    label: "matrix",
    colors: {
      bg: "#000502",
      bgElevated: "#02110a",
      fg: "#7dffa0",
      fgMuted: "#37b060",
      fgFaint: "#1c6236",
      accent: "#b8ff9e",
      green: "#7dffa0",
      red: "#ff7b7b",
      yellow: "#d6ff7d",
      blue: "#7dffd1",
      border: "#0c2a19",
      selection: "rgba(125, 255, 160, 0.20)",
    },
  },
  mono: {
    name: "mono",
    label: "mono",
    colors: {
      bg: "#0a0a0a",
      bgElevated: "#121212",
      fg: "#ededed",
      fgMuted: "#8a8a8a",
      fgFaint: "#555555",
      accent: "#ffffff",
      green: "#cfcfcf",
      red: "#d99",
      yellow: "#e3e3e3",
      blue: "#bcbcbc",
      border: "#1e1e1e",
      selection: "rgba(255, 255, 255, 0.16)",
    },
  },
  paper: {
    name: "paper",
    label: "paper",
    colors: {
      bg: "#f4f1ea",
      bgElevated: "#eae6dc",
      fg: "#2c2a26",
      fgMuted: "#6d685f",
      fgFaint: "#a49d90",
      accent: "#b5651d",
      green: "#4f7a3f",
      red: "#b5432f",
      yellow: "#a9812a",
      blue: "#2f6f9f",
      border: "#ddd6c8",
      selection: "rgba(181, 101, 29, 0.18)",
    },
  },
};

export const defaultTheme: ThemeName = "dusk";

export const themeOrder: ThemeName[] = ["dusk", "amber", "matrix", "mono", "paper"];

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

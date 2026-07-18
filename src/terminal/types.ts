import type { ReactNode } from "react";

export type ThemeName =
  | "github-dark"
  | "github-light"
  | "vercel-dark"
  | "vercel-light"
  | "claude-dark"
  | "claude-light";

export interface ThemeColors {
  bg: string;
  bgElevated: string;
  fg: string;
  fgMuted: string;
  fgFaint: string;
  accent: string;
  green: string;
  red: string;
  yellow: string;
  blue: string;
  border: string;
  selection: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
}

export type CommandCategory = "about" | "work" | "system" | "fun";

export interface CommandContext {
  /** Arguments after the command name, split on whitespace. */
  args: string[];
  /** The full raw input line. */
  raw: string;
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  /** Open the visual theme picker overlay. */
  openThemePicker: () => void;
  /** Wipe the scrollback. */
  clearHistory: () => void;
  /** Programmatically run another command line. */
  runCommand: (input: string) => void;
}

/** A command returns a node to print, or nothing for side-effect-only commands. */
export type CommandRun = (ctx: CommandContext) => ReactNode | void;

export interface Command {
  name: string;
  aliases?: string[];
  summary: string;
  usage?: string;
  category: CommandCategory;
  /** Hidden commands don't show up in `help` (easter eggs). */
  hidden?: boolean;
  run: CommandRun;
}

export interface HistoryEntry {
  id: string;
  /** The command that produced this entry, or null for system/boot output. */
  prompt: string | null;
  node: ReactNode;
  /** Whether to play the reveal animation for this entry. */
  animate: boolean;
}

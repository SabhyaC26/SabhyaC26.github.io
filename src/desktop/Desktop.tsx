import type { ReactNode } from "react";

type DesktopProps = {
  children: ReactNode;
};

/**
 * Desktop shell: wallpaper + full-viewport stage for floating windows.
 * Theme CSS variables live on each window, not here.
 */
export function Desktop({ children }: DesktopProps) {
  return (
    <div className="desktop" role="presentation">
      <div className="desktop-wallpaper" aria-hidden="true" />
      <div className="desktop-stage">{children}</div>
    </div>
  );
}

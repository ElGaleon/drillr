import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";

export const drillrTheme = {
  colors: {
    pageBg: "#f6f5f1",
    sidebarBg: "#f2f2ec",
    sidebarHover: "#e9e9e2",
    ink: "#1d211d",
    inkSoft: "#343a34",
    inkMuted: "#7b817a",
    inkFaint: "#a6aaa4",
    onInk: "#ffffff",
    surface: "#fffefa",
    surfaceMuted: "#eeeee8",
    line: "#e5e4dc",
    lineStrong: "#d2d2c9",
    accent: "#ec6a3d",
    accentDeep: "#cf512d",
    accentSoft: "#fbe6db",
    ring: "#ec6a3d",
    success: "#397046",
    successSoft: "#e8f2e9",
    successIconSoft: "#e5f0e6",
    warning: "#94631a",
    warningIcon: "#a2601d",
    warningSoft: "#fff1d8",
    warningIconSoft: "#fff0d5",
    danger: "#a94839",
    dangerText: "#b44939",
    dangerSoft: "#fce9e5",
    lavender: "#665b92",
    lavenderSoft: "#eeeafa",
    statusDot: "#68a36b",
    statusDotRing: "#dcecdc",
    avatarBg: "#dec1b5",
    avatarText: "#673629",
    onInkMuted: "#aeb6ac",
    progressTrack: "#424940",
    focusLink: "#ffb69d",
    skeletonMid: "#f3f2ed",
    skeletonRowMid: "#f8f7f2",
    overlay: "rgba(19,22,19,0.38)",
  },
  typography: {
    body: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    display: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  },
  radius: { control: "8px", card: "16px", pill: "12px" },
  spacing: { unit: "4px", contentMax: "1240px" },
  shadow: {
    card: "0 10px 35px rgba(29,31,28,0.045)",
    dialog: "0 24px 80px rgba(20,28,21,0.2)",
    sidebar: "16px 0 40px rgba(29,33,29,0.09)",
    toggle: "0 3px 10px rgba(29,33,29,0.08)",
    active: "0 2px 8px rgba(29,33,29,0.04)",
  },
} as const;

export type DrillrTheme = typeof drillrTheme;
const ThemeContext = createContext<DrillrTheme>(drillrTheme);

export function ThemeProvider({ children, theme = drillrTheme }: { children: ReactNode; theme?: DrillrTheme }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const variables: Record<string, string> = {
      "--page-bg": theme.colors.pageBg,
      "--sidebar-bg": theme.colors.sidebarBg,
      "--sidebar-hover": theme.colors.sidebarHover,
      "--ink": theme.colors.ink,
      "--ink-soft": theme.colors.inkSoft,
      "--ink-muted": theme.colors.inkMuted,
      "--ink-faint": theme.colors.inkFaint,
      "--on-ink": theme.colors.onInk,
      "--surface": theme.colors.surface,
      "--surface-muted": theme.colors.surfaceMuted,
      "--line": theme.colors.line,
      "--line-strong": theme.colors.lineStrong,
      "--accent": theme.colors.accent,
      "--accent-deep": theme.colors.accentDeep,
      "--accent-soft": theme.colors.accentSoft,
      "--ring": theme.colors.ring,
      "--success": theme.colors.success,
      "--success-soft": theme.colors.successSoft,
      "--success-icon-soft": theme.colors.successIconSoft,
      "--warning": theme.colors.warning,
      "--warning-icon": theme.colors.warningIcon,
      "--warning-soft": theme.colors.warningSoft,
      "--warning-icon-soft": theme.colors.warningIconSoft,
      "--danger": theme.colors.danger,
      "--danger-text": theme.colors.dangerText,
      "--danger-soft": theme.colors.dangerSoft,
      "--lavender": theme.colors.lavender,
      "--lavender-soft": theme.colors.lavenderSoft,
      "--status-dot": theme.colors.statusDot,
      "--status-dot-ring": theme.colors.statusDotRing,
      "--avatar-bg": theme.colors.avatarBg,
      "--avatar-text": theme.colors.avatarText,
      "--on-ink-muted": theme.colors.onInkMuted,
      "--progress-track": theme.colors.progressTrack,
      "--focus-link": theme.colors.focusLink,
      "--skeleton-mid": theme.colors.skeletonMid,
      "--skeleton-row-mid": theme.colors.skeletonRowMid,
      "--overlay": theme.colors.overlay,
      "--font-body": theme.typography.body,
      "--font-display": theme.typography.display,
      "--radius-control": theme.radius.control,
      "--radius-card": theme.radius.card,
      "--radius-pill": theme.radius.pill,
      "--space-unit": theme.spacing.unit,
      "--content-max": theme.spacing.contentMax,
      "--shadow-card": theme.shadow.card,
      "--shadow-dialog": theme.shadow.dialog,
      "--shadow-sidebar": theme.shadow.sidebar,
      "--shadow-toggle": theme.shadow.toggle,
      "--shadow-active": theme.shadow.active,
    };
    const previous = new Map<string, string>();
    Object.entries(variables).forEach(([name, value]) => { previous.set(name, root.style.getPropertyValue(name)); root.style.setProperty(name, value); });
    return () => previous.forEach((value, name) => { if (value) root.style.setProperty(name, value); else root.style.removeProperty(name); });
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }

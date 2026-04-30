type TemplateTheme = {
  palette: {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    pageBackground: string;
  };
  line: "soft" | "none" | "block";
  density: "compact" | "comfortable";
  textStyle: "roman" | "italic";
  showIcon: boolean;
};

type TemplateConfig = {
  aside?: { width?: string; height?: string };
  theme: TemplateTheme;
};

export function buildThemeVars(config: TemplateConfig): Record<string, string> {
  const p = config.theme.palette;
  return {
    "--cv-primary": p.primary,
    "--cv-secondary": p.secondary,
    "--cv-text": p.text,
    "--cv-muted": p.muted,
    "--cv-page-bg": p.pageBackground,
    "--cv-aside-width": config.aside?.width ?? "240px",
    "--cv-aside-height": config.aside?.height ?? "100%",
    "--cv-density-gap": config.theme.density === "compact" ? "8px" : "14px",
    "--cv-font-style": config.theme.textStyle === "italic" ? "italic" : "normal",
    "--cv-line-style":
      config.theme.line === "block"
        ? "2px solid var(--cv-primary)"
        : config.theme.line === "soft"
        ? "1px solid color-mix(in srgb, var(--cv-primary) 30%, white)"
        : "none"
  };
}

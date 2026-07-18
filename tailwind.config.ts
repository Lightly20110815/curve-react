import type { Config } from "tailwindcss";

/**
 * Curve — Newspaper edition.
 *
 * Palette: aged newsprint paper + warm ink black + a single vintage red.
 * Type voice: readable CJK serif for content, sans for UI, mono only for short Latin labels.
 */
const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "2.5rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1200px" },
    },
    extend: {
      colors: {
        paper: "hsl(var(--paper))",
        "paper-warm": "hsl(var(--paper-warm))",
        "paper-soft": "hsl(var(--paper-soft))",

        ink: "hsl(var(--ink))",
        "ink-strong": "hsl(var(--ink-strong))",
        "ink-body": "hsl(var(--ink-body))",
        "ink-muted": "hsl(var(--ink-muted))",
        "ink-faded": "hsl(var(--ink-faded))",

        rule: "hsl(var(--rule))",
        "rule-soft": "hsl(var(--rule-soft))",

        stamp: "hsl(var(--stamp))",            // vintage red
        "stamp-soft": "hsl(var(--stamp-soft))", // washed pink for blush highlights

        // Shorthand aliases used by various utilities
        background: "hsl(var(--paper))",
        foreground: "hsl(var(--ink))",
        border: "hsl(var(--rule-soft))",
        ring: "hsl(var(--stamp))",
      },
      fontFamily: {
        // Masthead — heaviest serif for the nameplate
        masthead: [
          '"Playfair Display"',
          '"Noto Serif SC"',
          "Georgia",
          "serif",
        ],
        // Display headlines — keep mixed Chinese/Latin titles in one readable CJK serif.
        display: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          "SimSun",
          '"Playfair Display"',
          "serif",
        ],
        // Body — readable Chinese-first serif; Latin display faces stay out of prose.
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          "SimSun",
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
        // UI sans — only for nav links + buttons + minor labels
        sans: [
          "Inter",
          '"Noto Sans SC"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        // Mono — classifieds, dates, edition numbers
        mono: [
          '"JetBrains Mono"',
          '"Noto Sans SC"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        // Masthead — huge nameplate
        "masthead-xl": ["96px", { lineHeight: "0.95", letterSpacing: "0" }],
        "masthead-lg": ["72px", { lineHeight: "0.95", letterSpacing: "0" }],
        // Headlines
        "head-xl": ["72px", { lineHeight: "1.08", letterSpacing: "0" }],
        "head-lg": ["54px", { lineHeight: "1.12", letterSpacing: "0" }],
        "head-md": ["40px", { lineHeight: "1.16", letterSpacing: "0" }],
        "head-sm": ["28px", { lineHeight: "1.22", letterSpacing: "0" }],
        // Editorial labels (uppercase tracked)
        "label-md": ["13px", { lineHeight: "1.4", letterSpacing: "0" }],
        "label-sm": ["11px", { lineHeight: "1.4", letterSpacing: "0" }],
        // Body
        "lede": ["20px", { lineHeight: "1.6" }],
        "body-lg": ["18px", { lineHeight: "1.7" }],
        "body": ["16px", { lineHeight: "1.7" }],
        "body-sm": ["14px", { lineHeight: "1.6" }],
        "caption": ["12px", { lineHeight: "1.5" }],
      },
      spacing: {
        section: "96px",
      },
      borderRadius: {
        xs: "2px",
        sm: "3px",
        md: "4px",  // sharper edges; newspapers don't round much
      },
      maxWidth: {
        content: "1180px",
        prose: "680px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;

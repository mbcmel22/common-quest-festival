import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E1E1E",
        "ink-soft": "#2A2A2A",
        paper: "#EFEFEF",
        "paper-dim": "#DFDFDF",
        acid: "#E7FF36",
        violet: "#7E1AFF",
        smoke: "#8A8A8A"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      opacity: { 8: "0.08", 12: "0.12", 15: "0.15", 18: "0.18" },
      borderRadius: { blob: "42% 58% 46% 54% / 54% 46% 58% 42%" },
      maxWidth: { shell: "1240px" }
    }
  },
  plugins: []
};
export default config;

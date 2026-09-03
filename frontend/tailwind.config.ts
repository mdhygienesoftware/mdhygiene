import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#123A5C",
        blue: "#1E62B0",
        pink: "#E4779F",
        cream: "#FBF6F2",
        "cream-2": "#FDF1F5",
        border: "#F0E4DC",
        muted: "#8A7B73",
        "muted-2": "#7E8C93",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

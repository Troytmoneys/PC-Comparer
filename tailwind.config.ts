import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        muted: "#667085",
        line: "#d0d5dd",
        sage: "#0f766e",
        ember: "#d85535",
        cobalt: "#275da8",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

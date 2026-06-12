import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#24304f",
        muted: "#6f7891",
        line: "#e5d8ca",
        paper: "#fff8e8",
        primary: "#ff5a4f",
        sunshine: "#ffd447",
        sky: "#43a7ff",
        mint: "#38c976"
      },
      boxShadow: {
        soft: "0 12px 0 rgba(36, 48, 79, 0.06), 0 18px 38px rgba(36, 48, 79, 0.08)",
        sticker: "5px 5px 0 rgba(36, 48, 79, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

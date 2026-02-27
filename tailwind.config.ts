import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        salmon: {
          DEFAULT: "#FFA07A",
          hover: "#ff8a5c",
        },
        orchid: "#BA55D3",
        blue: {
          DEFAULT: "#0000FF",
        },
        smoke: "#F5F5F5",
        "text-primary": "#000000",
        "text-secondary": "#555555",
        "text-tertiary": "#888888",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        container: "1200px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        pill: "100px",
      },
      fontSize: {
        h1: ["clamp(40px, 5.5vw, 80px)", { lineHeight: "1.0" }],
        h2: ["clamp(28px, 3.5vw, 52px)", { lineHeight: "1.1" }],
        h3: ["clamp(20px, 2vw, 35px)", { lineHeight: "1.1" }],
        h4: ["clamp(18px, 1.5vw, 24px)", { lineHeight: "1.2" }],
        body: ["clamp(16px, 1.2vw, 20px)", { lineHeight: "1.6" }],
        "body-lg": ["clamp(17px, 1.4vw, 21px)", { lineHeight: "1.7" }],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#002659",
        "navy-light": "#172C65",
        red: "#BE1A2C",
        "red-bright": "#C81E31",
        "off-white": "#EDECEC",
        ink: "#172133",
        sky: "#E8F0FA",
        mist: "#D7E5F4"
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.0625rem", { lineHeight: "1.6rem" }],
        xl: ["1.1875rem", { lineHeight: "1.7rem" }],
        "2xl": ["1.375rem", { lineHeight: "1.9rem" }],
        "3xl": ["1.625rem", { lineHeight: "2.05rem" }],
        "4xl": ["1.9375rem", { lineHeight: "2.25rem" }],
        "5xl": ["2.5rem", { lineHeight: "1.05" }],
        "6xl": ["3.125rem", { lineHeight: "1.05" }],
        "7xl": ["3.625rem", { lineHeight: "1.02" }]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 38, 89, 0.12)"
      },
      transitionTimingFunction: {
        nautica: "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "wave-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        wave: "wave-scroll 16s linear infinite",
        "wave-slow": "wave-scroll 24s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;

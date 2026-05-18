
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      perspective: {
        '1000': '1000px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        modern: {
          primary: "#10b981",     // emerald accent (status / live)
          background: "#fafaf9",  // light background
          secondary: "#a3a3a3",   // muted neutrals
          text: "#171717",        // body text
          depth: "#0a0a0a",       // surfaces
        },
        portfolio: {
          black: "#09090b",       // zinc-950 — primary surface (dark)
          gunmetal: "#18181b",    // zinc-900 — elevated surface
          almond: "#fafafa",      // zinc-50 — primary text (dark mode)
          khaki: "#34d399",       // emerald-400 — accent
          walnut: "#27272a",      // zinc-800 — borders / dividers
        },
        ink: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        accent2: {
          DEFAULT: "#34d399",
          glow:    "#10b981",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(230, 57, 70, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(230, 57, 70, 0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        tiltEffect: {
          "0%, 100%": { transform: "rotateX(0deg) rotateY(0deg)" },
          "25%": { transform: "rotateX(2deg) rotateY(-2deg)" },
          "50%": { transform: "rotateX(0deg) rotateY(0deg)" },
          "75%": { transform: "rotateX(-2deg) rotateY(2deg)" },
        },
        horizontalScroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.9)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        tapRipple: {
          "0%":   { transform: "translate(-50%, -50%) scale(0.4)", opacity: "0" },
          "20%":  { opacity: "0.55" },
          "100%": { transform: "translate(-50%, -50%) scale(2.4)", opacity: "0" },
        },
        slowSpin: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        haloPulse: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%":      { opacity: "0.85", transform: "scale(1.05)" },
        },
        driftA: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%":      { transform: "translate(12%, 8%) scale(1.1)" },
          "66%":      { transform: "translate(-6%, 14%) scale(0.95)" },
        },
        driftB: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%":      { transform: "translate(-10%, 10%) scale(0.92)" },
          "66%":      { transform: "translate(8%, -6%) scale(1.08)" },
        },
        driftC: {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%":      { transform: "translate(5%, -8%) scale(1.12)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "tilt": "tiltEffect 8s ease-in-out infinite",
        "h-scroll": "horizontalScroll 30s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "marquee": "marquee 40s linear infinite",
        "tap-ripple": "tapRipple 3.2s ease-out infinite",
        "slow-spin": "slowSpin 28s linear infinite",
        "halo-pulse": "haloPulse 6s ease-in-out infinite",
        "drift-a": "driftA 14s ease-in-out infinite",
        "drift-b": "driftB 18s ease-in-out infinite",
        "drift-c": "driftC 22s ease-in-out infinite",
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.perspective-1000': {
          perspective: '1000px',
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config;

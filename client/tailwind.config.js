/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        "bg-page": "hsl(var(--background))",
        "bg-sidebar": "hsl(var(--card))",
        "bg-surface": "hsl(var(--card))",
        "on-surface": "hsl(var(--foreground))",
        "bg-hover": "hsl(var(--accent))",
        "brand-gradient": "linear-gradient(135deg, #5B4FE8 0%, #8B5CF6 50%, #A78BFA 100%)",
        "text-secondary": "hsl(var(--muted-foreground))",
        "text-tertiary": "hsl(var(--muted-foreground))",
        "outline": "hsl(var(--border))",
      },
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "page-padding": "28px",
              "card-padding": "24px",
              "base": "4px",
              "sm": "8px",
              "xs": "4px",
              "2xl": "24px",
              "content-max-width": "1360px",
              "lg": "16px",
              "3xl": "28px",
              "md": "12px",
              "sidebar-width": "256px",
              "topbar-height": "56px",
              "4xl": "32px",
              "xl": "20px"
      },
      "fontFamily": {
              "display-3xl": ["Outfit"],
              "body-base": ["Inter"],
              "headline-xl": ["Outfit"],
              "headline-2xl-mobile": ["Outfit"],
              "display-7xl": ["Outfit"],
              "headline-2xl": ["Outfit"],
              "body-sm": ["Inter"],
              "code-mono": ["JetBrains Mono"],
              "display-4xl": ["Outfit"],
              "label-xs": ["Inter"],
              "headline-lg": ["Inter"]
      },
      "fontSize": {
              "display-3xl": ["30px", { "lineHeight": "38px", "letterSpacing": "-0.015em", "fontWeight": "700" }],
              "body-base": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
              "headline-xl": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
              "headline-2xl-mobile": ["20px", { "lineHeight": "28px", "fontWeight": "700" }],
              "display-7xl": ["72px", { "lineHeight": "80px", "letterSpacing": "-0.025em", "fontWeight": "800" }],
              "headline-2xl": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.025em", "fontWeight": "700" }],
              "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
              "code-mono": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
              "display-4xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
              "label-xs": ["12px", { "lineHeight": "16px", "letterSpacing": "0.06em", "fontWeight": "600" }],
              "headline-lg": ["18px", { "lineHeight": "24px", "fontWeight": "600" }]
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

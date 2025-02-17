import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'coordinate-light': '#739552',
        'coordinate-dark': '#EBECD0',
      },
      backgroundImage: {
        'Chessboard-1': "url('/Chessboard-1.jpg')",
      }
    },
  },
  plugins: [],
} satisfies Config;


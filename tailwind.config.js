/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(255 251 241)',
        fg: 'rgb(26 18 0)',
        accent: 'rgb(255 176 0)',
        gold: '#F0AD00',
      },
      fontFamily: {
        nunito: ['"Nunito"', '"SF Pro Rounded"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"Inter"', 'system-ui', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        locket: {
          "primary": "#FFB000",
          "secondary": "#F0AD00",
          "accent": "#FFB000",
          "neutral": "#1A1200",
          "base-100": "#FFFBF1",
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
}

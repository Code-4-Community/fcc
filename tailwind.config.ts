import type { Config } from 'tailwindcss'

export default {
  content: [
    './apps/frontend/index.html',
    './apps/frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config


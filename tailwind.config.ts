import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './apps/frontend/**/*.{js,ts,jsx,tsx,html}',
    './libs/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config


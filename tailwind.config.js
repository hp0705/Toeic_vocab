/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',

        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)'
        },
        ok: {
          DEFAULT: 'var(--ok)',
          light: 'var(--ok-light)'
        },
        bad: {
          DEFAULT: 'var(--bad)',
          light: 'var(--bad-light)'
        },
        'accent-warn': {
          DEFAULT: 'var(--accent-warn)',
          light: 'var(--accent-warn-light)'
        },

        pos: {
          n: 'var(--pos-n)',
          'n-bg': 'var(--pos-n-bg)',
          v: 'var(--pos-v)',
          'v-bg': 'var(--pos-v-bg)',
          adj: 'var(--pos-adj)',
          'adj-bg': 'var(--pos-adj-bg)',
          adv: 'var(--pos-adv)',
          'adv-bg': 'var(--pos-adv-bg)'
        }
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sheet: 'var(--shadow-sheet)'
      }
    }
  },
  plugins: []
};

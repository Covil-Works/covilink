/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0c10',
          800: '#12141c',
          700: '#1a1d29',
          600: '#25293c',
          500: '#333852',
        },
        brand: {
          pink: '#ff3b94',
          purple: '#9d4edf',
          cyan: '#00f2fe',
          accent: '#7928ca',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 25px -5px rgba(255, 59, 148, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(157, 78, 223, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
      }
    },
  },
  plugins: [],
}

/*
 * The whole palette and type scale. A late-night cinema in Pune:
 * warm black, cream text, marigold for anything you can act on,
 * and a teal reserved for "verified" facts.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0d0b09', // page
        soot: '#17140f', // cards
        ash: '#262119', // raised / hover
        line: '#3a3328', // hairlines
        cream: '#f3ede2', // text
        dust: '#a89f90', // secondary text (7:1 on night)
        marigold: '#f2a23a', // actions, focus, the brand
        verified: '#5cc2b3', // checked facts
        missing: '#ff8a7a', // [missing: ...] placeholders
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        drift: { from: { transform: 'translate3d(0,0,0)' }, to: { transform: 'translate3d(-50%,0,0)' } },
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        zoom: { from: { transform: 'scale(1.05)' }, to: { transform: 'scale(1.25)' } },
      },
      animation: {
        drift: 'drift 90s linear infinite',
        rise: 'rise .5s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}

import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/big-shoulders-display/latin-700.css'
import '@fontsource/big-shoulders-display/latin-800.css'
import '@fontsource/big-shoulders-display/latin-900.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './index.css'
import App from './App'

// The production build ships pre-rendered HTML (scripts/prerender.mjs), so
// React attaches to it. In dev the root is empty and React renders fresh.
const root = document.getElementById('root')
if (root.hasChildNodes()) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)

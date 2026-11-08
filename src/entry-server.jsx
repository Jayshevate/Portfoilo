// Used only at build time by scripts/prerender.mjs to turn <App/> into HTML.
import { renderToString } from 'react-dom/server'
import App from './App'

export const render = () => renderToString(<App />)

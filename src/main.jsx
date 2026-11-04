import { createRoot } from 'react-dom/client'
import '@fontsource/young-serif/latin-400.css'
import '@fontsource/courier-prime/latin-400.css'
import '@fontsource/courier-prime/latin-400-italic.css'
import '@fontsource/courier-prime/latin-700.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'
import './styles/notebook.css'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)

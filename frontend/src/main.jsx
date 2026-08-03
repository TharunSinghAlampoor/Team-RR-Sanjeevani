import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { purgeUnwantedCookies } from './utils/cookieUtils'

// Purge unwanted/junk third-party cookies on startup while preserving essential app cookies
purgeUnwantedCookies();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

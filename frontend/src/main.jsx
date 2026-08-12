import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { purgeUnwantedCookies } from './utils/cookieUtils'

// Auto-recover from dynamic module chunk loading errors during new deployments
window.addEventListener('error', (event) => {
  const msg = String(event?.message || '');
  if (msg.includes('dynamically imported module') || msg.includes('Loading chunk') || msg.includes('Failed to fetch')) {
    if (!sessionStorage.getItem('chunk_recovery_attempt')) {
      sessionStorage.setItem('chunk_recovery_attempt', 'true');
      window.location.reload();
    }
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = String(event?.reason?.message || event?.reason || '');
  if (reason.includes('dynamically imported module') || reason.includes('Loading chunk') || reason.includes('Failed to fetch')) {
    if (!sessionStorage.getItem('chunk_recovery_attempt')) {
      sessionStorage.setItem('chunk_recovery_attempt', 'true');
      window.location.reload();
    }
  }
});

// Purge unwanted/junk third-party cookies on startup while preserving essential app cookies
purgeUnwantedCookies();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

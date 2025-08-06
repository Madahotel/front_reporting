import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.jsx'

// ✅ Disabler logs ho an'ny production Vite
if (import.meta.env.MODE === 'production') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.trace = () => {};
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

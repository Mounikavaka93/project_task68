import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { MarketProvider } from './context/MarketContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MarketProvider>
          <App />
        </MarketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

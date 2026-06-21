import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import './index.css'
import { isAuth0Configured } from './lib/auth0Config'
import Auth0ProviderWithNavigate from './components/Auth0ProviderWithNavigate'
import { initMonitoring } from './lib/monitoring'
import { LocaleProvider } from './i18n'

initMonitoring()

const appTree = (
  <BrowserRouter>
    <LocaleProvider>
      {isAuth0Configured() ? (
        <Auth0ProviderWithNavigate>
          <App />
        </Auth0ProviderWithNavigate>
      ) : (
        <App />
      )}
      <Analytics />
    </LocaleProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{appTree}</React.StrictMode>,
)
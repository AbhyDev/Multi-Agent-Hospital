import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App'

const el = document.getElementById('root')!
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

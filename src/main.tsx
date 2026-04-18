import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Polyfill window.storage with localStorage wrapper
window.storage = window.storage || {
  get: (key: string) => Promise.resolve({ value: localStorage.getItem(key) }),
  set: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value))
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

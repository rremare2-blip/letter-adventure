import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Polyfill window.storage with localStorage wrapper
window.storage = window.storage || {
    get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
    set: (key, value) => Promise.resolve(localStorage.setItem(key, value))
};
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));

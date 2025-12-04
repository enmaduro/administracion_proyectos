import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Aplicacion from './Aplicacion';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Aplicacion />
  </React.StrictMode>
);
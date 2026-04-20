import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- REGISTRO DO SERVICE WORKER PARA NOTIFICAÇÕES PUSH ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // O sw.js deve estar dentro da pasta 'public' na raiz do projeto
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.error('❌ Falha ao registrar o Service Worker:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
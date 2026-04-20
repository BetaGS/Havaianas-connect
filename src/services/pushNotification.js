// src/services/pushNotification.js

// Chave pública fornecida pelo seu servidor
const PUBLIC_VAPID_KEY = "BGJ6TON0nIcsUzfW7oD-mjyziRuEIz7WbRen612Ke6S7GmS_AbzZuQ8wKeIYNZsLUmzXNqfnQHWIyvRLKYDVhSM"; 

/**
 * Converte a chave VAPID de string para o formato Uint8Array exigido pelo navegador
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function configurarNotificacoes() {
  // 1. Verifica suporte básico
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log("⚠️ Notificações Push não são suportadas neste navegador.");
    return;
  }

  try {
    // 2. Solicita permissão explicitamente
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("🚫 Permissão de notificação negada pelo usuário.");
      return;
    }

    // 3. Aguarda o Service Worker estar pronto
    const registration = await navigator.serviceWorker.ready;
    
    // 4. Verifica se já existe uma inscrição ativa
    let subscription = await registration.pushManager.getSubscription();

    // 5. Se não houver, ou se precisar renovar, cria uma nova
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log("🆕 Nova inscrição Push gerada.");
    }

    // 6. SEMPRE envia a inscrição para o Backend (Render)
    // Isso garante que se o servidor reiniciou e limpou a memória, ele receba seu ID de novo
    const response = await fetch('https://havaianas-backend.onrender.com/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log("✅ Endereço do dispositivo sincronizado com o servidor.");
    } else {
      console.error("❌ Falha ao sincronizar com o servidor:", response.status);
    }

  } catch (error) {
    console.error("❌ Erro crítico ao configurar Push:", error);
  }
}
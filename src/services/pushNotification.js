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

/**
 * Registra o dispositivo para receber notificações genéricas
 */
export async function configurarNotificacoes() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log("⚠️ Notificações Push não são suportadas neste navegador.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("🚫 Permissão de notificação negada.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log("🆕 Nova inscrição Push gerada.");
    }

    // Envia para a rota padrão de inscrição
    await fetch('https://havaianas-backend.onrender.com/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Erro ao configurar Push:", error);
  }
}

/**
 * VINCULA o dispositivo ao usuário logado (Gabriel, Gustavo, etc.)
 * Isso resolve o erro de "Missing export" no Render
 */
export async function sincronizarPushComUsuario(username) {
  if (!username) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log(`🔗 Vinculando dispositivo ao usuário: ${username}`);
      await fetch('https://havaianas-backend.onrender.com/api/auth/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          subscription: subscription,
          username: username 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("❌ Erro ao sincronizar Push com usuário:", error);
  }
}
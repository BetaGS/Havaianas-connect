// src/services/pushNotification.js

// Substitua pela sua chave pública gerada pelo npx web-push
const PUBLIC_VAPID_KEY = "BGJ6TON0nIcsUzfW7oD-mjyziRuEIz7WbRen612Ke6S7GmS_AbzZuQ8wKeIYNZsLUmzXNqfnQHWIyvRLKYDVhSM"; 

// O 'export' antes de 'async function' é OBRIGATÓRIO
export async function configurarNotificacoes() {
  if (!('serviceWorker' in navigator)) {
    console.log("Service Worker não suportado.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("Permissão de notificação negada.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY
      });
    }

    // Altere para a URL real do seu backend no Render
    await fetch('https://havaianas-backend.onrender.com/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Dispositivo inscrito para Push.");
  } catch (error) {
    console.error("❌ Erro ao configurar notificações:", error);
  }
}
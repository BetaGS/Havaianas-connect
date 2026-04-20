// src/services/pushNotification.js

const PUBLIC_VAPID_KEY = 'SUA_CHAVE_PUBLICA_AQUI';

export async function subscribeUserToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  // Verifica se já existe uma inscrição
  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    // Cria uma nova inscrição
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: PUBLIC_VAPID_KEY
    });
    
    // ENVIA PARA O BACKEND (Aquela rota /subscribe que criamos no server.js)
    await fetch('https://havaianas-backend.onrender.com/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📱 Dispositivo inscrito com sucesso!');
  }
}
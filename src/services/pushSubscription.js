// src/services/pushSubscription.js

const publicVapidKey = 'BGJ6TON0nIcsUzfW7oD-mjyziRuEIz7WbRen612Ke6S7GmS_AbzZuQ8wKeIYNZsLUmzXNqfnQHWIyvRLKYDVhSM';

export async function substituirOuCriarInscricao(username) {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registro = await navigator.serviceWorker.ready;
    
    // 1. Solicita permissão explicitamente
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') {
      console.warn('Permissão de notificação negada.');
      return;
    }

    // 2. Cria a inscrição no servidor de Push do navegador (Google/Apple)
    const subscription = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKey
    });

    // 3. Envia o token para o seu Backend salvar no MongoDB
    await fetch('https://havaianas-connect-jnx2.onrender.com/api/auth/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        subscription: subscription
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Celular inscrito para receber notificações no bolso!');
  } catch (error) {
    console.error('❌ Erro ao inscrever para Push:', error);
  }
}
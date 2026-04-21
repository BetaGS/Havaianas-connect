// public/sw.js

self.addEventListener('push', function(event) {
  let data = { title: 'Havaianas Connect', body: 'Novo pedido!', pedido: null, url: '/estoque' };
  
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    console.error('Erro ao converter JSON do Push');
  }

  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      // Captura a URL que veio do servidor ou usa /estoque como padrão
      url: data.url || '/estoque', 
      pedido: data.pedido
    }
  };

  // Envia a mensagem para o React imediatamente se o app estiver aberto
  if (data.pedido) {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOVO_PEDIDO_PUSH',
          pedido: data.pedido
        });
      });
    });
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const pedidoData = event.notification.data.pedido;
  // Monta a URL completa (ex: https://seu-app.onrender.com/estoque)
  const targetUrl = new URL(event.notification.data.url || '/estoque', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // 1. Tenta achar uma aba que já está aberta
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        
        // Se achar qualquer aba do app aberta
        if ('focus' in client) {
          // Envia o pedido para o React
          if (pedidoData) {
            client.postMessage({ type: 'NOVO_PEDIDO_PUSH', pedido: pedidoData });
          }
          
          // Se a aba não estiver na URL correta, força a navegação
          if (client.url !== targetUrl && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          
          return client.focus();
        }
      }

      // 2. Se o app estiver totalmente fechado, abre direto na URL de estoque
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
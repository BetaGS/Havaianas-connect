// public/sw.js
self.addEventListener('push', function(event) {
  let data = { title: 'Havaianas Connect', body: 'Novo pedido!', pedido: null };
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
      url: '/',
      pedido: data.pedido // Guardamos o pedido aqui dentro
    }
  };

  // Envia a mensagem para o React imediatamente
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

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Se já houver aba aberta, foca nela e manda o pedido de novo por segurança
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if ('focus' in client) {
          if (pedidoData) {
            client.postMessage({ type: 'NOVO_PEDIDO_PUSH', pedido: pedidoData });
          }
          return client.focus();
        }
      }
      // Se não houver aba, abre o app
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
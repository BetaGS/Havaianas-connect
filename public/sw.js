// public/sw.js

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Define a URL de destino. Se não vier no push, vai para a raiz.
  // IMPORTANTE: Use a URL completa do seu projeto no Render se necessário
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Se o app já estiver aberto em algum lugar, foca nele
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não estiver aberto, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  
  // Se o push trouxer os dados do pedido, vamos salvar no cache local
  if (data.pedido) {
    event.waitUntil(
      savePedidoToLocalStorage(data.pedido)
    );
  }

  const options = {
    body: data.body || 'Novo pedido recebido!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Função para tentar salvar no LocalStorage (via IndexedDB ou Cache)
async function savePedidoToLocalStorage(pedido) {
  // O Service Worker não acessa o localStorage diretamente, 
  // mas pode enviar uma mensagem para o App atualizar
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  allClients.forEach(client => {
    client.postMessage({
      type: 'NOVO_PEDIDO_PUSH',
      pedido: pedido
    });
  });
}
/* eslint-disable no-restricted-globals */

// Instalação: Força o SW a se tornar ativo imediatamente
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listener para Push Notifications (Servidor enviando)
self.addEventListener('push', function(event) {
    let data = { 
        title: '📦 Novo Pedido Havaianas!', 
        body: 'Você recebeu um novo pedido para separar.', 
        pedido: null, 
        url: '/estoquista' 
    };
    
    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        console.error('Erro ao processar JSON do push', e);
    }

    const options = {
        body: data.body,
        icon: '/favicon.svg', // Recomendado usar o ícone que você já tem
        badge: '/favicon.svg',
        vibrate: [200, 100, 200, 100, 200], // Padrão de vibração mais longo
        data: {
            // Ajustado para a rota correta que definimos no App.jsx
            url: data.url && data.url.includes('estoque') ? '/estoquista' : (data.url || '/estoquista'),
            pedido: data.pedido
        },
        tag: 'novo-pedido-estoquista',
        renotify: true, // Vibra novamente se chegar outro pedido com a mesma tag
        requireInteraction: true // A notificação não some até o usuário clicar
    };

    // Avisa as abas abertas sobre o novo pedido via Message
    if (data.pedido) {
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'NOVO_PEDIDO_PUSH',
                        pedido: data.pedido
                    });
                });
            })
        );
    }

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Listener de clique na notificação
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const pedidoData = event.notification.data.pedido;
    const path = event.notification.data.url;
    const targetUrl = new URL(path, self.location.origin).href;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // 1. Tenta achar uma aba já aberta
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                
                if ('focus' in client) {
                    // Envia os dados do pedido para a aba existente
                    if (pedidoData) {
                        client.postMessage({ type: 'NOVO_PEDIDO_PUSH', pedido: pedidoData });
                    }
                    
                    // Se a aba estiver em outra rota, navega para /estoquista
                    if (client.url !== targetUrl && 'navigate' in client) {
                        return client.navigate(targetUrl).then(c => c.focus());
                    }
                    
                    return client.focus();
                }
            }

            // 2. Se o app estiver fechado, abre na rota correta
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// Listener para mensagens diretas do App (Socket -> SW)
// Isso ajuda a disparar a notificação visual mesmo se o socket estiver ativo
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EXIBIR_NOTIFICACAO_MANUAL') {
        const options = {
            body: event.data.body,
            icon: '/favicon.svg',
            vibrate: [200, 100, 200],
            tag: 'novo-pedido-estoquista',
            data: { url: '/estoquista' }
        };
        self.registration.showNotification(event.data.title, options);
    }
});
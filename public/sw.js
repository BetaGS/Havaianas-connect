// public/sw.js

self.addEventListener('push', function(event) {
    let data = { 
        title: '📦 Novo Pedido Havaianas!', 
        body: 'Você recebeu um novo pedido.', 
        pedido: null, 
        url: '/estoque' 
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
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        data: {
            // Garante que a URL sempre comece com /
            url: data.url && data.url.startsWith('/') ? data.url : '/estoque',
            pedido: data.pedido
        },
        // Tag impede que várias notificações se empilhem, elas se atualizam
        tag: 'novo-pedido-estoque'
    };

    // Tenta avisar o React imediatamente caso o app esteja aberto em segundo plano
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

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const pedidoData = event.notification.data.pedido;
    const path = event.notification.data.url;
    // Cria a URL absoluta (ex: https://havaianas.onrender.com/estoque)
    const targetUrl = new URL(path, self.location.origin).href;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // 1. Tenta achar uma aba já aberta do seu site
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                
                if ('focus' in client) {
                    // Manda o pedido para o contexto via mensagem
                    if (pedidoData) {
                        client.postMessage({ type: 'NOVO_PEDIDO_PUSH', pedido: pedidoData });
                    }
                    
                    // Se a aba estiver na Home, força ela a ir para o Estoque
                    if (client.url !== targetUrl && 'navigate' in client) {
                        return client.navigate(targetUrl).then(c => c.focus());
                    }
                    
                    return client.focus();
                }
            }

            // 2. Se o app estiver fechado, abre direto na rota correta
            // CRITICAL: Isso só funciona sem Not Found se o arquivo _redirects estiver no servidor!
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
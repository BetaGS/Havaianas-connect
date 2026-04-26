/* eslint-disable no-restricted-globals */

// Força o Service Worker a assumir o controle imediatamente
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listener para Push Notifications (Vindo do seu Backend via Web Push)
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
        console.error('Erro ao processar JSON do push:', e);
    }

    const options = {
        body: data.body,
        icon: '/favicon.svg', 
        badge: '/favicon.svg',
        vibrate: [300, 100, 300, 100, 300], // Vibração um pouco mais forte para o bolso
        data: {
            url: data.url && data.url.includes('estoque') ? '/estoquista' : (data.url || '/estoquista'),
            pedido: data.pedido
        },
        tag: 'novo-pedido-estoquista',
        renotify: true, 
        requireInteraction: true // A notificação fica na tela até o estoquista clicar
    };

    // Tenta avisar as janelas abertas sobre o pedido para atualizar a lista sem refresh
    if (data.pedido) {
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
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

// Lógica de quando o Estoquista clica na notificação
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const path = event.notification.data.url || '/estoquista';
    const targetUrl = new URL(path, self.location.origin).href;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // 1. Se já existir uma aba aberta, foca nela e navega para a rota
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    if (client.url !== targetUrl && 'navigate' in client) {
                        return client.navigate(targetUrl).then(c => c.focus());
                    }
                    return client.focus();
                }
            }

            // 2. Se não houver aba aberta, abre uma nova
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// Listener para disparos manuais via App (Socket -> SW)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EXIBIR_NOTIFICACAO_MANUAL') {
        const options = {
            body: event.data.body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200],
            tag: 'novo-pedido-estoquista',
            requireInteraction: true,
            data: { url: '/estoquista' }
        };
        event.waitUntil(self.registration.showNotification(event.data.title, options));
    }
});/* eslint-disable no-restricted-globals */

// Força o Service Worker a assumir o controle imediatamente
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listener para Push Notifications (Vindo do seu Backend via Web Push)
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
        console.error('Erro ao processar JSON do push:', e);
    }

    const options = {
        body: data.body,
        icon: '/favicon.svg', 
        badge: '/favicon.svg',
        vibrate: [300, 100, 300, 100, 300], // Vibração um pouco mais forte para o bolso
        data: {
            url: data.url && data.url.includes('estoque') ? '/estoquista' : (data.url || '/estoquista'),
            pedido: data.pedido
        },
        tag: 'novo-pedido-estoquista',
        renotify: true, 
        requireInteraction: true // A notificação fica na tela até o estoquista clicar
    };

    // Tenta avisar as janelas abertas sobre o pedido para atualizar a lista sem refresh
    if (data.pedido) {
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
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

// Lógica de quando o Estoquista clica na notificação
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const path = event.notification.data.url || '/estoquista';
    const targetUrl = new URL(path, self.location.origin).href;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // 1. Se já existir uma aba aberta, foca nela e navega para a rota
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    if (client.url !== targetUrl && 'navigate' in client) {
                        return client.navigate(targetUrl).then(c => c.focus());
                    }
                    return client.focus();
                }
            }

            // 2. Se não houver aba aberta, abre uma nova
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// Listener para disparos manuais via App (Socket -> SW)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EXIBIR_NOTIFICACAO_MANUAL') {
        const options = {
            body: event.data.body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200],
            tag: 'novo-pedido-estoquista',
            requireInteraction: true,
            data: { url: '/estoquista' }
        };
        event.waitUntil(self.registration.showNotification(event.data.title, options));
    }
});
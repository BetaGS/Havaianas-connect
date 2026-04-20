import { io } from 'socket.io-client';

// Certifique-se de que a URL está correta e com HTTPS
const SERVER_URL = 'https://havaianas-backend.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(nome, tipo) {
    return new Promise((resolve, reject) => {
      // Se já houver uma conexão ativa e conectada, não criar outra
      if (this.socket && this.socket.connected) {
        return resolve();
      }

      console.log(`🔌 Conectando ao servidor: ${SERVER_URL}`);
      
      this.socket = io(SERVER_URL, {
        // 'polling' primeiro é fundamental para funcionar em 4G/redes móveis
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 30000, // Aumentado para 30s para dar tempo do Render acordar
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado ao servidor Socket!');
        this.isConnected = true;
        
        // Registro do usuário no servidor
        this.socket.emit('registrar', { nome, tipo });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão:', error.message);
        this.isConnected = false;
        // Não rejeitamos aqui para permitir que a reconexão automática do Socket.io trabalhe
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('⚠️ Desconectado:', reason);
        this.isConnected = false;
      });

      // Configurar ouvintes globais apenas uma vez
      this.setupGlobalListeners();
    });
  }

  setupGlobalListeners() {
    // Escutar novos pedidos vindos do servidor (Enviados por outros celulares)
    this.socket.on('atualizar_pedidos', (pedido) => {
      console.log('📦 Novo pedido recebido via rede:', pedido);
      if (this.onPedidoCallback) this.onPedidoCallback(pedido);
    });

    // Escutar atualizações de status (ex: Estoquista concluiu um pedido)
    this.socket.on('pedido_atualizado', (dados) => {
      console.log('🔄 Status do pedido atualizado:', dados);
      if (this.onStatusCallback) this.onStatusCallback(dados);
    });
  }

  // --- MÉTODOS DE AÇÃO ---

  enviarPedido(pedido) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('novo_pedido', pedido);
      console.log('📤 Pedido disparado para a rede:', pedido);
      return true;
    }
    console.error('❌ Falha ao enviar: Socket desconectado.');
    return false;
  }

  confirmarPedidoConcluido(pedidoId, solicitante, estoquista) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('status_pedido', { 
        pedidoId, 
        solicitante, 
        estoquista, 
        status: 'concluido' 
      });
    }
  }

  // --- REGISTRO DE CALLBACKS (Usados nas Telas) ---

  onPedidoRecebido(callback) {
    this.onPedidoCallback = callback;
  }

  onPedidoFinalizado(callback) {
    this.onStatusCallback = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
}

export default new SocketService();
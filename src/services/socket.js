import { io } from 'socket.io-client';

// URL do seu backend hospedado no Render
const SERVER_URL = 'https://havaianas-backend.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect(nome, tipo) {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Conectando ao servidor: ${SERVER_URL}`);
      
      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado ao servidor!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Registrar usuário
        this.socket.emit('registrar', { nome, tipo });
        
        resolve();
      });

      this.socket.on('registrado', (data) => {
        console.log('📱', data.mensagem);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão:', error.message);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Não foi possível conectar ao servidor após várias tentativas'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ Desconectado do servidor:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Servidor desconectou, tentar reconectar manualmente
          this.socket.connect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconectado após ${attemptNumber} tentativas`);
        this.isConnected = true;
        // Re-registrar usuário
        this.socket.emit('registrar', { nome, tipo });
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Vendedor/Caixa/Gerente: Enviar pedido
  enviarPedido(pedido) {
    if (this.socket && this.isConnected) {
      this.socket.emit('novo_pedido', pedido);
      console.log('📤 Pedido enviado:', pedido);
      return true;
    }
    console.error('❌ Não conectado ao servidor. Tentando reconectar...');
    return false;
  }

  // Estoquista: Receber pedido
  onPedidoRecebido(callback) {
    if (this.socket) {
      this.socket.on('pedido_recebido', (pedido) => {
        console.log('📦 Pedido recebido em tempo real!', pedido);
        callback(pedido);
      });
    }
  }

  // Estoquista: Confirmar pedido concluído
  confirmarPedidoConcluido(pedidoId, solicitante, estoquista) {
    if (this.socket && this.isConnected) {
      this.socket.emit('pedido_concluido', { pedidoId, solicitante, estoquista });
      console.log(`✅ Pedido #${pedidoId} concluído por ${estoquista}`);
    }
  }

  // Vendedor: Receber confirmação de conclusão
  onPedidoFinalizado(callback) {
    if (this.socket) {
      this.socket.on('pedido_finalizado', callback);
    }
  }

  // Vendedor: Receber confirmação de envio
  onPedidoEnviado(callback) {
    if (this.socket) {
      this.socket.on('pedido_enviado', callback);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketService();
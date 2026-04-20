import { io } from 'socket.io-client';

const SERVER_URL = 'https://havaianas-backend.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(nome, tipo) {
    return new Promise((resolve) => {
      if (this.socket?.connected) return resolve();

      this.socket = io(SERVER_URL, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado ao servidor!');
        this.isConnected = true;
        this.socket.emit('registrar', { nome, tipo });
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('⚠️ Desconectado');
      });

      // ESCUTAR O EVENTO VINDO DO BACKEND (CORRIGIDO)
      this.socket.on('atualizar_pedidos', (pedido) => {
        if (this.onPedidoCallback) this.onPedidoCallback(pedido);
      });

      // ESCUTAR ATUALIZAÇÃO DE STATUS
      this.socket.on('pedido_atualizado', (dados) => {
        if (this.onStatusCallback) this.onStatusCallback(dados);
      });
    });
  }

  // Função para o Estoquista registrar o que fazer quando o pedido chegar
  onPedidoRecebido(callback) {
    this.onPedidoCallback = callback;
  }

  // Função para o Vendedor registrar o que fazer quando o pedido for concluído
  onPedidoFinalizado(callback) {
    this.onStatusCallback = callback;
  }

  enviarPedido(pedido) {
    if (this.socket && this.isConnected) {
      this.socket.emit('novo_pedido', pedido);
      return true;
    }
    return false;
  }

  confirmarPedidoConcluido(pedidoId, solicitante, estoquista) {
    if (this.socket && this.isConnected) {
      this.socket.emit('status_pedido', { 
        pedidoId, 
        solicitante, 
        estoquista, 
        status: 'concluido' 
      });
    }
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

export default new SocketService();
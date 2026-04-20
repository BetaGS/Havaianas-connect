// src/components/TelaEstoquista.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import socketService from '../../services/socket';
import { NotificacaoCelularProvider } from '../../components/NotificacaoCelular/NotificacaoCelular';
import { checkBackendHealth, testConnection } from '../../services/healthCheck';
import './TelaEstoquista.css';

const TelaEstoquistaContent = ({ onVoltar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { pedidos, atualizarPedido, adicionarPedido } = usePedidos();
  const [filtro, setFiltro] = useState('todos');
  const [conectado, setConectado] = useState(false);
  const [novaNotificacao, setNovaNotificacao] = useState(null);
  const [servidorStatus, setServidorStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  // Criamos uma referência para os pedidos. 
  // Isso permite que o Socket veja a lista atualizada sem reiniciar o useEffect.
  const pedidosRef = useRef(pedidos);
  useEffect(() => {
    pedidosRef.current = pedidos;
  }, [pedidos]);

  const verificarBackend = useCallback(async () => {
    try {
      const health = await checkBackendHealth();
      if (health.online) {
        setServidorStatus('online');
        const test = await testConnection();
        setLatency(test.latency);
      } else {
        setServidorStatus('offline');
      }
    } catch (error) {
      setServidorStatus('offline');
    }
  }, []);

  useEffect(() => {
    verificarBackend();
    const healthInterval = setInterval(verificarBackend, 30000);

    const iniciarConexao = async () => {
      try {
        // Conecta ao socket (O service já usa Polling primeiro para celulares)
        await socketService.connect('Estoquista', 'estoquista');
        setConectado(true);

        // Configura o que fazer quando um pedido chegar
        socketService.onPedidoRecebido((novoPedido) => {
          console.log('📦 Socket: Novo pedido detectado!', novoPedido);

          // 1. Verifica se o pedido já existe para não duplicar na tela
          const jaExiste = pedidosRef.current.find(p => p.id === novoPedido.id);
          if (jaExiste) return;

          // 2. Adiciona ao estado global (faz o card aparecer na lista)
          adicionarPedido({
            ...novoPedido,
            status: 'pendente'
          });

          // 3. Notificações Visuais e Sonoras
          setNovaNotificacao(novoPedido);
          new Audio('/notification.mp3').play().catch(() => {});
          
          if (window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
          }

          // Notificação de Sistema (Push)
          if (Notification.permission === 'granted') {
            new Notification('📦 Novo Pedido Havaianas!', {
              body: `${novoPedido.solicitante} enviou uma nova solicitação.`,
              icon: '/havaianas-icon.png'
            });
          }

          setTimeout(() => setNovaNotificacao(null), 6000);
        });

      } catch (error) {
        console.error('Erro na conexão do Estoquista:', error);
        setConectado(false);
      }
    };

    iniciarConexao();

    return () => {
      clearInterval(healthInterval);
      // Não desconectamos o socket aqui para manter a escuta ativa se o componente remontar
    };
    // Deixamos o array de dependências limpo para a conexão ser estável
  }, [adicionarPedido, verificarBackend]);

  const concluirPedido = (pedido) => {
    atualizarPedido(pedido.id, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
    
    // Avisa o servidor e o vendedor que está pronto
    socketService.confirmarPedidoConcluido(pedido.id, pedido.solicitante, 'Estoquista');
    
    alert(`✅ Pedido #${pedido.id} concluído com sucesso!`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendentes') return p.status === 'pendente';
    if (filtro === 'concluidos') return p.status === 'concluido';
    return true;
  });

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* Barra de Status */}
      <div className={`server-status ${servidorStatus}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {servidorStatus === 'online' ? `🌐 Servidor Online (${latency}ms)` : `⚠️ Servidor Offline`}
        </span>
      </div>

      <div className={`ws-status ${conectado ? 'conectado' : 'desconectado'}`}>
        <span className="status-indicador"></span>
        {conectado ? '📡 Recebendo pedidos em tempo real' : '⚠️ Tentando conectar ao tempo real...'}
      </div>

      {/* Alerta Popup */}
      {novaNotificacao && (
        <div className={`alerta-novo-pedido ${novaNotificacao.urgencia ? 'urgente' : ''}`}>
          <div className="alerta-conteudo">
            <span className="alerta-icone">🔔</span>
            <div>
              <strong>PEDIDO RECEBIDO!</strong>
              <p>{novaNotificacao.solicitante} • {novaNotificacao.itens?.length || 0} itens</p>
            </div>
          </div>
          <button className="alerta-fechar" onClick={() => setNovaNotificacao(null)}>✕</button>
        </div>
      )}

      <div className="controles-topo">
        <button className="theme-toggle" onClick={toggleDarkMode}>{darkMode ? '☀️' : '🌙'}</button>
        <button className="btn-voltar" onClick={onVoltar}>← Sair</button>
      </div>

      <div className="estoquista-header">
        <h1>📦 PAINEL DO ESTOQUE</h1>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'ativo' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={filtro === 'pendentes' ? 'ativo' : ''} onClick={() => setFiltro('pendentes')}>Pendentes</button>
        <button className={filtro === 'concluidos' ? 'ativo' : ''} onClick={() => setFiltro('concluidos')}>Concluídos</button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">📭 Nenhum pedido por enquanto...</div>
        ) : (
          pedidosFiltrados.sort((a, b) => b.id - a.id).map(pedido => (
            <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
              <div className="pedido-header">
                <span className="pedido-id">#{pedido.id}</span>
                <span className={`status-tag ${pedido.status}`}>{pedido.status}</span>
              </div>
              <div className="pedido-corpo">
                <p><strong>Solicitante:</strong> {pedido.solicitante}</p>
                <p><strong>Hora:</strong> {pedido.horarioPedido}</p>
                <div className="itens-badge-container">
                  {pedido.itens?.map((item, idx) => (
                    <div key={idx} className="item-badge">
                      {item.nome} - Tam {item.tamanho} (x{item.quantidade})
                    </div>
                  ))}
                </div>
              </div>
              {pedido.status === 'pendente' && (
                <button className="btn-concluir" onClick={() => concluirPedido(pedido)}>
                  CONCLUIR ENTREGA
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TelaEstoquista = (props) => (
  <NotificacaoCelularProvider>
    <TelaEstoquistaContent {...props} />
  </NotificacaoCelularProvider>
);

export default TelaEstoquista;
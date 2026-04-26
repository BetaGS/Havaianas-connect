import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import socketService from '../../services/socket';
import { NotificacaoCelularProvider } from '../../components/NotificacaoCelular/NotificacaoCelular';
import { checkBackendHealth, testConnection } from '../../services/healthCheck';
import './TelaEstoquista.css';

const TelaEstoquistaContent = ({ onVoltar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { pedidos, atualizarPedido, adicionarPedido, limparPedidosLocal } = usePedidos();
  const [filtro, setFiltro] = useState('todos');
  const [conectado, setConectado] = useState(false);
  const [novaNotificacao, setNovaNotificacao] = useState(null);
  const [servidorStatus, setServidorStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  const pedidosRef = useRef(pedidos);
  useEffect(() => {
    pedidosRef.current = pedidos;
  }, [pedidos]);

  // Sincronização de Visibilidade
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Painel Estoquista em foco: Sincronizando estados...");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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
        // Conecta ao Socket como 'estoquista'
        await socketService.connect('Estoquista', 'estoquista');
        setConectado(true);

        socketService.onPedidoRecebido((novoPedido) => {
          // Validação de duplicidade
          const jaExiste = pedidosRef.current.find(p => String(p.id) === String(novoPedido.id));
          if (jaExiste) return;

          adicionarPedido({
            ...novoPedido,
            status: 'pendente'
          });

          // Feedback Visual e Sonoro
          setNovaNotificacao(novoPedido);
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => console.log("Áudio bloqueado pelo navegador"));
          
          if (window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
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
    };
  }, [adicionarPedido, verificarBackend]);

  const concluirPedido = (pedido) => {
    atualizarPedido(pedido.id, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
    
    // Notifica o servidor e o solicitante original
    socketService.confirmarPedidoConcluido(pedido.id, pedido.solicitante, 'Estoquista');
    
    alert(`✅ Pedido #${pedido.id} entregue com sucesso!`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendentes') return p.status === 'pendente';
    if (filtro === 'concluidos') return p.status === 'concluido';
    return true;
  });

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* Status de Conexão */}
      <div className="status-bar-wrapper">
        <div className={`server-status ${servidorStatus}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {servidorStatus === 'online' ? `🌐 Servidor: ${latency}ms` : `⚠️ Servidor Offline`}
          </span>
        </div>

        <div className={`ws-status ${conectado ? 'conectado' : 'desconectado'}`}>
          <span className="status-indicador"></span>
          {conectado ? '📡 Real-time Ativo' : '⚠️ Reconectando...'}
        </div>
      </div>

      {/* Pop-up de Novo Pedido */}
      {novaNotificacao && (
        <div className={`alerta-novo-pedido ${novaNotificacao.urgencia ? 'urgente' : ''}`}>
          <div className="alerta-conteudo">
            <span className="alerta-icone">📦</span>
            <div>
              <strong>NOVA SOLICITAÇÃO</strong>
              <p>{novaNotificacao.solicitante} precisa de itens</p>
            </div>
          </div>
          <button className="alerta-fechar" onClick={() => setNovaNotificacao(null)}>✕</button>
        </div>
      )}

      <div className="controles-topo">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
        <button className="btn-voltar" onClick={onVoltar}>← Sair do Painel</button>
      </div>

      <div className="estoquista-header">
        <h1>Painel de Estoque</h1>
        <button className="btn-limpar-historico" onClick={limparPedidosLocal}>
          🗑️ Limpar Histórico Local
        </button>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'active' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={filtro === 'pendentes' ? 'active' : ''} onClick={() => setFiltro('pendentes')}>Pendentes</button>
        <button className={filtro === 'concluidos' ? 'active' : ''} onClick={() => setFiltro('concluidos')}>Concluídos</button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">Nenhum pedido encontrado nesta aba.</div>
        ) : (
          pedidosFiltrados
            .sort((a, b) => b.id - a.id) // Mais recentes primeiro
            .map(pedido => (
              <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
                <div className="pedido-header">
                  <span className="pedido-id">ID #{pedido.id}</span>
                  <span className={`status-tag ${pedido.status}`}>
                    {pedido.status === 'pendente' ? 'Aguardando' : 'Finalizado'}
                  </span>
                </div>
                
                <div className="pedido-corpo">
                  <p><strong>De:</strong> {pedido.solicitante}</p>
                  <p><strong>Solicitado em:</strong> {pedido.horarioPedido}</p>
                  {pedido.horarioConclusao && (
                    <p className="hora-conclusao"><strong>Entregue em:</strong> {pedido.horarioConclusao}</p>
                  )}
                  
                  <div className="itens-badge-container">
                    {pedido.itens?.map((item, idx) => (
                      <div key={idx} className="item-badge">
                        {item.nome} • {item.tamanho} • Qtd: {item.quantidade}
                      </div>
                    ))}
                  </div>
                </div>

                {pedido.status === 'pendente' && (
                  <button className="btn-concluir" onClick={() => concluirPedido(pedido)}>
                    MARCAR COMO ENTREGUE
                  </button>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

// Wrapper com Provider de Notificação
const TelaEstoquista = (props) => (
  <NotificacaoCelularProvider>
    <TelaEstoquistaContent {...props} />
  </NotificacaoCelularProvider>
);

export default TelaEstoquista;
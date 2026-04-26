import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socket';
import { NotificacaoCelularProvider } from '../../components/NotificacaoCelular/NotificacaoCelular';
import { checkBackendHealth, testConnection } from '../../services/healthCheck';
import { substituirOuCriarInscricao } from '../../services/pushSubscription'; // Importe o serviço de push
import './TelaEstoquista.css';

const TelaEstoquistaContent = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
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

  // 1. Solicitar Permissão e Inscrever para Web Push (Para tela apagada)
  useEffect(() => {
    if (user && user.username) {
      // Pequeno delay para garantir que o Service Worker esteja pronto
      const timeoutId = setTimeout(() => {
        substituirOuCriarInscricao(user.username);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  const handleSair = () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      logout();
    }
  };

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
        await socketService.connect('Estoquista', 'estoquista');
        setConectado(true);

        socketService.onPedidoRecebido((novoPedido) => {
          const jaExiste = pedidosRef.current.find(p => String(p.id) === String(novoPedido.id));
          if (jaExiste) return;

          adicionarPedido({ ...novoPedido, status: 'pendente' });

          // Notificação Visual Interna (App Aberto)
          setNovaNotificacao(novoPedido);
          
          // Feedback Sonoro e Vibratório
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => console.log("Áudio bloqueado pelo navegador"));
          
          if (window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
          }

          setTimeout(() => setNovaNotificacao(null), 6000);
        });

      } catch (error) {
        setConectado(false);
      }
    };

    iniciarConexao();
    return () => clearInterval(healthInterval);
  }, [adicionarPedido, verificarBackend]);

  const concluirPedido = (pedido) => {
    atualizarPedido(pedido.id, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
    socketService.confirmarPedidoConcluido(pedido.id, pedido.solicitante, 'Estoquista');
    alert(`✅ Pedido #${pedido.id} entregue!`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendentes') return p.status === 'pendente';
    if (filtro === 'concluidos') return p.status === 'concluido';
    return true;
  });

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      <div className="status-bar-wrapper">
        <div className={`server-status ${servidorStatus}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {servidorStatus === 'online' ? `🌐 Servidor: ${latency}ms` : `⚠️ Servidor Offline`}
          </span>
        </div>
        <div className={`ws-status ${conectado ? 'conectado' : 'desconectado'}`}>
          <span className="status-indicador"></span>
          {conectado ? '📡 Tempo Real Ativo' : '⚠️ Tentando Reconectar...'}
        </div>
      </div>

      {novaNotificacao && (
        <div className={`alerta-novo-pedido ${novaNotificacao.urgencia ? 'urgente' : ''}`}>
          <div className="alerta-conteudo">
            <span className="alerta-icone">🔔</span>
            <div>
              <strong>NOVO PEDIDO RECEBIDO</strong>
              <p>{novaNotificacao.solicitante} aguarda separação.</p>
            </div>
          </div>
          <button className="alerta-fechar" onClick={() => setNovaNotificacao(null)}>✕</button>
        </div>
      )}

      <div className="controles-topo">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
        <button className="btn-voltar" onClick={handleSair}>← Sair do Painel</button>
      </div>

      <div className="estoquista-header">
        <h1>Painel de Estoque</h1>
        <button className="btn-limpar-historico" onClick={limparPedidosLocal}>
          🗑️ Limpar Histórico
        </button>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'active' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={filtro === 'pendentes' ? 'active' : ''} onClick={() => setFiltro('pendentes')}>Pendentes</button>
        <button className={filtro === 'concluidos' ? 'active' : ''} onClick={() => setFiltro('concluidos')}>Concluídos</button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">📭 Nenhum pedido pendente.</div>
        ) : (
          pedidosFiltrados
            .sort((a, b) => b.id - a.id)
            .map(pedido => (
              <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
                <div className="pedido-header">
                  <span className="pedido-id">PEDIDO #{pedido.id}</span>
                  <span className={`status-tag ${pedido.status}`}>
                    {pedido.status === 'pendente' ? 'Aguardando' : 'Concluído'}
                  </span>
                </div>
                <div className="pedido-corpo">
                  <p><strong>Solicitante:</strong> {pedido.solicitante}</p>
                  <p><strong>Horário:</strong> {pedido.horarioPedido}</p>
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

const TelaEstoquista = () => (
  <NotificacaoCelularProvider>
    <TelaEstoquistaContent />
  </NotificacaoCelularProvider>
);

export default TelaEstoquista;
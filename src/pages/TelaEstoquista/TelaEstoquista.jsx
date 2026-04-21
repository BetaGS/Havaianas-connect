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

  // Sincronização Extra: Se o usuário clica na notificação e volta para o App,
  // garantimos que a lista reflita o que o Service Worker salvou no LocalStorage
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("App focado: Sincronizando pedidos...");
        // O PedidosContext já lida com o LocalStorage, 
        // mas o foco da janela ajuda o React a re-renderizar se houver mudança externa.
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
        await socketService.connect('Estoquista', 'estoquista');
        setConectado(true);

        socketService.onPedidoRecebido((novoPedido) => {
          // Evita duplicados (checa se o ID já está na lista atual)
          const jaExiste = pedidosRef.current.find(p => String(p.id) === String(novoPedido.id));
          if (jaExiste) return;

          adicionarPedido({
            ...novoPedido,
            status: 'pendente'
          });

          // Alerta Visual e Sonoro (Para quando o app está ABERTO)
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
    socketService.confirmarPedidoConcluido(pedido.id, pedido.solicitante, 'Estoquista');
    // Substituído alert por uma confirmação visual mais suave se desejar, 
    // mas mantido alert conforme solicitado.
    alert(`✅ Pedido #${pedido.id} entregue!`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendentes') return p.status === 'pendente';
    if (filtro === 'concluidos') return p.status === 'concluido';
    return true;
  });

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* Barra de Status do Servidor */}
      <div className={`server-status ${servidorStatus}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {servidorStatus === 'online' ? `🌐 Servidor Online (${latency}ms)` : `⚠️ Servidor Offline`}
        </span>
      </div>

      {/* Barra de Status do Socket */}
      <div className={`ws-status ${conectado ? 'conectado' : 'desconectado'}`}>
        <span className="status-indicador"></span>
        {conectado ? '📡 Tempo Real Ativo' : '⚠️ Tentando reconectar...'}
      </div>

      {/* Notificação Flutuante Interna */}
      {novaNotificacao && (
        <div className={`alerta-novo-pedido ${novaNotificacao.urgencia ? 'urgente' : ''}`}>
          <div className="alerta-conteudo">
            <span className="alerta-icone">🔔</span>
            <div>
              <strong>NOVO PEDIDO!</strong>
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
        <button className="btn-limpar-historico" onClick={limparPedidosLocal}>
          🗑️ Limpar Local
        </button>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'active' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={filtro === 'pendentes' ? 'active' : ''} onClick={() => setFiltro('pendentes')}>Pendentes</button>
        <button className={filtro === 'concluidos' ? 'active' : ''} onClick={() => setFiltro('concluidos')}>Concluídos</button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">📭 Sem pedidos nesta categoria.</div>
        ) : (
          pedidosFiltrados
            .sort((a, b) => b.id - a.id)
            .map(pedido => (
              <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
                <div className="pedido-header">
                  <span className="pedido-id">#{pedido.id}</span>
                  <span className={`status-tag ${pedido.status}`}>
                    {pedido.status === 'pendente' ? '⏳ Pendente' : '✅ Concluído'}
                  </span>
                </div>
                <div className="pedido-corpo">
                  <p><strong>Solicitante:</strong> {pedido.solicitante}</p>
                  <p><strong>Hora:</strong> {pedido.horarioPedido}</p>
                  {pedido.horarioConclusao && (
                    <p className="hora-conclusao"><strong>Entrega:</strong> {pedido.horarioConclusao}</p>
                  )}
                  <div className="itens-badge-container">
                    {pedido.itens?.map((item, idx) => (
                      <div key={idx} className="item-badge">
                        {item.nome} | Tam: {item.tamanho} | Qtd: {item.quantidade}
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
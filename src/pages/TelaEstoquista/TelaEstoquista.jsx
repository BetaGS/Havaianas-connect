// src/components/TelaEstoquista.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  const [usuariosOnline, setUsuariosOnline] = useState(0);

  // Verificar saúde do backend
  const verificarBackend = useCallback(async () => {
    try {
      const health = await checkBackendHealth();
      if (health.online) {
        setServidorStatus('online');
        setUsuariosOnline(health.data?.online || 0);
        
        const test = await testConnection();
        setLatency(test.latency);
      } else {
        setServidorStatus('offline');
      }
    } catch (error) {
      console.error('Erro ao verificar backend:', error);
      setServidorStatus('offline');
    }
  }, []);

  useEffect(() => {
    // 1. Verificar backend periodicamente
    verificarBackend();
    const healthInterval = setInterval(verificarBackend, 30000);

    // 2. Conectar ao servidor como estoquista
    const iniciarConexao = async () => {
      try {
        await socketService.connect('Estoquista', 'estoquista');
        setConectado(true);

        // 3. Ouvir novos pedidos em tempo real
        socketService.onPedidoRecebido((novoPedido) => {
          console.log('📦 Novo pedido recebido via Socket!', novoPedido);

          // Segurança: Verifica se o pedido já não existe na lista para evitar duplicados
          const jaExiste = pedidos.find(p => p.id === novoPedido.id);
          if (jaExiste) return;

          // Mostrar alerta visual na tela
          setNovaNotificacao(novoPedido);
          
          // Adicionar ao estado global do Context (aparece na lista)
          adicionarPedido({
            ...novoPedido,
            status: 'pendente'
          });
          
          // Feedback Sonoro
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Áudio bloqueado pelo navegador'));
          
          // Feedback Hático (Celular)
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
          
          // Auto-fechar a notificação visual após 5s
          setTimeout(() => setNovaNotificacao(null), 5000);
        });

        // Ouvir confirmação de envio
        socketService.onPedidoEnviado((data) => {
          console.log('📨 Status do Servidor:', data.mensagem);
        });

        // Pedir permissão de notificação se for a primeira vez
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }

      } catch (error) {
        console.error('Erro ao iniciar Socket:', error);
        setConectado(false);
      }
    };
    
    iniciarConexao();
    
    return () => {
      socketService.disconnect();
      clearInterval(healthInterval);
    };
    // Dependência de 'pedidos' para garantir que a verificação de duplicados funcione
  }, [pedidos, adicionarPedido, verificarBackend]);

  const concluirPedido = (pedido) => {
    atualizarPedido(pedido.id, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
    
    // Notifica o backend/vendedor que o item saiu do estoque
    socketService.confirmarPedidoConcluido(pedido.id, pedido.solicitante, 'Estoquista');
    
    const audio = new Audio('/complete.mp3');
    audio.play().catch(() => {});
    
    alert(`✅ Pedido #${pedido.id} finalizado!`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendentes') return p.status === 'pendente';
    if (filtro === 'concluidos') return p.status === 'concluido';
    return true;
  });

  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;
  const pedidosUrgentes = pedidos.filter(p => p.urgencia === true && p.status === 'pendente').length;

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* Barra de Status do Backend */}
      <div className={`server-status ${servidorStatus}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {servidorStatus === 'online' ? `🌐 Backend Online (${latency}ms)` : `⚠️ Backend Offline`}
        </span>
        {usuariosOnline > 0 && <span className="status-usuarios">{usuariosOnline} online</span>}
      </div>

      {/* Indicador de Real-Time (Socket) */}
      <div className={`ws-status ${conectado ? 'conectado' : 'desconectado'}`}>
        <span className="status-indicador"></span>
        {conectado ? '📡 Sincronizado em tempo real' : '⚠️ Sem conexão tempo real'}
      </div>

      {/* Alerta de Novo Pedido (Overlay) */}
      {novaNotificacao && (
        <div className={`alerta-novo-pedido ${novaNotificacao.urgencia ? 'urgente' : ''}`}>
          <div className="alerta-conteudo">
            <span className="alerta-icone">🔔</span>
            <div>
              <strong>NOVO PEDIDO RECEBIDO!</strong>
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
        <h1>📦 PAINEL DE ESTOQUE</h1>
        <p>Os pedidos aparecem aqui automaticamente</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div><h3>{pedidos.length}</h3><p>Total</p></div>
        </div>
        <div className="stat-card pendente">
          <span className="stat-icon">⏳</span>
          <div><h3>{pedidosPendentes}</h3><p>Pendentes</p></div>
        </div>
        <div className="stat-card urgente">
          <span className="stat-icon">🚨</span>
          <div><h3>{pedidosUrgentes}</h3><p>Urgentes</p></div>
        </div>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'ativo' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={filtro === 'pendentes' ? 'ativo' : ''} onClick={() => setFiltro('pendentes')}>Pendentes</button>
        <button className={filtro === 'concluidos' ? 'ativo' : ''} onClick={() => setFiltro('concluidos')}>Concluídos</button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">
            <p>📭 Nenhum pedido por aqui...</p>
          </div>
        ) : (
          pedidosFiltrados.sort((a, b) => b.id - a.id).map(pedido => (
            <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
              <div className="pedido-header">
                <span className="pedido-id">#{pedido.id}</span>
                <span className={`pedido-status ${pedido.status}`}>
                  {pedido.status === 'pendente' ? '⏳ Pendente' : '✅ Concluido'}
                </span>
              </div>
              
              <div className="pedido-corpo">
                <p><strong>Solicitante:</strong> {pedido.solicitante} <span className="badge-tipo">{pedido.tipo}</span></p>
                <p><strong>Horário:</strong> {pedido.horarioPedido}</p>
                
                <div className="pedido-itens">
                  {pedido.itens?.map((item, idx) => (
                    <div key={idx} className="item-linha">
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
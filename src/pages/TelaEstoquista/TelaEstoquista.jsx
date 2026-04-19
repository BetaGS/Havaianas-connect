import React, { useState, useEffect } from 'react';
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
  const verificarBackend = async () => {
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
  };

  useEffect(() => {
    // Verificar backend periodicamente
    verificarBackend();
    const healthInterval = setInterval(verificarBackend, 30000); // A cada 30 segundos

    // Conectar ao servidor como estoquista
    const conectar = async () => {
      try {
        await socketService.connect('Estoquista', 'estoquista');
        setConectado(true);
        
        // Ouvir novos pedidos
        socketService.onPedidoRecebido((novoPedido) => {
          console.log('📦 Novo pedido recebido!', novoPedido);
          
          // Mostrar notificação visual
          setNovaNotificacao(novoPedido);
          
          // Adicionar ao estado global
          adicionarPedido({
            ...novoPedido,
            status: 'pendente'
          });
          
          // Tocar som de notificação
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Áudio não suportado'));
          
          // Vibrar (se suportado no celular)
          if (window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
          }
          
          // Notificação do navegador
          if (Notification.permission === 'granted') {
            new Notification('📦 Novo Pedido!', {
              body: `${novoPedido.solicitante} fez um pedido ${novoPedido.urgencia ? 'URGENTE' : ''}`,
              icon: '/havaianas-icon.png',
              vibrate: [200, 100, 200]
            });
          }
          
          // Esconder notificação após 5 segundos
          setTimeout(() => setNovaNotificacao(null), 5000);
        });
        
        // Ouvir confirmação de pedido enviado
        socketService.onPedidoEnviado((data) => {
          console.log('📨', data.mensagem);
        });
        
        // Solicitar permissão para notificações
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        
      } catch (error) {
        console.error('Erro ao conectar:', error);
        setConectado(false);
      }
    };
    
    conectar();
    
    return () => {
      socketService.disconnect();
      clearInterval(healthInterval);
    };
  }, []);

  const concluirPedido = (pedido) => {
    atualizarPedido(pedido.id, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
    
    // Notificar vendedor/solicitante
    socketService.confirmarPedidoConcluido(pedido.id, pedido.solicitante, 'Estoquista');
    
    // Tocar som de conclusão
    const audio = new Audio('/complete.mp3');
    audio.play().catch(e => console.log('Áudio não suportado'));
    
    alert(`✅ Pedido #${pedido.id} concluído com sucesso!`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'pendentes') return p.status === 'pendente';
    if (filtro === 'concluidos') return p.status === 'concluido';
    return true;
  });

  // Calcular estatísticas
  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;
  const pedidosUrgentes = pedidos.filter(p => p.urgencia === true && p.status === 'pendente').length;

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Status do servidor */}
      <div className={`server-status ${servidorStatus}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {servidorStatus === 'online' && `🌐 Servidor Online`}
          {servidorStatus === 'offline' && `⚠️ Servidor Offline`}
          {servidorStatus === 'checking' && `🔄 Verificando...`}
        </span>
        {latency && servidorStatus === 'online' && (
          <span className="status-latency">{latency}ms</span>
        )}
        {usuariosOnline > 0 && servidorStatus === 'online' && (
          <span className="status-usuarios">{usuariosOnline} online</span>
        )}
      </div>

      {/* Status de conexão WebSocket */}
      <div className={`ws-status ${conectado ? 'conectado' : 'desconectado'}`}>
        <span className="status-indicador"></span>
        {conectado ? '📡 Tempo real - Aguardando pedidos' : '⚠️ Desconectado - Tentando reconectar...'}
      </div>

      {/* Notificação emergente de novo pedido */}
      {novaNotificacao && (
        <div className={`alerta-novo-pedido ${novaNotificacao.urgencia ? 'urgente' : ''}`}>
          <div className="alerta-conteudo">
            <span className="alerta-icone">🔔</span>
            <div>
              <strong>NOVO PEDIDO!</strong>
              <p>{novaNotificacao.solicitante} - {novaNotificacao.itens.length} itens</p>
              {novaNotificacao.urgencia && <span className="urgente-tag">🚨 URGENTE</span>}
            </div>
          </div>
          <button className="alerta-fechar" onClick={() => setNovaNotificacao(null)}>✕</button>
        </div>
      )}

      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      <div className="estoquista-header">
        <h1>📦 PEDIDOS EM TEMPO REAL</h1>
        <p>Conectado - Pedidos chegam automaticamente</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div>
            <h3>{pedidos.length}</h3>
            <p>Total de Pedidos</p>
          </div>
        </div>
        <div className="stat-card pendente">
          <span className="stat-icon">⏳</span>
          <div>
            <h3>{pedidosPendentes}</h3>
            <p>Pendentes</p>
          </div>
        </div>
        <div className="stat-card urgente">
          <span className="stat-icon">🚨</span>
          <div>
            <h3>{pedidosUrgentes}</h3>
            <p>Urgentes</p>
          </div>
        </div>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'ativo' : ''} onClick={() => setFiltro('todos')}>
          Todos ({pedidos.length})
        </button>
        <button className={filtro === 'pendentes' ? 'ativo' : ''} onClick={() => setFiltro('pendentes')}>
          Pendentes ({pedidos.filter(p => p.status === 'pendente').length})
        </button>
        <button className={filtro === 'concluidos' ? 'ativo' : ''} onClick={() => setFiltro('concluidos')}>
          Concluídos ({pedidos.filter(p => p.status === 'concluido').length})
        </button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos">
            <p>📭 Nenhum pedido encontrado</p>
            <p className="subtexto">Aguardando novos pedidos...</p>
          </div>
        ) : (
          pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
              <div className="pedido-header">
                <div className="pedido-info">
                  <span className="pedido-id">#{pedido.id}</span>
                  <span className={`pedido-status ${pedido.status}`}>
                    {pedido.status === 'pendente' ? '⏳ Pendente' : '✅ Concluído'}
                  </span>
                  {pedido.urgencia && <span className="urgencia-badge">🚨 URGENTE</span>}
                </div>
                <div className="pedido-tipos">
                  <span className="tipo-pedido">
                    {pedido.tipo === 'vendedor' && '👩‍💼 Vendedor'}
                    {pedido.tipo === 'caixa' && '💰 Caixa'}
                    {pedido.tipo === 'gerente' && '👔 Gerente'}
                  </span>
                </div>
              </div>
              <div className="pedido-detalhes">
                <p><strong>Solicitante:</strong> {pedido.solicitante}</p>
                <p><strong>🕐 Pedido feito:</strong> {pedido.horarioPedido}</p>
                {pedido.horarioConclusao && (
                  <p><strong>✅ Concluído em:</strong> {pedido.horarioConclusao}</p>
                )}
              </div>
              <div className="pedido-itens">
                <strong>Itens solicitados:</strong>
                {pedido.itens.map((item, idx) => (
                  <div key={idx} className="item-pedido">
                    {item.nome} - Tam {item.tamanho} x {item.quantidade}
                  </div>
                ))}
              </div>
              {pedido.status === 'pendente' && (
                <button className="btn-concluir" onClick={() => concluirPedido(pedido)}>
                  ✅ Concluir Pedido
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
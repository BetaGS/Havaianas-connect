// src/components/TelaGerente.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import TelaGerentePedidos from './TelaGerentePedidos';
import socketService from '../../services/socket'; 
import './TelaGerente.css';

const TelaGerente = ({ onVoltar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  // Importando limparPedidosLocal para permitir a limpeza apenas neste aparelho
  const { pedidos, limparPedidosLocal } = usePedidos();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [modoPedido, setModoPedido] = useState(false);
  const [conectado, setConectado] = useState(false);

  // Monitorar conexão para o gerente saber se o sistema está operando em tempo real
  useEffect(() => {
    const statusConexao = async () => {
      try {
        await socketService.connect('Camila', 'gerente');
        setConectado(true);
      } catch (err) {
        setConectado(false);
      }
    };
    statusConexao();
    return () => socketService.disconnect();
  }, []);

  // Métricas para os Cards
  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
  const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido');
  const pedidosUrgentes = pedidos.filter(p => p.urgencia === true && p.status === 'pendente');

  // Lógica de Filtro
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroTipo === 'vendedor') return pedido.tipo === 'vendedor';
    if (filtroTipo === 'caixa') return pedido.tipo === 'caixa';
    if (filtroTipo === 'gerente') return pedido.tipo === 'gerente';
    return true;
  }).sort((a, b) => b.id - a.id); 

  if (modoPedido) {
    return (
      <TelaGerentePedidos
        onVoltar={() => setModoPedido(false)}
      />
    );
  }

  return (
    <div className={`gerente-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      {/* Indicador de Status do Painel */}
      <div className={`status-conexao-gerente ${conectado ? 'online' : 'offline'}`}>
        <span className="dot"></span>
        {conectado ? 'Monitoramento em Tempo Real Ativo' : 'Modo Offline - Visualizando Cache'}
      </div>

      <div className="gerente-header">
        <h1>👔 PAINEL DO GERENTE</h1>
        <p>Visão geral da loja - Camila</p>
      </div>

      <div className="acoes-gerente">
        <button className="btn-fazer-pedido" onClick={() => setModoPedido(true)}>
          🚨 FAZER PEDIDO URGENTE 🚨
        </button>
        {/* Novo botão de limpeza local adicionado aqui */}
        <button className="btn-limpar-historico-gerente" onClick={limparPedidosLocal}>
          🗑️ Limpar Meu Painel
        </button>
      </div>

      <div className="metricas-grid">
        <div className="metrica-card">
          <div className="metrica-icone">📦</div>
          <div className="metrica-info">
            <h3>Total de Pedidos</h3>
            <p className="metrica-valor">{pedidos.length}</p>
          </div>
        </div>
        <div className="metrica-card pendente">
          <div className="metrica-icone">⏳</div>
          <div className="metrica-info">
            <h3>Pendentes</h3>
            <p className="metrica-valor">{pedidosPendentes.length}</p>
          </div>
        </div>
        <div className="metrica-card concluido">
          <div className="metrica-icone">✅</div>
          <div className="metrica-info">
            <h3>Concluídos</h3>
            <p className="metrica-valor">{pedidosConcluidos.length}</p>
          </div>
        </div>
        <div className="metrica-card urgente">
          <div className="metrica-icone">🚨</div>
          <div className="metrica-info">
            <h3>Urgentes</h3>
            <p className="metrica-valor">{pedidosUrgentes.length}</p>
          </div>
        </div>
      </div>

      <div className="filtros-gerente">
        <button className={filtroTipo === 'todos' ? 'ativo' : ''} onClick={() => setFiltroTipo('todos')}>
          Todos ({pedidos.length})
        </button>
        <button className={filtroTipo === 'vendedor' ? 'ativo' : ''} onClick={() => setFiltroTipo('vendedor')}>
          Vendedores ({pedidos.filter(p => p.tipo === 'vendedor').length})
        </button>
        <button className={filtroTipo === 'caixa' ? 'ativo' : ''} onClick={() => setFiltroTipo('caixa')}>
          Caixas ({pedidos.filter(p => p.tipo === 'caixa').length})
        </button>
        <button className={filtroTipo === 'gerente' ? 'ativo' : ''} onClick={() => setFiltroTipo('gerente')}>
          👔 Gerente ({pedidos.filter(p => p.tipo === 'gerente').length})
        </button>
      </div>

      <div className="pedidos-gerente">
        <h2>📋 Histórico de Atividade</h2>
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos-box">
            <p>Nenhum pedido registrado nesta categoria.</p>
          </div>
        ) : (
          pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className={`pedido-gerente-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
              <div className="pedido-gerente-header">
                <div className="id-status-group">
                  <span className="pedido-id">#{pedido.id}</span>
                  <span className={`status-badge ${pedido.status}`}>
                    {pedido.status === 'pendente' ? '⏳ Pendente' : '✅ Concluído'}
                  </span>
                  {pedido.urgencia && <span className="urgente-badge">🚨 URGENTE</span>}
                </div>
                <span className="tipo-badge">
                  {pedido.tipo === 'vendedor' && '👩‍💼 Vendedor'}
                  {pedido.tipo === 'caixa' && '💰 Caixa'}
                  {pedido.tipo === 'gerente' && '👔 Gerente'}
                </span>
              </div>
              
              <div className="pedido-gerente-detalhes">
                <p><strong>Solicitante:</strong> {pedido.solicitante || pedido.vendedor || pedido.caixa || pedido.gerente || 'Não Identificado'}</p>
                <p><strong>🕐 Abertura:</strong> {pedido.horarioPedido}</p>
                {pedido.horarioConclusao ? (
                  <p className="conclusao-texto"><strong>✅ Finalizado:</strong> {pedido.horarioConclusao}</p>
                ) : (
                  <p className="tempo-pendente">⏰ Aguardando Estoque...</p>
                )}
              </div>

              <div className="pedido-gerente-itens">
                <strong>Itens do Pedido:</strong>
                <div className="itens-badge-container">
                  {pedido.itens.map((item, idx) => (
                    <span key={idx} className="item-mini-badge">
                      {item.nome} (T:{item.tamanho} x{item.quantidade})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TelaGerente;
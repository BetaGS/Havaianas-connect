// src/components/TelaGerente.jsx
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import TelaGerentePedidos from './TelaGerentePedidos';
import './TelaGerente.css';

const TelaGerente = ({ onVoltar, pedidos, onFazerPedido }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [modoPedido, setModoPedido] = useState(false);

  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
  const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido');
  const pedidosUrgentes = pedidos.filter(p => p.urgencia === true);

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroTipo === 'vendedor') return pedido.tipo === 'vendedor';
    if (filtroTipo === 'caixa') return pedido.tipo === 'caixa';
    if (filtroTipo === 'gerente') return pedido.tipo === 'gerente';
    return true;
  });

  // Se estiver no modo de pedidos, mostrar a tela de pedidos da gerente
  if (modoPedido) {
    return (
      <TelaGerentePedidos
        onVoltar={() => setModoPedido(false)}
        onFazerPedido={onFazerPedido}
      />
    );
  }

  return (
    <div className={`gerente-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      <div className="gerente-header">
        <h1>👔 PAINEL DO GERENTE</h1>
        <p>Visão geral da loja - Camila</p>
      </div>

      {/* Botão para fazer pedidos */}
      <div className="acoes-gerente">
        <button className="btn-fazer-pedido" onClick={() => setModoPedido(true)}>
          🚨 FAZER PEDIDO URGENTE 🚨
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
          Todos
        </button>
        <button className={filtroTipo === 'vendedor' ? 'ativo' : ''} onClick={() => setFiltroTipo('vendedor')}>
          Vendedores
        </button>
        <button className={filtroTipo === 'caixa' ? 'ativo' : ''} onClick={() => setFiltroTipo('caixa')}>
          Caixas (Urgentes)
        </button>
        <button className={filtroTipo === 'gerente' ? 'ativo' : ''} onClick={() => setFiltroTipo('gerente')}>
          👔 Gerente
        </button>
      </div>

      <div className="pedidos-gerente">
        <h2>📋 Histórico de Pedidos</h2>
        {pedidosFiltrados.length === 0 ? (
          <p className="sem-pedidos">Nenhum pedido encontrado</p>
        ) : (
          pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className={`pedido-gerente-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
              <div className="pedido-gerente-header">
                <div>
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
                <p><strong>Solicitante:</strong> {pedido.vendedor || pedido.caixa || pedido.gerente}</p>
                <p><strong>🕐 Pedido:</strong> {pedido.horarioPedido}</p>
                {pedido.horarioConclusao && (
                  <p><strong>✅ Conclusão:</strong> {pedido.horarioConclusao}</p>
                )}
                {!pedido.horarioConclusao && pedido.status === 'pendente' && (
                  <p className="tempo-pendente">⏰ Aguardando conclusão...</p>
                )}
              </div>
              <div className="pedido-gerente-itens">
                <strong>Itens:</strong>
                <ul>
                  {pedido.itens.map((item, idx) => (
                    <li key={idx}>{item.nome} - {item.modelo || `Tam ${item.tamanho}`} x{item.quantidade}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TelaGerente;
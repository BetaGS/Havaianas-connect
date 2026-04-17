// src/components/TelaEstoquista.jsx
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './TelaEstoquista.css';

const TelaEstoquista = ({ onVoltar, pedidos, onAtualizarPedido }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [filtro, setFiltro] = useState('todos');

  const concluirPedido = (pedidoId) => {
    onAtualizarPedido(pedidoId, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'pendentes') return pedido.status === 'pendente';
    if (filtro === 'concluidos') return pedido.status === 'concluido';
    return true;
  });

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      <div className="estoquista-header">
        <h1>📦 PEDIDOS RECEBIDOS</h1>
        <p>Estoque - Gerencie os pedidos</p>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'ativo' : ''} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={filtro === 'pendentes' ? 'ativo' : ''} onClick={() => setFiltro('pendentes')}>Pendentes</button>
        <button className={filtro === 'concluidos' ? 'ativo' : ''} onClick={() => setFiltro('concluidos')}>Concluídos</button>
      </div>

      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <div className="sem-pedidos"><p>📭 Nenhum pedido encontrado</p></div>
        ) : (
          pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className={`pedido-card ${pedido.status} ${pedido.urgencia ? 'urgente' : ''}`}>
              <div className="pedido-header">
                <div className="pedido-info">
                  <span className="pedido-id">Pedido #{pedido.id}</span>
                  <span className={`pedido-status ${pedido.status}`}>{pedido.status === 'pendente' ? '⏳ Pendente' : '✅ Concluído'}</span>
                  {pedido.urgencia && <span className="urgencia-badge">🚨 URGENTE</span>}
                </div>
                <div className="pedido-tipos">
                  <span className="tipo-pedido">{pedido.tipo === 'vendedor' ? '👩‍💼 Vendedor' : '💰 Caixa'}</span>
                  {pedido.tipo === 'caixa' && <span className="urgente-icon">⚡ Urgente</span>}
                </div>
              </div>
              <div className="pedido-detalhes">
                <p><strong>Solicitante:</strong> {pedido.vendedor || pedido.caixa}</p>
                <p><strong>🕐 Pedido feito:</strong> {pedido.horarioPedido}</p>
                {pedido.horarioConclusao && (<p><strong>✅ Concluído em:</strong> {pedido.horarioConclusao}</p>)}
              </div>
              <div className="pedido-itens">
                <strong>Itens solicitados:</strong>
                {pedido.itens.map((item, idx) => (<div key={idx} className="item-pedido">{item.nome} - {item.modelo || `Tam ${item.tamanho}`} x {item.quantidade}</div>))}
              </div>
              {pedido.status === 'pendente' && (<button className="btn-concluir" onClick={() => concluirPedido(pedido.id)}>✅ Concluir Pedido</button>)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TelaEstoquista;
// src/components/TelaEstoquista.jsx
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import './TelaEstoquista.css';

const TelaEstoquista = ({ onVoltar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { pedidos, atualizarPedido } = usePedidos();
  const [filtro, setFiltro] = useState('todos');

  const concluirPedido = (pedidoId) => {
    atualizarPedido(pedidoId, {
      status: 'concluido',
      horarioConclusao: new Date().toLocaleString()
    });
    alert(`Pedido #${pedidoId} concluído com sucesso!`);
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'pendentes') return pedido.status === 'pendente';
    if (filtro === 'concluidos') return pedido.status === 'concluido';
    return true;
  });

  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;

  return (
    <div className={`estoquista-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      <div className="estoquista-header">
        <h1>📦 PEDIDOS RECEBIDOS</h1>
        <p>Estoque - Gerencie os pedidos {pedidosPendentes > 0 && `(${pedidosPendentes} pendentes)`}</p>
      </div>

      <div className="filtros">
        <button className={filtro === 'todos' ? 'ativo' : ''} onClick={() => setFiltro('todos')}>Todos ({pedidos.length})</button>
        <button className={filtro === 'pendentes' ? 'ativo' : ''} onClick={() => setFiltro('pendentes')}>Pendentes ({pedidos.filter(p => p.status === 'pendente').length})</button>
        <button className={filtro === 'concluidos' ? 'ativo' : ''} onClick={() => setFiltro('concluidos')}>Concluídos ({pedidos.filter(p => p.status === 'concluido').length})</button>
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
                  {pedido.urgencia && <span className="urgente-icon">⚡ Prioridade</span>}
                </div>
              </div>
              <div className="pedido-detalhes">
                <p><strong>Solicitante:</strong> {pedido.vendedor || pedido.caixa || pedido.gerente}</p>
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
                <button className="btn-concluir" onClick={() => concluirPedido(pedido.id)}>
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

export default TelaEstoquista;
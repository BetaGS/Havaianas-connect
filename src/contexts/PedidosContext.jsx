// src/contexts/PedidosContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const PedidosContext = createContext();

export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos must be used within a PedidosProvider');
  }
  return context;
};

export const PedidosProvider = ({ children }) => {
  // Carregar pedidos do localStorage ao iniciar
  const [pedidos, setPedidos] = useState(() => {
    const savedPedidos = localStorage.getItem('havaianas_pedidos');
    return savedPedidos ? JSON.parse(savedPedidos) : [];
  });

  // Salvar pedidos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('havaianas_pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  // Função para adicionar novo pedido
  const adicionarPedido = (novoPedido) => {
    const pedidoCompleto = {
      ...novoPedido,
      id: Date.now(),
      horarioPedido: new Date().toLocaleString(),
      status: 'pendente',
      horarioConclusao: null
    };
    setPedidos(prev => [pedidoCompleto, ...prev]);
    return pedidoCompleto;
  };

  // Função para atualizar pedido (concluir)
  const atualizarPedido = (pedidoId, atualizacao) => {
    setPedidos(prev => prev.map(pedido =>
      pedido.id === pedidoId ? { ...pedido, ...atualizacao } : pedido
    ));
  };

  // Função para deletar pedido
  const deletarPedido = (pedidoId) => {
    setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));
  };

  // Função para limpar todos os pedidos
  const limparPedidos = () => {
    setPedidos([]);
    localStorage.removeItem('havaianas_pedidos');
  };

  return (
    <PedidosContext.Provider value={{
      pedidos,
      adicionarPedido,
      atualizarPedido,
      deletarPedido,
      limparPedidos
    }}>
      {children}
    </PedidosContext.Provider>
  );
};
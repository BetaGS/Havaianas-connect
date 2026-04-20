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
    try {
      const savedPedidos = localStorage.getItem('havaianas_pedidos');
      return savedPedidos ? JSON.parse(savedPedidos) : [];
    } catch (error) {
      console.error("Erro ao carregar localStorage:", error);
      return [];
    }
  });

  // Salvar pedidos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('havaianas_pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  // Função para adicionar novo pedido
  const adicionarPedido = (dadosPedido) => {
    // Se o pedido já tiver um ID (veio via Socket), usamos ele.
    // Se não tiver (criado localmente), geramos um novo.
    const pedidoCompleto = {
      id: dadosPedido.id || Date.now(),
      horarioPedido: dadosPedido.horarioPedido || new Date().toLocaleString(),
      status: dadosPedido.status || 'pendente',
      horarioConclusao: dadosPedido.horarioConclusao || null,
      ...dadosPedido, // Espalha o restante dos dados (itens, solicitante, urgencia)
    };

    setPedidos(prev => {
      // Evita duplicados (importante para o Socket não inserir o mesmo pedido duas vezes)
      const jaExiste = prev.find(p => p.id === pedidoCompleto.id);
      if (jaExiste) return prev;
      
      return [pedidoCompleto, ...prev];
    });

    return pedidoCompleto;
  };

  // Função para atualizar pedido (concluir)
  const atualizarPedido = (pedidoId, atualizacao) => {
    setPedidos(prev => prev.map(pedido =>
      pedido.id === pedidoId ? { ...pedido, ...atualizacao } : pedido
    ));
  };

  // Função para deletar um pedido específico
  const deletarPedido = (pedidoId) => {
    setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));
  };

  // Função para limpar APENAS neste aparelho (o que você pediu)
  const limparPedidosLocal = () => {
    if (window.confirm("Isso apagará o histórico apenas deste aparelho. Continuar?")) {
      setPedidos([]);
      localStorage.removeItem('havaianas_pedidos');
    }
  };

  return (
    <PedidosContext.Provider value={{
      pedidos,
      adicionarPedido,
      atualizarPedido,
      deletarPedido,
      limparPedidosLocal // Nome alterado para ficar claro que é local
    }}>
      {children}
    </PedidosContext.Provider>
  );
};
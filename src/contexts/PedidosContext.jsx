import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  // Função para adicionar novo pedido (envolta em useCallback para ser usada no listener)
  const adicionarPedido = useCallback((dadosPedido) => {
    const pedidoCompleto = {
      id: dadosPedido.id || Date.now(),
      horarioPedido: dadosPedido.horarioPedido || new Date().toLocaleString(),
      status: dadosPedido.status || 'pendente',
      horarioConclusao: dadosPedido.horarioConclusao || null,
      ...dadosPedido,
    };

    setPedidos(prev => {
      // Evita duplicados (essencial para não repetir pedidos vindos de Socket + Push)
      const jaExiste = prev.find(p => p.id === pedidoCompleto.id);
      if (jaExiste) return prev;
      
      return [pedidoCompleto, ...prev];
    });

    return pedidoCompleto;
  }, []);

  // --- LÓGICA PARA RECEBER PEDIDOS DO SERVICE WORKER (PUSH) ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event) => {
        // Verifica se a mensagem é do tipo que definimos no sw.js
        if (event.data && event.data.type === 'NOVO_PEDIDO_PUSH') {
          console.log("Contexto recebeu pedido via Push:", event.data.pedido);
          adicionarPedido(event.data.pedido);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, [adicionarPedido]);

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

  // Função para limpar APENAS neste aparelho
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
      limparPedidosLocal
    }}>
      {children}
    </PedidosContext.Provider>
  );
};
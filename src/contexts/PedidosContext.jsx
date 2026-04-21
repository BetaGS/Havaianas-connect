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
  // 1. Estado inicial carregado do LocalStorage
  const [pedidos, setPedidos] = useState(() => {
    try {
      const savedPedidos = localStorage.getItem('havaianas_pedidos');
      return savedPedidos ? JSON.parse(savedPedidos) : [];
    } catch (error) {
      console.error("Erro ao carregar localStorage:", error);
      return [];
    }
  });

  // 2. Persistência automática
  useEffect(() => {
    localStorage.setItem('havaianas_pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  // 3. Função de Adição com Proteção contra Duplicados
  const adicionarPedido = useCallback((dadosPedido) => {
    if (!dadosPedido) return;

    setPedidos(prev => {
      // Verificação rigorosa de ID para não duplicar Push com Socket
      const idNovo = dadosPedido.id || Date.now();
      const jaExiste = prev.some(p => String(p.id) === String(idNovo));
      
      if (jaExiste) return prev;

      const pedidoCompleto = {
        id: idNovo,
        horarioPedido: dadosPedido.horarioPedido || new Date().toLocaleString(),
        status: dadosPedido.status || 'pendente',
        horarioConclusao: dadosPedido.horarioConclusao || null,
        ...dadosPedido,
      };

      return [pedidoCompleto, ...prev];
    });
  }, []);

  // 4. Ouvinte do Service Worker (Sincronização Push -> UI)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event) => {
        // Log para debug no console do celular (inspecione via Chrome DevTools se possível)
        console.log("Mensagem recebida do SW:", event.data);

        if (event.data && event.data.type === 'NOVO_PEDIDO_PUSH' && event.data.pedido) {
          adicionarPedido(event.data.pedido);
        }
      };

      // Escuta mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      // Solicita que o SW mande mensagens pendentes caso o App tenha acabado de abrir
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({ type: 'GET_PENDING_PEDIDOS' });
        }
      });

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, [adicionarPedido]);

  // 5. Funções de Gerenciamento
  const atualizarPedido = (pedidoId, atualizacao) => {
    setPedidos(prev => prev.map(pedido =>
      pedido.id === pedidoId ? { ...pedido, ...atualizacao } : pedido
    ));
  };

  const deletarPedido = (pedidoId) => {
    setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));
  };

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
import React, { useState } from 'react';
import socketService from '../../services/socket'; 
import { usePedidos } from '../../contexts/PedidosContext';
import './TelaVendedor.css';

const TelaVendedor = ({ onVoltar, vendedorNome }) => {
  const [carrinho, setCarrinho] = useState([]);
  const { adicionarPedido } = usePedidos();

  const enviarPedido = () => {
    if (carrinho.length === 0) {
      alert('Adicione produtos ao carrinho!');
      return;
    }

    const novoPedido = {
      id: Date.now(),
      solicitante: vendedorNome,
      tipo: 'vendedor',
      itens: [...carrinho],
      urgencia: false,
      horarioPedido: new Date().toLocaleString(),
      status: 'pendente'
    };

    // 1. Salva no Contexto Global
    adicionarPedido(novoPedido);
    
    // 2. Envia via WebSocket
    const enviado = socketService.enviarPedido(novoPedido);
    
    if (enviado) {
      alert(`✅ Pedido enviado para o estoque!\n📱 O estoquista foi notificado em tempo real.`);
    } else {
      alert(`⚠️ Pedido salvo localmente, mas o servidor de notificações está offline.`);
    }
    
    setCarrinho([]);
  };

  return (
    <div className="tela-vendedor-container">
      <div className="header-vendedor">
        <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>
        <h2>Vendedor: {vendedorNome}</h2>
      </div>

      <div className="conteudo-venda">
        <div className="secao-carrinho">
          <h3>🛒 Seu Carrinho ({carrinho.length} itens)</h3>
          
          {carrinho.length > 0 ? (
            <ul>
              {carrinho.map((item, index) => (
                <li key={index}>{item.nome} - {item.tamanho}</li>
              ))}
            </ul>
          ) : (
            <p>Carrinho vazio</p>
          )}

          <button 
            className="btn-finalizar" 
            onClick={enviarPedido}
            disabled={carrinho.length === 0}
          >
            CONFIRMAR E ENVIAR AO ESTOQUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelaVendedor;
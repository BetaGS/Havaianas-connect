// src/components/TelaGerentePedidos.jsx
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import './TelaGerentePedidos.css';

const TelaGerentePedidos = ({ onVoltar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { adicionarPedido, pedidos } = usePedidos();
  const [abaAtiva, setAbaAtiva] = useState('catalogo');
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);

  const meusPedidos = pedidos.filter(p => p.tipo === 'gerente');

  const produtos = [
    { id: 1, nome: 'BRASIL LOGO BEGE', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 2, nome: 'BRASIL LOGO BRANCA', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 3, nome: 'BRASIL LOGO PRETA', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 4, nome: 'BRASIL LOGO AZUL ROYAL', preco: 59.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] }
  ];

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const adicionarAoCarrinho = (produto, tamanhoSelecionado) => {
    if (!tamanhoSelecionado) {
      alert('Selecione um tamanho!');
      return;
    }

    const itemExistente = carrinho.find(
      item => item.id === produto.id && item.tamanho === tamanhoSelecionado
    );

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.id === produto.id && item.tamanho === tamanhoSelecionado
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, tamanho: tamanhoSelecionado, quantidade: 1 }]);
    }
  };

  const removerDoCarrinho = (id, tamanho) => {
    setCarrinho(carrinho.filter(item => !(item.id === id && item.tamanho === tamanho)));
  };

  const atualizarQuantidade = (id, tamanho, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(id, tamanho);
    } else {
      setCarrinho(carrinho.map(item =>
        item.id === id && item.tamanho === tamanho
          ? { ...item, quantidade: novaQuantidade }
          : item
      ));
    }
  };

  const enviarPedido = () => {
    if (carrinho.length === 0) {
      alert('Adicione produtos ao carrinho!');
      return;
    }

    const novoPedido = {
      gerente: 'Camila',
      tipo: 'gerente',
      itens: [...carrinho],
      urgencia: true
    };

    adicionarPedido(novoPedido);
    setCarrinho([]);
    alert(`🚨 PEDIDO URGENTE DA GERENTE enviado para o estoque!`);
  };

  return (
    <div className={`gerente-pedidos-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar ao Dashboard</button>

      <div className="urgente-banner gerente-banner">
        <span className="urgente-icon">👔</span>
        <span>PEDIDO DA GERENTE - PRIORIDADE MÁXIMA</span>
        <span className="urgente-icon">🚨</span>
      </div>

      <div className="gerente-pedidos-header">
        <h1>👔 PEDIDOS DA GERENTE</h1>
        <p>Camila - Pedidos com prioridade máxima!</p>
      </div>

      <div className="abas">
        <button className={`aba ${abaAtiva === 'catalogo' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('catalogo')}>
          📦 CATÁLOGO
        </button>
        <button className={`aba ${abaAtiva === 'envios' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('envios')}>
          📤 MEUS PEDIDOS ({meusPedidos.length})
        </button>
      </div>

      {abaAtiva === 'catalogo' && (
        <div className="buscador">
          <input type="text" placeholder="BUSCAR PRODUTOS..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <span className="lupa">🔍</span>
        </div>
      )}

      {abaAtiva === 'catalogo' ? (
        <div className="catalogo">
          <div className="produtos-grid">
            {produtosFiltrados.map(produto => (
              <div key={produto.id} className="produto-card gerente-produto">
                <div className="produto-imagem">{produto.imagem}</div>
                <h3 className="produto-nome">{produto.nome}</h3>
                <p className="produto-preco">R$ {produto.preco.toFixed(2)}</p>
                <div className="tamanhos">
                  <p className="tamanhos-label">Tamanhos disponíveis:</p>
                  <div className="tamanhos-grid">
                    {produto.tamanhos.map(tamanho => (
                      <button key={tamanho} className="tamanho-btn" onClick={() => adicionarAoCarrinho(produto, tamanho)}>
                        {tamanho}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {carrinho.length > 0 && (
            <div className="carrinho-flutuante gerente-carrinho">
              <div className="carrinho-header">
                <h3>👔 PEDIDO GERENTE ({carrinho.reduce((total, item) => total + item.quantidade, 0)} itens)</h3>
                <button className="fechar-carrinho" onClick={() => setCarrinho([])}>✕</button>
              </div>
              <div className="carrinho-itens">
                {carrinho.map((item, idx) => (
                  <div key={idx} className="carrinho-item">
                    <div className="item-info">
                      <span className="item-nome">{item.nome}</span>
                      <span className="item-tamanho">Tam: {item.tamanho}</span>
                      <span className="item-preco">R$ {item.preco.toFixed(2)}</span>
                    </div>
                    <div className="item-controles">
                      <button onClick={() => atualizarQuantidade(item.id, item.tamanho, item.quantidade - 1)}>-</button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, item.tamanho, item.quantidade + 1)}>+</button>
                      <button className="remover" onClick={() => removerDoCarrinho(item.id, item.tamanho)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="carrinho-total">
                <strong>Total:</strong> R$ {carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2)}
              </div>
              <button className="btn-enviar gerente-enviar-btn" onClick={enviarPedido}>
                👔 ENVIAR PEDIDO DA GERENTE 🚨
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="meus-envios">
          <h2 className="envios-titulo">📋 MEUS PEDIDOS</h2>
          {meusPedidos.length === 0 ? (
            <div className="sem-pedidos"><p>📭 Você ainda não fez nenhum pedido</p></div>
          ) : (
            meusPedidos.map(pedido => (
              <div key={pedido.id} className={`pedido-envio gerente-pedido-envio ${pedido.status}`}>
                <div className="urgente-ribbon gerente-ribbon">👔 GERENTE 🚨</div>
                <div className="pedido-header">
                  <span className="pedido-id">Pedido #{pedido.id}</span>
                  <span className={`status ${pedido.status}`}>
                    {pedido.status === 'pendente' ? '⏳ Pendente - Prioridade' : '✅ Concluído'}
                  </span>
                </div>
                <div className="pedido-data"><span>📅 {pedido.horarioPedido}</span></div>
                <div className="pedido-itens">
                  {pedido.itens.map((item, idx) => (
                    <div key={idx} className="envio-item">{item.nome} - Tam {item.tamanho} x{item.quantidade}</div>
                  ))}
                </div>
                {pedido.horarioConclusao && (
                  <div className="pedido-conclusao">✅ Concluído em: {pedido.horarioConclusao}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TelaGerentePedidos;
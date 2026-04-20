// src/components/TelaCaixa.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import socketService from '../../services/socket';
import './TelaCaixa.css';

const TelaCaixa = ({ onVoltar, caixaNome }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  // Importando limparPedidosLocal do PedidosContext
  const { adicionarPedido, pedidos, limparPedidosLocal } = usePedidos();
  const [abaAtiva, setAbaAtiva] = useState('catalogo');
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [conectado, setConectado] = useState(false);

  // --- CONFIGURAÇÃO DO TEMPO REAL ---
  useEffect(() => {
    const conectarSocket = async () => {
      try {
        await socketService.connect(caixaNome, 'caixa');
        setConectado(true);
      } catch (error) {
        console.error('Erro ao conectar socket no Caixa:', error);
        setConectado(false);
      }
    };

    conectarSocket();

    return () => socketService.disconnect();
  }, [caixaNome]);

  const meusPedidos = pedidos.filter(p => p.solicitante === caixaNome && p.tipo === 'caixa');

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
      id: Date.now(),
      solicitante: caixaNome,
      tipo: 'caixa',
      itens: [...carrinho],
      urgencia: true,
      horarioPedido: new Date().toLocaleString(),
      status: 'pendente'
    };

    adicionarPedido(novoPedido);
    const enviadoComSucesso = socketService.enviarPedido(novoPedido);

    if (enviadoComSucesso) {
      alert(`🚨 PEDIDO URGENTE enviado em tempo real!`);
    } else {
      alert(`⚠️ Pedido salvo localmente, mas o servidor está offline.`);
    }

    setCarrinho([]);
  };

  return (
    <div className={`caixa-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      <div className={`status-conexao ${conectado ? 'conectado' : 'desconectado'}`}>
        <span className="status-dot"></span>
        {conectado ? '📡 Conectado ao Estoque' : '⚠️ Offline - Tentando reconectar...'}
      </div>

      <div className="urgente-banner">
        <span className="urgente-icon">🚨</span>
        <span>PEDIDOS URGENTES - ATENDIMENTO PRIORITÁRIO</span>
        <span className="urgente-icon">⚡</span>
      </div>

      <div className="caixa-header">
        <h1>💰 CAIXA HAVAIANAS</h1>
        <p>Atendente: {caixaNome} - Pedidos com prioridade máxima!</p>
      </div>

      <div className="abas">
        <button className={`aba ${abaAtiva === 'catalogo' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('catalogo')}>
          📦 CATÁLOGO
        </button>
        <button className={`aba ${abaAtiva === 'envios' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('envios')}>
          📤 MEUS ENVIOS URGENTES ({meusPedidos.length})
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
              <div key={produto.id} className="produto-card">
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
            <div className="carrinho-flutuante urgente-carrinho">
              <div className="carrinho-header">
                <h3>🚨 CARRINHO URGENTE ({carrinho.reduce((total, item) => total + item.quantidade, 0)} itens)</h3>
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
              <button className="btn-enviar urgente-btn" onClick={enviarPedido}>
                🚨 ENVIAR PEDIDO URGENTE 🚨
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="meus-envios">
          <div className="envios-header-acoes">
            <h2 className="envios-titulo">📋 MEUS PEDIDOS URGENTES</h2>
            {meusPedidos.length > 0 && (
              <button className="btn-limpar-historico" onClick={limparPedidosLocal}>
                🗑️ Limpar Histórico
              </button>
            )}
          </div>

          {meusPedidos.length === 0 ? (
            <div className="sem-pedidos"><p>📭 Você ainda não fez nenhum pedido urgente</p></div>
          ) : (
            meusPedidos.map(pedido => (
              <div key={pedido.id} className={`pedido-envio urgente-envio ${pedido.status}`}>
                <div className="urgente-ribbon">🚨 URGENTE 🚨</div>
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

export default TelaCaixa;
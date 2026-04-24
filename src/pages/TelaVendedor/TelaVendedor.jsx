import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePedidos } from '../../contexts/PedidosContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import './TelaVendedor.css';

const TelaVendedor = ({ vendedorNome }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth(); // Importando logout do AuthContext
  const navigate = useNavigate(); // Para navegação
  const { adicionarPedido, pedidos, limparPedidosLocal } = usePedidos();
  const [abaAtiva, setAbaAtiva] = useState('catalogo');
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [conectado, setConectado] = useState(false);

  // Produtos disponíveis
  const produtos = [
    { id: 1, nome: 'BRASIL LOGO BEGE', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 2, nome: 'BRASIL LOGO BRANCA', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 3, nome: 'BRASIL LOGO PRETA', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 4, nome: 'BRASIL LOGO AZUL ROYAL', preco: 59.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] },
    { id: 5, nome: 'HAVAIANAS SLIM ROSA', preco: 54.99, imagem: '👡', tamanhos: [35, 36, 37, 38, 39, 40] },
    { id: 6, nome: 'TRADICIONAL AZUL MARINHO', preco: 49.99, imagem: '👡', tamanhos: [37, 38, 39, 40, 41, 42, 43, 44] },
    { id: 7, nome: 'FLASH PRETO', preco: 79.99, imagem: '👟', tamanhos: [37, 38, 39, 40, 41, 42] },
    { id: 8, nome: 'KIDS VERMELHO', preco: 44.99, imagem: '👶', tamanhos: [27, 28, 29, 30, 31, 32, 33, 34] },
    { id: 9, nome: 'HAVAIANAS LOGO GOLD', preco: 89.99, imagem: '👡', tamanhos: [35, 36, 37, 38, 39, 40] },
    { id: 10, nome: 'BRASIL LOGO VERDE', preco: 64.99, imagem: '👡', tamanhos: [33, 35, 37, 39, 41, 43, 45, 47] }
  ];

  // Função para fazer logout
  const handleLogout = () => {
    logout(); // Limpa o contexto de autenticação
    navigate('/login', { replace: true }); // Redireciona para tela de login
  };

  // Conectar ao WebSocket
  useEffect(() => {
    const conectar = async () => {
      try {
        await socketService.connect(vendedorNome, 'vendedor');
        setConectado(true);
      } catch (error) {
        console.error('❌ Erro ao conectar:', error);
        setConectado(false);
      }
    };
    
    conectar();
    
    return () => {
      socketService.disconnect();
    };
  }, [vendedorNome]);

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const meusPedidos = pedidos.filter(p => p.solicitante === vendedorNome && p.tipo === 'vendedor');

  const adicionarAoCarrinho = (produto, tamanhoSelecionado) => {
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

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2);
  };

  const enviarPedido = () => {
    if (carrinho.length === 0) {
      alert('🛒 Adicione produtos ao carrinho antes de enviar!');
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

    adicionarPedido(novoPedido);
    const enviado = socketService.enviarPedido(novoPedido);
    
    if (enviado && conectado) {
      alert(`✅ Pedido #${novoPedido.id} enviado para o estoque!`);
    } else {
      alert(`⚠️ Pedido #${novoPedido.id} salvo localmente. Servidor offline.`);
    }
    
    setCarrinho([]);
  };

  return (
    <div className={`vendedor-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="controles-topo">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className="btn-sair" onClick={handleLogout}>
          🚪 Sair
        </button>
      </div>

      <div className={`status-conexao ${conectado ? 'conectado' : 'desconectado'}`}>
        <span className="status-dot"></span>
        {conectado ? '📡 Conectado ao estoque' : '⚠️ Offline - Pedidos salvos localmente'}
      </div>

      <div className="vendedor-header">
        <h1>👡 HAVAIANAS CONNECT</h1>
        <p>Vendedor: {vendedorNome}</p>
      </div>

      <div className="abas">
        <button className={`aba ${abaAtiva === 'catalogo' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('catalogo')}>📦 CATÁLOGO</button>
        <button className={`aba ${abaAtiva === 'envios' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('envios')}>📤 MEUS PEDIDOS ({meusPedidos.length})</button>
      </div>

      {abaAtiva === 'catalogo' ? (
        <div className="catalogo">
          <div className="buscador">
            <input type="text" placeholder="🔍 BUSCAR PRODUTOS..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>

          <div className="produtos-grid">
            {produtosFiltrados.map(produto => (
              <div key={produto.id} className="produto-card">
                <div className="produto-imagem">{produto.imagem}</div>
                <h3 className="produto-nome">{produto.nome}</h3>
                <p className="produto-preco">R$ {produto.preco.toFixed(2)}</p>
                <div className="tamanhos">
                  <div className="tamanhos-grid">
                    {produto.tamanhos.map(tamanho => (
                      <button
                        key={tamanho}
                        className="tamanho-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          adicionarAoCarrinho(produto, tamanho);
                          const btn = e.target;
                          btn.style.background = "#4ecdc4";
                          setTimeout(() => btn.style.background = "", 200);
                        }}
                      >
                        {tamanho}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {carrinho.length > 0 && (
            <div className="carrinho-flutuante">
              <div className="carrinho-header">
                <h3>🛒 CARRINHO ({carrinho.reduce((total, item) => total + item.quantidade, 0)})</h3>
                <button className="fechar-carrinho" onClick={() => setCarrinho([])}>✕</button>
              </div>
              <div className="carrinho-itens">
                {carrinho.map((item, idx) => (
                  <div key={idx} className="carrinho-item">
                    <span>{item.nome} (Tam: {item.tamanho})</span>
                    <div className="item-controles">
                      <button onClick={() => atualizarQuantidade(item.id, item.tamanho, item.quantidade - 1)}>-</button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, item.tamanho, item.quantidade + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="carrinho-total"><strong>Total: R$ {calcularTotal()}</strong></div>
              <button className="btn-enviar" onClick={enviarPedido}>📤 ENVIAR AO ESTOQUE</button>
            </div>
          )}
        </div>
      ) : (
        <div className="meus-envios">
          <div className="envios-header-acoes">
            <h2 className="envios-titulo">📋 MEUS PEDIDOS</h2>
            {meusPedidos.length > 0 && (
              <button className="btn-limpar-historico" onClick={limparPedidosLocal}>
                🗑️ Limpar Histórico
              </button>
            )}
          </div>
          
          {meusPedidos.length === 0 ? (
            <p className="sem-pedidos">📭 Nenhum pedido feito ainda.</p>
          ) : (
            meusPedidos.map(pedido => (
              <div key={pedido.id} className={`pedido-envio ${pedido.status}`}>
                <div className="pedido-header">
                  <span>Pedido #{pedido.id}</span>
                  <span className={`status ${pedido.status}`}>{pedido.status === 'pendente' ? '⏳ Pendente' : '✅ Concluído'}</span>
                </div>
                <div className="pedido-itens">
                  {pedido.itens.map((item, idx) => (
                    <div key={idx}>• {item.nome} - Tam {item.tamanho} x {item.quantidade}</div>
                  ))}
                </div>
                <div className="pedido-total">Total: R$ {pedido.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TelaVendedor;
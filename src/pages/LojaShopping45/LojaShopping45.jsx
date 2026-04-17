// src/components/LojaShopping45.jsx
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import TelaVendedor from '../TelaVendedor/TelaVendedor';
import TelaEstoquista from '../TelaEstoquista/TelaEstoquista';
import TelaGerente from '../TelaGerente/TelaGerente';
import TelaCaixa from '../TelaCaixa/TelaCaixa';
import './LojaShopping45.css';

const LojaShopping45 = ({ onVoltar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [telaAtual, setTelaAtual] = useState('principal');
  const [vendedorSelecionado, setVendedorSelecionado] = useState(null);
  const [caixaSelecionado, setCaixaSelecionado] = useState(null); // Estado movido para cá
  const [pedidos, setPedidos] = useState([]);

  const funcionarios = {
    vendedores: [
      { nome: 'Gab', icone: '👩‍💼', cor: '#ff6b6b' },
      { nome: 'Vanessa', icone: '👩‍🦰', cor: '#ff6b6b' },
      { nome: 'Daiana', icone: '👩‍🦰', cor: '#ff6b6b' },
      { nome: 'Antônia', icone: '👩‍🦰', cor: '#ff6b6b' }
    ],
    caixas: [
      { nome: 'Luciane', icone: '💰', cor: '#4ecdc4' },
      { nome: 'Yasmin', icone: '💳', cor: '#4ecdc4' }
    ],
    estoquistas: [
      { nome: 'Moises', icone: '📦', cor: '#ffe66d' },
      { nome: 'Weligton', icone: '📦', cor: '#ffe66d' }
    ],
    gerente: [
      { nome: 'Camila', icone: '👔', cor: '#ff6b6b' }
    ]
  };

  const fazerPedido = (novoPedido) => {
    setPedidos([...pedidos, novoPedido]);
  };

  const atualizarPedido = (pedidoId, atualizacao) => {
    setPedidos(pedidos.map(pedido =>
      pedido.id === pedidoId ? { ...pedido, ...atualizacao } : pedido
    ));
  };

  // --- LÓGICA DE TROCA DE TELAS ---

  if (telaAtual === 'vendedor' && vendedorSelecionado) {
    return (
      <TelaVendedor
        onVoltar={() => setTelaAtual('principal')}
        onFazerPedido={fazerPedido}
        vendedorNome={vendedorSelecionado}
      />
    );
  }

  if (telaAtual === 'caixa') {
    return (
      <TelaCaixa
        onVoltar={() => setTelaAtual('principal')}
        onFazerPedido={fazerPedido}
        caixaNome={caixaSelecionado}
      />
    );
  }

  if (telaAtual === 'estoquista') {
    return (
      <TelaEstoquista
        onVoltar={() => setTelaAtual('principal')}
        pedidos={pedidos}
        onAtualizarPedido={atualizarPedido}
      />
    );
  }

  if (telaAtual === 'gerente') {
    return (
      <TelaGerente
        onVoltar={() => setTelaAtual('principal')}
        pedidos={pedidos}
      />
    );
  }

  // --- TELA PRINCIPAL DA LOJA ---
  return (
    <div className={`perfil-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>

      <button className="btn-voltar" onClick={onVoltar}>
        ← Voltar para lojas
      </button>

      <div className="cabecalho-loja">
        <div className="icone-loja-grande">🏪</div>
        <h1>LOJA SHOPPING 45</h1>
        <p>Equipe Havaianas Connect</p>
      </div>

      <div className="perfis-wrapper">
        {/* VENDEDORES */}
        <div className="cargo-section">
          <div className="cargo-titulo">
            <span className="cargo-icone">👩‍💼</span>
            <h2>VENDEDORES</h2>
          </div>
          <div className="cards-perfil">
            {funcionarios.vendedores.map((vendedor, index) => (
              <div 
                key={index} 
                className="perfil-card"
                onClick={() => {
                  setVendedorSelecionado(vendedor.nome);
                  setTelaAtual('vendedor');
                }}
              >
                <div className="perfil-icone" style={{ background: vendedor.cor }}>
                  {vendedor.icone}
                </div>
                <h3>{vendedor.nome}</h3>
                <span className="cargo-badge">Vendedor(a)</span>
              </div>
            ))}
          </div>
        </div>

        {/* CAIXA */}
        <div className="cargo-section">
          <div className="cargo-titulo">
            <span className="cargo-icone">💰</span>
            <h2>CAIXA</h2>
          </div>
          <div className="cards-perfil">
            {funcionarios.caixas.map((caixa, index) => (
              <div 
                key={index} 
                className="perfil-card caixa-card"
                onClick={() => {
                  setCaixaSelecionado(caixa.nome);
                  setTelaAtual('caixa');
                }}
              >
                <div className="perfil-icone" style={{ background: caixa.cor }}>
                  {caixa.icone}
                </div>
                <h3>{caixa.nome}</h3>
                <span className="cargo-badge">Caixa</span>
                <div className="urgente-badge">🚨 Pedidos Urgentes</div>
              </div>
            ))}
          </div>
        </div>

        {/* ESTOQUISTAS */}
        <div className="cargo-section">
          <div className="cargo-titulo">
            <span className="cargo-icone">📦</span>
            <h2>ESTOQUISTAS</h2>
          </div>
          <div className="cards-perfil">
            {funcionarios.estoquistas.map((estoquista, index) => (
              <div 
                key={index} 
                className="perfil-card"
                onClick={() => setTelaAtual('estoquista')}
              >
                <div className="perfil-icone" style={{ background: estoquista.cor }}>
                  {estoquista.icone}
                </div>
                <h3>{estoquista.nome}</h3>
                <span className="cargo-badge">Estoquista</span>
                {pedidos.filter(p => p.status === 'pendente').length > 0 && (
                  <div className="notificacao-pedido">
                    {pedidos.filter(p => p.status === 'pendente').length}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GERENTE */}
        <div className="cargo-section">
          <div className="cargo-titulo">
            <span className="cargo-icone">👔</span>
            <h2>GERENTE</h2>
          </div>
          <div className="cards-perfil">
            {funcionarios.gerente.map((gerente, index) => (
              <div 
                key={index} 
                className="perfil-card gerente-card"
                onClick={() => setTelaAtual('gerente')}
              >
                <div className="perfil-icone" style={{ background: gerente.cor }}>
                  {gerente.icone}
                </div>
                <h3>{gerente.nome}</h3>
                <span className="cargo-badge">Gerente</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rodape">
        <p>🌟 Equipe dedicada para melhor atendê-lo!</p>
      </div>
    </div>
  );
};

export default LojaShopping45;
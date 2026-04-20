// src/components/TelaInicial.jsx
import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { configurarNotificacoes } from '../../services/pushSubscription';
import './TelaInicial.css';

const TelaInicial = ({ onSelecionarLoja }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  // Tenta configurar as notificações assim que o app é aberto
  useEffect(() => {
    // Essa função pede permissão e inscreve o celular no servidor do Render
    configurarNotificacoes();
  }, []);

  return (
    <div className={`container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div className="marca">
        <h1>HAVAIANAS</h1>
        <h2>CONNECT</h2>
      </div>

      <div className="emblema-loja">
        <div className="icone-loja">🏪</div>
        <p>NOSSAS LOJAS</p>
      </div>

      <div className="lojas">
        <div className="loja-card" onClick={() => onSelecionarLoja('LOJA SHOPPING 45')}>
          <span>📍</span>
          <p>LOJA SHOPPING 45</p>
          <span className="status">ABERTA</span>
        </div>
      </div>

      <div className="info-pwa">
        <p className="subtexto">
          Para receber notificações com a tela bloqueada, 
          instale o app ou adicione à tela de início.
        </p>
      </div>
    </div>
  );
};

export default TelaInicial;
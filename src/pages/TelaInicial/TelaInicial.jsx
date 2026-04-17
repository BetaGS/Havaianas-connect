// src/components/TelaInicial.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './TelaInicial.css';

const TelaInicial = ({ onSelecionarLoja }) => {
  const { darkMode, toggleDarkMode } = useTheme();

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
        <div className="loja-card" onClick={() => onSelecionarLoja('LOJA TIJUCA')}>
          <span>📍</span>
          <p>LOJA TIJUCA</p>
          <span className="status">ABERTA</span>
        </div>
        <div className="loja-card" onClick={() => onSelecionarLoja('LOJA SHOPPING 45')}>
          <span>📍</span>
          <p>LOJA SHOPPING 45</p>
          <span className="status">ABERTA</span>
        </div>
      </div>
    </div>
  );
};

export default TelaInicial;
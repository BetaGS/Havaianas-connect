// src/pages/TelaInicial/TelaInicial.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importante para a navegação funcionar
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext'; // Importado para vincular o push ao usuário
import { configurarNotificacoes, sincronizarPushComUsuario } from '../../services/pushNotification';
import './TelaInicial.css';

const TelaInicial = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth(); // Pegamos o usuário logado e a função de sair
  const navigate = useNavigate();

  useEffect(() => {
    // Configura o Service Worker e, se houver um usuário logado, vincula o push a ele no banco
    const setupNotificacoes = async () => {
      await configurarNotificacoes();
      if (user?.username || user?.nome) {
        // Usa o username ou email para identificar o dispositivo no banco de dados
        await sincronizarPushComUsuario(user.username || user.nome);
      }
    };
    
    setupNotificacoes();
  }, [user]);

  return (
    <div className={`container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="controles-topo-inicial">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className="btn-logout" onClick={logout}>
          🚪 Sair
        </button>
      </div>

      <div className="marca">
        <h1>HAVAIANAS</h1>
        <h2>CONNECT</h2>
        {user && <p className="welcome-msg">Olá, {user.nome || user.username}!</p>}
      </div>

      <div className="emblema-loja">
        <div className="icone-loja">🏪</div>
        <p>NOSSAS LOJAS</p>
      </div>

      <div className="lojas">
        {/* Agora usamos navigate para mudar a URL para /loja-45 */}
        <div className="loja-card" onClick={() => navigate('/loja-45')}>
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
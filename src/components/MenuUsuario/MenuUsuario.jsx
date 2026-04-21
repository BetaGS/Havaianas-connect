// src/components/MenuUsuario.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './MenuUsuario.css';

const MenuUsuario = () => {
  const { usuario, logout } = useAuth();

  const getFuncaoEmoji = (funcao) => {
    switch (funcao) {
      case 'vendedor': return '👩‍💼';
      case 'caixa': return '💰';
      case 'estoquista': return '📦';
      case 'gerente': return '👔';
      default: return '👤';
    }
  };

  const getFuncaoLabel = (funcao) => {
    switch (funcao) {
      case 'vendedor': return 'Vendedor';
      case 'caixa': return 'Caixa';
      case 'estoquista': return 'Estoquista';
      case 'gerente': return 'Gerente';
      default: return 'Usuário';
    }
  };

  return (
    <div className="menu-usuario">
      <div className="usuario-info">
        <span className="usuario-avatar">{getFuncaoEmoji(usuario.funcao)}</span>
        <div className="usuario-detalhes">
          <strong>{usuario.nome}</strong>
          <span className="usuario-funcao">{getFuncaoLabel(usuario.funcao)}</span>
        </div>
      </div>
      <button className="btn-logout" onClick={logout}>
        🚪 Sair
      </button>
    </div>
  );
};

export default MenuUsuario;
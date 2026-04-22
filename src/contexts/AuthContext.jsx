// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('havaianas_usuario');
    if (saved && saved !== "undefined") {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('havaianas_usuario');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, senha) => {
    const usuarios = JSON.parse(localStorage.getItem('havaianas_usuarios') || '[]');
    const achado = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (!achado) throw new Error('E-mail ou senha incorretos!');
    
    // Padronização: transforma qualquer cargo/função em minúsculo
    const cargoLimpo = (achado.cargo || achado.funcao || 'vendedor').toLowerCase();
    
    const usuarioFinal = { ...achado, cargo: cargoLimpo };
    delete usuarioFinal.senha;

    setUser(usuarioFinal);
    localStorage.setItem('havaianas_usuario', JSON.stringify(usuarioFinal));
    return usuarioFinal;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('havaianas_usuario');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tenta recuperar o usuário salvo
    const savedUser = localStorage.getItem('havaianas_usuario');
    
    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao ler localStorage", e);
        localStorage.removeItem('havaianas_usuario');
      }
    }
    
    // 2. AQUI ESTÁ O SEGREDO: O loading PRECISA virar false
    // para o App sair do estado de espera.
    setLoading(false);
  }, []);

  const login = (email, senha) => {
    const usuarios = JSON.parse(localStorage.getItem('havaianas_usuarios') || '[]');
    const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (!usuarioEncontrado) throw new Error('E-mail ou senha incorretos!');
    
    const { senha: _, ...usuarioSemSenha } = usuarioEncontrado;
    
    // Garantimos que o campo 'cargo' existe (baseado no que você escolheu no cadastro)
    const finalUser = { ...usuarioSemSenha, cargo: usuarioSemSenha.cargo || usuarioSemSenha.funcao };
    
    setUser(finalUser);
    localStorage.setItem('havaianas_usuario', JSON.stringify(finalUser));
    return finalUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('havaianas_usuario');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
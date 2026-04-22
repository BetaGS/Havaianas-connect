// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mudamos para 'user' para bater com o que escrevemos no App.jsx
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('havaianas_usuario');
    if (usuarioSalvo) {
      setUser(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  // Cadastrar
  const cadastrar = async (dados) => {
    // Simulando banco local, mas garantindo que o campo seja 'cargo'
    const usuarios = JSON.parse(localStorage.getItem('havaianas_usuarios') || '[]');
    
    if (usuarios.find(u => u.email === dados.email)) {
      throw new Error('E-mail já cadastrado!');
    }
    
    const novoUsuario = {
      id: Date.now(),
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      cargo: dados.funcao, // Transformamos funcao em cargo aqui para o App.jsx entender
      dataCadastro: new Date().toLocaleString()
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('havaianas_usuarios', JSON.stringify(usuarios));
    
    const { senha, ...usuarioSemSenha } = novoUsuario;
    setUser(usuarioSemSenha);
    localStorage.setItem('havaianas_usuario', JSON.stringify(usuarioSemSenha));
    
    return usuarioSemSenha;
  };

  // Login
  const login = async (email, senha) => {
    const usuarios = JSON.parse(localStorage.getItem('havaianas_usuarios') || '[]');
    const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (!usuarioEncontrado) {
      throw new Error('E-mail ou senha incorretos!');
    }
    
    // IMPORTANTE: Garantimos que o objeto tenha 'user' e 'cargo'
    const { senha: _, ...usuarioSemSenha } = usuarioEncontrado;
    
    setUser(usuarioSemSenha);
    localStorage.setItem('havaianas_usuario', JSON.stringify(usuarioSemSenha));
    
    return usuarioSemSenha; 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('havaianas_usuario');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,      // Antes era 'usuario', agora é 'user'
      loading,   // Antes era 'carregando'
      cadastrar,
      login,
      logout,
      authenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
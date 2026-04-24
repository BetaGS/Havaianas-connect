// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    // Recupera usuário logado
=======
>>>>>>> 088921e (atualizando tela vendedor e login)
    const storedUser = localStorage.getItem('@Havaianas:user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        localStorage.removeItem('@Havaianas:user');
      }
    }
    setLoading(false);
  }, []);

<<<<<<< HEAD
  // Função de cadastro
  const cadastrar = async (dados) => {
    try {
      console.log('📝 Cadastrando usuário:', dados.email);

      // Recupera usuários existentes
      const usuariosString = localStorage.getItem('@Havaianas:usuarios');
      const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

      // Verifica se email já existe
=======
  const cadastrar = async (dados) => {
    try {
      console.log('📝 Cadastrando:', dados.email);
      
      const usuariosString = localStorage.getItem('@Havaianas:usuarios');
      const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

>>>>>>> 088921e (atualizando tela vendedor e login)
      if (usuarios.some(u => u.email === dados.email)) {
        throw new Error('Este e-mail já está cadastrado');
      }

<<<<<<< HEAD
      // Cria novo usuário
=======
>>>>>>> 088921e (atualizando tela vendedor e login)
      const novoUsuario = {
        id: Date.now(),
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
<<<<<<< HEAD
        funcao: dados.funcao || dados.cargo || 'vendedor',
        criadoEm: new Date().toISOString()
      };

      // Salva na lista
      usuarios.push(novoUsuario);
      localStorage.setItem('@Havaianas:usuarios', JSON.stringify(usuarios));

      console.log('✅ Usuário cadastrado:', novoUsuario);
      return novoUsuario;

=======
        funcao: dados.funcao,
        criadoEm: new Date().toISOString()
      };

      usuarios.push(novoUsuario);
      localStorage.setItem('@Havaianas:usuarios', JSON.stringify(usuarios));

      console.log('✅ Cadastrado com sucesso');
      return novoUsuario;
>>>>>>> 088921e (atualizando tela vendedor e login)
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
<<<<<<< HEAD
=======
  };

  const login = async (email, senha) => {
    try {
      console.log('🔐 Login:', email);
      
      const usuariosString = localStorage.getItem('@Havaianas:usuarios');
      const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

      const usuario = usuarios.find(u => u.email === email && u.senha === senha);

      if (!usuario) {
        throw new Error('E-mail ou senha incorretos');
      }

      const { senha: _, ...userWithoutPassword } = usuario;
      setUser(userWithoutPassword);
      localStorage.setItem('@Havaianas:user', JSON.stringify(userWithoutPassword));

      console.log('✅ Login realizado, função:', userWithoutPassword.funcao);
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
>>>>>>> 088921e (atualizando tela vendedor e login)
  };

  // Função de login
  const login = async (email, senha) => {
    try {
      console.log('🔐 Tentando login:', email);

      const usuariosString = localStorage.getItem('@Havaianas:usuarios');
      const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

      const usuario = usuarios.find(
        u => u.email === email && u.senha === senha
      );

      if (!usuario) {
        throw new Error('E-mail ou senha incorretos');
      }

      // Remove senha antes de salvar no estado
      const { senha: _, ...userWithoutPassword } = usuario;
      setUser(userWithoutPassword);
      localStorage.setItem('@Havaianas:user', JSON.stringify(userWithoutPassword));

      console.log('✅ Login realizado:', userWithoutPassword);
      return userWithoutPassword;

    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('@Havaianas:user');
<<<<<<< HEAD
    console.log('👋 Logout realizado');
  };

  const value = {
    user,
    login,
    cadastrar,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
=======
    console.log('👋 Logout');
  };

  return (
    <AuthContext.Provider value={{ user, login, cadastrar, logout, loading }}>
>>>>>>> 088921e (atualizando tela vendedor e login)
      {children}
    </AuthContext.Provider>
  );
};
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

  const cadastrar = async (dados) => {
    try {
      console.log('📝 Cadastrando:', dados.email);
      
      const usuariosString = localStorage.getItem('@Havaianas:usuarios');
      const usuarios = usuariosString ? JSON.parse(usuariosString) : [];

      if (usuarios.some(u => u.email === dados.email)) {
        throw new Error('Este e-mail já está cadastrado');
      }

      const novoUsuario = {
        id: Date.now(),
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        funcao: dados.funcao,
        criadoEm: new Date().toISOString()
      };

      usuarios.push(novoUsuario);
      localStorage.setItem('@Havaianas:usuarios', JSON.stringify(usuarios));

      console.log('✅ Cadastrado com sucesso');
      return novoUsuario;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@Havaianas:user');
    console.log('👋 Logout');
  };

  return (
    <AuthContext.Provider value={{ user, login, cadastrar, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
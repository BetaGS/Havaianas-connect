// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; 
import './Login.css';

const Login = ({ onLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      // 1. Realiza o login chamando a API pelo AuthContext
      const usuario = await login(email, senha);
      
      // LOG DE DEBUG: Abra o console (F12) para ver se os dados chegaram
      console.log("Dados do usuário recebidos:", usuario);

      if (onLogin) {
        onLogin(usuario);
      }

      // 2. REDIRECIONAMENTO POR CARGO
      // Verificamos 'cargo' ou 'funcao' para evitar erros de nomes vindo do banco
      const cargoDoUsuario = usuario?.cargo || usuario?.funcao;

      if (cargoDoUsuario === 'estoquista') {
        console.log("Redirecionando para Estoque...");
        navigate('/estoque');
      } else {
        // Como você é vendedor, o navigate deve te levar para a rota definida no App.js
        console.log("Redirecionando para área do Vendedor...");
        navigate('/vendedor'); 
      }

    } catch (error) {
      console.error("Erro na tentativa de login:", error);
      setErro(error.message || 'E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">👡</div>
          <h1>HAVAIANAS CONNECT</h1>
          <p>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {erro && <div className="erro-mensagem">{erro}</div>}

          <div className="input-group">
            <label>
              <span className="input-icon">📧</span>
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label>
              <span className="input-icon">🔒</span>
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? '⏳ Entrando...' : '🚀 ENTRAR'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Não tem uma conta? <Link to="/cadastro" className="link-cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
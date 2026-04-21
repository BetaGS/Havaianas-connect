// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = ({ onLogin }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const usuario = await login(email, senha);
      if (onLogin) {
        onLogin(usuario);
      }
    } catch (error) {
      setErro(error.message);
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
            />
          </div>

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? '⏳ Entrando...' : '🚀 ENTRAR'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Não tem uma conta? <a onClick={() => window.location.href = '/cadastro'}>Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
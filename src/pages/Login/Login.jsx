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
      // 1. Autentica e recebe os dados do usuário
      const usuario = await login(email, senha);
      
      console.log("Login OK! Cargo detectado:", usuario?.cargo || usuario?.funcao);

      if (onLogin) onLogin(usuario);

      // 2. Redirecionamento Imediato usando replace: true
      // Isso impede que o usuário consiga clicar em "Voltar" e cair no login de novo
      const cargo = usuario?.cargo || usuario?.funcao;

      if (cargo === 'estoquista') {
        navigate('/estoque', { replace: true });
      } else {
        // Vendedores e outros cargos vão direto para a tela de trabalho
        navigate('/vendedor', { replace: true }); 
      }

    } catch (error) {
      console.error("Erro no submit de login:", error);
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
          <p>Acesse seu painel de trabalho</p>
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
            {carregando ? '⏳ Verificando...' : '🚀 ENTRAR NO SISTEMA'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Novo por aqui? <Link to="/cadastro" className="link-cadastro">Solicitar acesso</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
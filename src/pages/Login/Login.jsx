// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Importações necessárias para navegação interna
import './Login.css';

const Login = ({ onLogin }) => {
  const { login } = useAuth();
  const navigate = useNavigate(); // Hook para redirecionar via código
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      // O seu AuthContext deve retornar os dados do usuário (incluindo o cargo)
      const usuario = await login(email, senha);
      
      if (onLogin) {
        onLogin(usuario);
      }

      // Redirecionamento Inteligente baseado no cargo
      // Isso mata o erro de Not Found porque é feito pelo React, não pelo navegador
      if (usuario.cargo === 'estoquista') {
        navigate('/estoque');
      } else {
        navigate('/'); // Vai para a tela de vendedor/home
      }

    } catch (error) {
      // Captura erros do backend (ex: senha errada ou usuário não existe)
      setErro(error.message || 'Erro ao realizar login. Tente novamente.');
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
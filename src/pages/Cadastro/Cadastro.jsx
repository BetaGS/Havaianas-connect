// src/pages/Cadastro/Cadastro.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Importações para navegação interna
import './Cadastro.css';

const Cadastro = ({ onCadastro }) => {
  const { cadastrar } = useAuth();
  const navigate = useNavigate(); // Hook para redirecionar o usuário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    funcao: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const funcoes = [
    { value: 'vendedor', label: 'Vendedor', emoji: '🩴', cor: '#ff6b6b' },
    { value: 'caixa', label: 'Caixa', emoji: '💰', cor: '#4ecdc4' },
    { value: 'estoquista', label: 'Estoquista', emoji: '📦', cor: '#ffe66d' },
    { value: 'gerente', label: 'Gerente', emoji: '👔', cor: '#ff6b6b' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFuncaoSelect = (funcao) => {
    setFormData({
      ...formData,
      funcao
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');

    // Validações básicas de Front-end
    if (!formData.nome.trim()) {
      setErro('Por favor, informe seu nome completo');
      setCarregando(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      setCarregando(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não conferem');
      setCarregando(false);
      return;
    }

    if (!formData.funcao) {
      setErro('Por favor, selecione sua função na loja');
      setCarregando(false);
      return;
    }

    try {
      const usuario = await cadastrar({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cargo: formData.funcao // Certifique-se que o backend espera "cargo" ou "funcao"
      });

      setSucesso('✅ Cadastro realizado com sucesso! Redirecionando...');
      
      // Pequeno delay para o usuário ler a mensagem de sucesso
      setTimeout(() => {
        if (onCadastro) {
          onCadastro(usuario);
        }
        // Após cadastrar, levamos o usuário para o Login ou Home
        navigate('/login');
      }, 1500);

    } catch (error) {
      setErro(error.message || 'Erro ao realizar cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <div className="cadastro-header">
          <div className="cadastro-logo">👡</div>
          <h1>CRIAR CONTA</h1>
          <p>Cadastre-se para começar a usar</p>
        </div>

        <form onSubmit={handleSubmit} className="cadastro-form">
          {erro && <div className="erro-mensagem">{erro}</div>}
          {sucesso && <div className="sucesso-mensagem">{sucesso}</div>}

          <div className="input-group">
            <label>
              <span className="input-icon">👤</span>
              Nome Completo
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Digite seu nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>
              <span className="input-icon">📧</span>
              E-mail
            </label>
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
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
              name="senha"
              placeholder="Mínimo 6 caracteres"
              value={formData.senha}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label>
              <span className="input-icon">🔒</span>
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmarSenha"
              placeholder="Digite a senha novamente"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label>
              <span className="input-icon">🏪</span>
              Sua Função na Loja
            </label>
            <div className="funcao-options">
              {funcoes.map((funcao) => (
                <div
                  key={funcao.value}
                  className={`funcao-option ${formData.funcao === funcao.value ? 'selected' : ''}`}
                  onClick={() => handleFuncaoSelect(funcao.value)}
                >
                  <span className="funcao-emoji">{funcao.emoji}</span>
                  <span>{funcao.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-cadastrar" disabled={carregando}>
            {carregando ? '⏳ Cadastrando...' : '✅ CADASTRAR'}
          </button>
        </form>

        <div className="cadastro-footer">
          <p>
            Já tem uma conta? <Link to="/login" className="link-login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
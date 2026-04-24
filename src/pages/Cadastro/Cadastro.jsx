// src/pages/Cadastro/Cadastro.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Cadastro.css';

const Cadastro = ({ onCadastro }) => {
  const { cadastrar, login } = useAuth();
  const navigate = useNavigate();
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

  // Funções disponíveis
  const funcoes = [
    { value: 'vendedor', label: 'Vendedor', emoji: '🩴', cor: '#ff6b6b', rota: '/vendedor/dashboard' },
    { value: 'estoquista', label: 'Estoquista', emoji: '📦', cor: '#ffe66d', rota: '/estoquista/pedidos' },
    { value: 'caixa', label: 'Caixa', emoji: '💰', cor: '#4ecdc4', rota: '/caixa/pedidos' },
    { value: 'gerente', label: 'Gerente', emoji: '👔', cor: '#ff6b6b', rota: '/gerente/dashboard' }
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

    // Validações
    if (!formData.nome.trim()) {
      setErro('Por favor, informe seu nome completo');
      setCarregando(false);
      return;
    }

    if (!formData.email.trim()) {
      setErro('Por favor, informe seu e-mail');
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
      // 1. Cadastra o usuário - CORRIGIDO: enviar apenas os campos necessários
      const usuario = await cadastrar({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        funcao: formData.funcao
      });

      console.log("✅ Cadastro realizado! Função:", formData.funcao);
      setSucesso('✅ Cadastro realizado com sucesso! Redirecionando...');

      // 2. Faz login automático
      const usuarioLogado = await login(formData.email, formData.senha);
      console.log("✅ Login automático realizado:", usuarioLogado);

      // 3. Redireciona baseado na função escolhida
      setTimeout(() => {
        if (onCadastro) {
          onCadastro(usuario);
        }
        
        // Redirecionamento por função
        const funcaoEscolhida = formData.funcao;
        console.log("🔄 Redirecionando para:", funcaoEscolhida);
        
        switch(funcaoEscolhida) {
          case 'estoquista':
            navigate('/estoquista/pedidos', { replace: true });
            break;
          case 'vendedor':
            navigate('/vendedor/dashboard', { replace: true });
            break;
          case 'caixa':
            navigate('/caixa/pedidos', { replace: true });
            break;
          case 'gerente':
            navigate('/gerente/dashboard', { replace: true });
            break;
          default:
            navigate('/tela-inicial', { replace: true });
        }
      }, 1000);

    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      setErro(error.message || 'Erro ao realizar cadastro. Tente outro e-mail.');
      setSucesso('');
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
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={carregando}
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
              disabled={carregando}
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
              disabled={carregando}
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
              disabled={carregando}
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
                  onClick={() => !carregando && handleFuncaoSelect(funcao.value)}
                  style={{
                    borderColor: formData.funcao === funcao.value ? funcao.cor : '#ddd',
                    backgroundColor: formData.funcao === funcao.value ? `${funcao.cor}20` : '#f5f5f5'
                  }}
                >
                  <span className="funcao-emoji">{funcao.emoji}</span>
                  <span>{funcao.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-cadastrar" disabled={carregando}>
            {carregando ? '⏳ Cadastrando e redirecionando...' : '✅ CADASTRAR'}
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
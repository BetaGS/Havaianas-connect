// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import LojaShopping45 from './pages/LojaShopping45/LojaShopping45';

// Componente de rotas protegidas
const ProtectedRoute = ({ children, funcoesPermitidas = [] }) => {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Carregando...</h2>
    </div>;
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (funcoesPermitidas.length > 0 && !funcoesPermitidas.includes(usuario.funcao)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  const { usuario } = useAuth();
  const [paginaAtual, setPaginaAtual] = useState('home');
  const [lojaSelecionada, setLojaSelecionada] = useState(null);

  const handleSelecionarLoja = (loja) => {
    setLojaSelecionada(loja);
    if (loja === 'LOJA SHOPPING 45') {
      setPaginaAtual('lojaShopping45');
    }
  };

  const handleVoltar = () => {
    setPaginaAtual('home');
    setLojaSelecionada(null);
  };

  // Se não estiver logado, mostrar rotas de autenticação
  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Se estiver logado, mostrar as telas do app
  return (
    <>
      {paginaAtual === 'home' && (
        <TelaInicial onSelecionarLoja={handleSelecionarLoja} />
      )}
      {paginaAtual === 'lojaShopping45' && (
        <LojaShopping45 onVoltar={handleVoltar} />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PedidosProvider>
            <AppContent />
          </PedidosProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
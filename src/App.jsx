import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';

const ProtectedRoute = ({ children, funcoesPermitidas = [] }) => {
  const { user, loading } = useAuth();

  // 1. IMPORTANTE: Se está carregando, não redireciona! 
  // Isso evita o loop inicial.
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Autenticando...</div>;
  }

  // 2. Se terminou de carregar e não tem usuário, aí sim vai para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const cargo = user.cargo || user.funcao;
  if (funcoesPermitidas.length > 0 && !funcoesPermitidas.includes(cargo)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return null; // Evita renderizar rotas antes de saber quem é o usuário

  return (
    <Routes>
      {/* Se já estiver logado, não deixa entrar na tela de login/cadastro */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/cadastro" element={!user ? <Cadastro /> : <Navigate to="/" replace />} />

      <Route path="/" element={
        <ProtectedRoute>
          {/* Lógica de Redirecionamento Direto */}
          {(user?.cargo === 'estoquista' || user?.funcao === 'estoquista') 
            ? <Navigate to="/estoque" replace /> 
            : <Navigate to="/vendedor" replace />}
        </ProtectedRoute>
      } />

      <Route path="/vendedor" element={<ProtectedRoute><TelaInicial /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute funcoesPermitidas={['estoquista']}><TelaEstoquista /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <PedidosProvider>
            <AppContent />
          </PedidosProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
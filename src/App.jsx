import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import LojaShopping45 from './pages/LojaShopping45/LojaShopping45';
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';

const ProtectedRoute = ({ children, funcoesPermitidas = [] }) => {
  const { user, usuario, loading } = useAuth();
  const dadosUsuario = user || usuario; // Aceita qualquer um dos dois nomes

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Carregando...</div>;
  
  if (!dadosUsuario) {
    return <Navigate to="/login" replace />;
  }

  const cargo = dadosUsuario.cargo || dadosUsuario.funcao;
  if (funcoesPermitidas.length > 0 && !funcoesPermitidas.includes(cargo)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { user, usuario } = useAuth();
  const dadosUsuario = user || usuario;

  return (
    <Routes>
      <Route path="/login" element={!dadosUsuario ? <Login /> : <Navigate to="/vendedor" />} />
      <Route path="/cadastro" element={!dadosUsuario ? <Cadastro /> : <Navigate to="/vendedor" />} />

      <Route path="/" element={
        <ProtectedRoute>
          {(dadosUsuario?.cargo === 'estoquista' || dadosUsuario?.funcao === 'estoquista') 
            ? <Navigate to="/estoque" replace /> 
            : <Navigate to="/vendedor" replace />}
        </ProtectedRoute>
      } />

      <Route path="/vendedor" element={<ProtectedRoute><TelaInicial /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute funcoesPermitidas={['estoquista']}><TelaEstoquista /></ProtectedRoute>} />
      <Route path="/loja-45" element={<ProtectedRoute><LojaShopping45 /></ProtectedRoute>} />
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
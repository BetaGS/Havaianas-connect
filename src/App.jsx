import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';

// Importações de Páginas
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial'; // Esta será a tela do Vendedor
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';

const ProtectedRoute = ({ children, funcoesPermitidas = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const cargo = user.cargo || user.funcao;
  if (funcoesPermitidas.length > 0 && !funcoesPermitidas.includes(cargo)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/cadastro" element={!user ? <Cadastro /> : <Navigate to="/" />} />

      {/* Rota Raiz: Ela não tem tela, ela apenas REDIRECIONA conforme a função */}
      <Route path="/" element={
        <ProtectedRoute>
          {(user?.cargo === 'estoquista' || user?.funcao === 'estoquista') 
            ? <Navigate to="/estoque" replace /> 
            : <Navigate to="/vendedor" replace />}
        </ProtectedRoute>
      } />

      {/* Tela exclusiva do Vendedor */}
      <Route path="/vendedor" element={
        <ProtectedRoute>
          <TelaInicial />
        </ProtectedRoute>
      } />

      {/* Tela exclusiva do Estoquista */}
      <Route path="/estoque" element={
        <ProtectedRoute funcoesPermitidas={['estoquista']}>
          <TelaEstoquista />
        </ProtectedRoute>
      } />

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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import LojaShopping45 from './pages/LojaShopping45/LojaShopping45';
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';

const ProtectedRoute = ({ children, funcoesPermitidas = [] }) => {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
        <h2 style={{ color: '#ff6b6b' }}>Carregando Havaianas... ⏳</h2>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const cargoUser = usuario.funcao || usuario.cargo;
  if (funcoesPermitidas.length > 0 && !funcoesPermitidas.includes(cargoUser)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!usuario ? <Login /> : <Navigate to="/" />} />
      <Route path="/cadastro" element={!usuario ? <Cadastro /> : <Navigate to="/" />} />

      {/* Rota Principal */}
      <Route path="/" element={
        <ProtectedRoute>
          {/* Redirecionamento automático baseado no cargo */}
          {usuario?.funcao === 'estoquista' || usuario?.cargo === 'estoquista' 
            ? <Navigate to="/estoque" replace /> 
            : <TelaInicial />}
        </ProtectedRoute>
      } />

      <Route path="/estoque" element={
        <ProtectedRoute funcoesPermitidas={['estoquista']}>
          <TelaEstoquista />
        </ProtectedRoute>
      } />

      {/* Rota da Loja 45 */}
      <Route path="/loja-45" element={
        <ProtectedRoute>
          <LojaShopping45 />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importações dos Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Importe conforme o seu arquivo
import { PedidosProvider } from './contexts/PedidosContext';

// Importações de Páginas
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';
import LojaShopping45 from './pages/LojaShopping45/LojaShopping45';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={
        <ProtectedRoute>
          {user?.cargo === 'estoquista' ? <Navigate to="/estoque" /> : <TelaInicial />}
        </ProtectedRoute>
      } />
      <Route path="/estoque" element={<ProtectedRoute><TelaEstoquista /></ProtectedRoute>} />
      <Route path="/loja-45" element={<ProtectedRoute><LojaShopping45 /></ProtectedRoute>} />
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
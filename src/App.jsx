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
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista'; // Verifique o caminho correto

// Componente de Rotas Protegidas (Blindado contra Not Found)
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

  // Verifica se o cargo/função do usuário bate com o permitido para a tela
  if (funcoesPermitidas.length > 0 && !funcoesPermitidas.includes(usuario.funcao || usuario.cargo)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { usuario } = useAuth();

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={!usuario ? <Login /> : <Navigate to="/" />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rota Raiz: Se for estoquista, manda pro estoque. Se não, manda pra seleção de loja */}
      <Route path="/" element={
        <ProtectedRoute>
          {usuario?.funcao === 'estoquista' || usuario?.cargo === 'estoquista' 
            ? <Navigate to="/estoque" replace /> 
            : <TelaInicial />}
        </ProtectedRoute>
      } />

      {/* Rota do Estoque: Protegida apenas para estoquistas */}
      <Route path="/estoque" element={
        <ProtectedRoute funcoesPermitidas={['estoquista']}>
          <TelaEstoquista />
        </ProtectedRoute>
      } />

      {/* Rota de Loja Específica */}
      <Route path="/loja-45" element={
        <ProtectedRoute>
          <LojaShopping45 />
        </ProtectedRoute>
      } />

      {/* Fallback: Se digitar qualquer coisa errada, volta pro lugar seguro */}
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
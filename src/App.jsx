import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';
import TelaVendedor from './pages/TelaVendedor/TelaVendedor';

function AppContent() {
  const { user, loading } = useAuth();

  // Bloqueio de carregamento enquanto valida sessão
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column', 
        gap: '15px',
        background: '#f4f4f9'
      }}>
        <div className="spinner"></div>
        <p style={{ fontFamily: 'sans-serif', color: '#555', fontWeight: 'bold' }}>
          Autenticando usuário...
        </p>
      </div>
    );
  }

  // Normalização da função do usuário
  const userFuncao = (user?.funcao || user?.cargo || '').toLowerCase();
  const isEstoquista = userFuncao === 'estoquista';
  const isVendedor = userFuncao === 'vendedor';

  return (
    <Routes>
      {!user ? (
        /* --- UNIVERSO DESLOGADO --- */
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* Qualquer tentativa de acesso externo vai para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* --- UNIVERSO LOGADO --- */
        <>
          {/* RAIZ: Redireciona conforme o cargo */}
          <Route path="/" element={
            isEstoquista 
              ? <Navigate to="/estoquista" replace /> 
              : <Navigate to="/vendedor" replace />
          } />

          {/* ROTA ESTOQUISTA: Protegida por cargo */}
          <Route 
            path="/estoquista" 
            element={
              isEstoquista ? <TelaEstoquista /> : <Navigate to="/" replace />
            } 
          />

          {/* ROTA VENDEDOR: Protegida por cargo */}
          <Route 
            path="/vendedor" 
            element={
              isVendedor ? <TelaVendedor /> : <Navigate to="/" replace />
            } 
          />

          {/* COMPATIBILIDADE E REDIRECIONAMENTOS DE SEGURANÇA */}
          <Route path="/estoque" element={<Navigate to="/estoquista" replace />} />
          <Route path="/pedidos" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/cadastro" element={<Navigate to="/" replace />} />
          <Route path="/tela-inicial" element={<Navigate to="/" replace />} />

          {/* ROTA CURINGA: Proteção contra 404 dentro do app */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
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
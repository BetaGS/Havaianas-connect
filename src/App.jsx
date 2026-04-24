// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
// TelaInicial foi REMOVIDA - não importar mais!
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';
import TelaVendedor from './pages/TelaVendedor/TelaVendedor'; // Você precisa criar esta tela

function AppContent() {
  const { user, loading } = useAuth();

  // Bloqueio total enquanto verifica o login
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '10px' }}>
        <div className="spinner"></div>
        <p style={{ fontFamily: 'sans-serif', color: '#666' }}>Autenticando...</p>
      </div>
    );
  }

  // Determina a função do usuário (suporte tanto para 'cargo' quanto para 'funcao')
  const userFuncao = user?.funcao || user?.cargo || 'vendedor';
  const isEstoquista = userFuncao.toLowerCase() === 'estoquista';
  const isVendedor = userFuncao.toLowerCase() === 'vendedor';

  return (
    <Routes>
      {!user ? (
        /* UNIVERSO DESLOGADO: Apenas login e cadastro */
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* UNIVERSO LOGADO: Redirecionamento direto para a tela da função */
        <>
          {/* ROTA RAIZ - Redireciona baseado na função */}
          <Route path="/" element={
            isEstoquista 
              ? <Navigate to="/estoquista/pedidos" replace /> 
              : <Navigate to="/vendedor/dashboard" replace />
          } />

          {/* ROTAS DO VENDEDOR */}
          <Route 
            path="/vendedor/dashboard" 
            element={
              isVendedor ? <TelaVendedor /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Compatibilidade com rota antiga /vendedor */}
          <Route 
            path="/vendedor" 
            element={<Navigate to="/vendedor/dashboard" replace />} 
          />

          {/* ROTAS DO ESTOQUISTA */}
          <Route 
            path="/estoquista/pedidos" 
            element={
              isEstoquista ? <TelaEstoquista /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Compatibilidade com rota antiga /estoque */}
          <Route 
            path="/estoque" 
            element={<Navigate to="/estoquista/pedidos" replace />} 
          />

          {/* BLOQUEAR ACESSO ÀS ROTAS ANTIGAS */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/cadastro" element={<Navigate to="/" replace />} />
          <Route path="/tela-inicial" element={<Navigate to="/" replace />} />
          
          {/* ROTA CURINGA - Sempre redireciona para a raiz */}
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
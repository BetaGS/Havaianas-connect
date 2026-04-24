// src/App.jsx
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

  // Bloqueio total enquanto verifica o login
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column', 
        gap: '10px',
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontFamily: 'sans-serif' }}>Autenticando...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
          <Route path="/" element={<Navigate to="/login" replace />} />
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
              isVendedor ? <TelaVendedor vendedorNome={user?.nome || user?.username || 'Vendedor'} /> : <Navigate to="/" replace />
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
              isEstoquista ? <TelaEstoquista estoquistaNome={user?.nome || user?.username || 'Estoquista'} /> : <Navigate to="/" replace />
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
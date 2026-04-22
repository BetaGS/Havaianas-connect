// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import TelaEstoquista from './pages/TelaEstoquista/TelaEstoquista';

function AppContent() {
  const { user, loading } = useAuth();

  // Bloqueio total enquanto verifica o login para evitar flashes de tela e loops
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '10px' }}>
        <div className="spinner"></div> {/* Se tiver um CSS de spinner, use aqui */}
        <p style={{ fontFamily: 'sans-serif', color: '#666' }}>Autenticando...</p>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        /* UNIVERSO DESLOGADO: Só existem estas rotas */
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* UNIVERSO LOGADO: As rotas de login/loja deixam de existir */
        <>
          {/* Rota Raiz (/) - Decide o destino baseada no cargo uma única vez */}
          <Route path="/" element={
            (user.cargo === 'estoquista' || user.funcao === 'estoquista') 
              ? <Navigate to="/estoque" replace /> 
              : <Navigate to="/vendedor" replace />
          } />

          {/* Páginas de Trabalho Diretas */}
          <Route path="/vendedor" element={<TelaInicial />} />
          <Route path="/estoque" element={<TelaEstoquista />} />

          {/* Se o usuário tentar acessar caminhos antigos (como /loja ou /login), volta para a raiz dele */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/cadastro" element={<Navigate to="/" replace />} />
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
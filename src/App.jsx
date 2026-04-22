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

  // Bloqueio total enquanto carrega o localStorage
  if (loading) return null;

  return (
    <Routes>
      {/* Se não está logado, só acessa Login e Cadastro */}
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* Se ESTÁ logado, define as rotas protegidas */
        <>
          <Route path="/" element={
            (user.cargo === 'estoquista' || user.funcao === 'estoquista') 
              ? <Navigate to="/estoque" replace /> 
              : <Navigate to="/vendedor" replace />
          } />
          
          <Route path="/vendedor" element={<TelaInicial />} />
          <Route path="/estoque" element={
            (user.cargo === 'estoquista' || user.funcao === 'estoquista') 
              ? <TelaEstoquista /> 
              : <Navigate to="/vendedor" replace />
          } />
          
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
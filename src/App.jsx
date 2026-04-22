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

  if (loading) return <div style={{textAlign:'center', marginTop:'20%'}}>Carregando...</div>;

  return (
    <Routes>
      {/* Se NÃO está logado, ele SÓ enxerga essas duas páginas */}
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* Se ESTÁ logado, ele SÓ enxerga as telas de trabalho */
        <>
          <Route path="/vendedor" element={<TelaInicial />} />
          <Route path="/estoque" element={<TelaEstoquista />} />
          
          {/* Rota Raiz: decide o destino UMA VEZ SÓ */}
          <Route path="/" element={
            user.cargo === 'estoquista' 
              ? <Navigate to="/estoque" replace /> 
              : <Navigate to="/vendedor" replace />
          } />

          {/* Proteção contra rotas erradas: volta para o lugar certo dele */}
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
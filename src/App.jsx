// src/App.js
import React, { useState } from 'react';
import TelaInicial from './pages/TelaInicial/TelaInicial';
import LojaShopping45 from './pages/LojaShopping45/LojaShopping45';
import { ThemeProvider } from './contexts/ThemeContext';
import { PedidosProvider } from './contexts/PedidosContext';

function App() {
  const [paginaAtual, setPaginaAtual] = useState('home');
  const [lojaSelecionada, setLojaSelecionada] = useState(null);

  const handleSelecionarLoja = (loja) => {
    setLojaSelecionada(loja);
    if (loja === 'LOJA SHOPPING 45') {
      setPaginaAtual('lojaShopping45');
    }
  };

  const handleVoltar = () => {
    setPaginaAtual('home');
    setLojaSelecionada(null);
  };

  return (
    <ThemeProvider>
      <PedidosProvider>
        {paginaAtual === 'home' && (
          <TelaInicial onSelecionarLoja={handleSelecionarLoja} />
        )}
        {paginaAtual === 'lojaShopping45' && (
          <LojaShopping45 onVoltar={handleVoltar} />
        )}
      </PedidosProvider>
    </ThemeProvider>
  );
}

export default App;
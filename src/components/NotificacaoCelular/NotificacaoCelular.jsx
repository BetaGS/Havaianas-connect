import React, { useEffect, useState } from 'react';
import './NotificacaoCelular.css';

const NotificacaoCelular = ({ pedido, onClose }) => {
  useEffect(() => {
    // Tocar som de notificação
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Áudio não suportado'));
    
    // Vibrar (se suportado)
    if (window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }

    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notificacao-celular ${pedido.urgencia ? 'urgente' : ''}`}>
      <div className="notificacao-celular-header">
        <span className="notificacao-celular-icon">🔔</span>
        <strong>NOVO PEDIDO!</strong>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="notificacao-celular-body">
        <p><strong>👤 {pedido.solicitante}</strong></p>
        <p>📦 {pedido.itens.length} item(ns)</p>
        {pedido.urgencia && <p className="urgente-text">🚨 PEDIDO URGENTE! 🚨</p>}
      </div>
    </div>
  );
};

export const NotificacaoCelularProvider = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState([]);

  const addNotificacao = (pedido) => {
    setNotificacoes(prev => [{ id: Date.now(), pedido }, ...prev]);
    
    // Limitar número de notificações
    setTimeout(() => {
      setNotificacoes(prev => prev.slice(0, 5));
    }, 100);
  };

  const removeNotificacao = (id) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {children}
      <div className="notificacoes-celular-container">
        {notificacoes.map(notif => (
          <NotificacaoCelular
            key={notif.id}
            pedido={notif.pedido}
            onClose={() => removeNotificacao(notif.id)}
          />
        ))}
      </div>
    </>
  );
};
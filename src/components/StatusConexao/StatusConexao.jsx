import React, { useState, useEffect } from 'react';
import { checkBackendHealth, testConnection } from '../services/healthCheck';
import './StatusConexao.css';

const StatusConexao = () => {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      const health = await checkBackendHealth();
      
      if (health.online) {
        setStatus('online');
        setUsuariosOnline(health.data?.online || 0);
        
        const test = await testConnection();
        setLatency(test.latency);
      } else {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`status-conexao ${status}`}>
      {status === 'online' && (
        <>
          <span className="status-dot"></span>
          <span className="status-text">Conectado</span>
          {latency && <span className="status-latency">({latency}ms)</span>}
          {usuariosOnline > 0 && (
            <span className="status-usuarios">{usuariosOnline} online</span>
          )}
        </>
      )}
      {status === 'offline' && (
        <>
          <span className="status-dot offline"></span>
          <span className="status-text">Servidor offline</span>
        </>
      )}
      {status === 'checking' && (
        <>
          <span className="status-dot checking"></span>
          <span className="status-text">Verificando...</span>
        </>
      )}
    </div>
  );
};

export default StatusConexao;
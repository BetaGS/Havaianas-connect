const BACKEND_URL = 'https://havaianas-backend.onrender.com';

export const checkBackendHealth = async () => {
  try {
    // Usamos a rota raiz '/' que foi a que definimos no server.js
    const response = await fetch(`${BACKEND_URL}/`);
    
    if (response.ok) {
      return { online: true, status: response.status };
    }
    return { online: false, status: response.status };
  } catch (error) {
    console.error('Backend offline:', error);
    return { online: false, error: error.message };
  }
};

export const testConnection = async () => {
  try {
    const start = Date.now();
    const response = await fetch(BACKEND_URL);
    const end = Date.now();
    return {
      online: response.ok,
      latency: end - start,
      status: response.status
    };
  } catch (error) {
    return { online: false, latency: null, status: null };
  }
};
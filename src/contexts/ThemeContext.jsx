// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Inicializa o estado buscando do localStorage para não perder a preferência ao dar F5
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('havaianas_theme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Toda vez que o darkMode mudar, salva no navegador
  useEffect(() => {
    localStorage.setItem('havaianas_theme', JSON.stringify(darkMode));
    
    // Opcional: Adiciona uma classe ao body para facilitar o CSS global
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
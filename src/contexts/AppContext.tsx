import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userLocation: string;
  setUserLocation: (location: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [userLocation, setUserLocation] = useState(() => {
    return localStorage.getItem('userLocation') || '';
  });
  

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('userLocation', userLocation);
  }, [userLocation]);

  

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      userLocation,
      setUserLocation
    }}>
      {children}
    </AppContext.Provider>
  );
};
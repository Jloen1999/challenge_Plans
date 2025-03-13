import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
// Corregir importaciones para usar @mui/x-date-pickers correctamente
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Toaster } from 'react-hot-toast';

// Contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// Tema personalizado
import { lightTheme, darkTheme } from './theme';

// Rutas
import AppRoutes from './routes/AppRoutes';

// Contexto de tema para compartir el estado del tema entre componentes
export const ThemeContext = React.createContext();

const App = () => {
  // Estado para controlar el tema (claro/oscuro)
  const [darkMode, setDarkMode] = useState(false);

  // Recuperar preferencia de tema del localStorage al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Función para cambiar el tema
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  // Contexto de tema que puede ser usado en toda la aplicación
  const themeContext = {
    darkMode,
    toggleDarkMode
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeContext.Provider value={themeContext}>
          <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <CssBaseline />
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: darkMode ? '#333' : '#fff',
                    color: darkMode ? '#fff' : '#333',
                  }
                }}
              />
              <AppRoutes />
            </LocalizationProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

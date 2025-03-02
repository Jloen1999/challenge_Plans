import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/theme.css';
// Importar solo index.css que a su vez importa variables.css
import './assets/styles/index.css';

// Captura el elemento root para renderizar la aplicación
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento root en el DOM');
}

// Crea una raíz de React y renderiza la aplicación
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

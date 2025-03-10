import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Asegúrate de importar primero los estilos globales y luego Bootstrap
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'react-hot-toast';

// Importación de páginas y componentes
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import RetosPage from './pages/Retos/RetosPage';
import DetalleRetoPage from './pages/Retos/DetalleRetoPage';
import RetoProgresoPage from './pages/Retos/RetoProgresoPage';
// Podríamos necesitar importar páginas adicionales para tareas en el futuro
import NavBar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Importación de estilos
import './styles/variables.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          <Toaster position="top-center" toastOptions={{
            // ...existing code...
          }} />
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/retos" element={<RetosPage />} />
              <Route path="/retos/:id" element={<DetalleRetoPage />} />
              <Route path="/retos/:id/progress" element={<RetoProgresoPage />} />
              {/* Añadir rutas adicionales para tareas si se necesitan */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;

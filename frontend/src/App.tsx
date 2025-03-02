import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Challenges from './pages/Challenges';
import PlanesEstudio from './pages/PlanesEstudio';
import Apuntes from './pages/Apuntes';
import CreateChallenge from './pages/CreateChallenge';
import ChallengeDetail from './pages/ChallengeDetail';
import PlanDetail from './pages/PlanDetail';
import ApunteDetail from './pages/ApunteDetail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CreateApunte from './pages/CreateApunte';
import './assets/styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/acerca" element={<About />} />
          
          {/* Rutas para exploración */}
          <Route path="/retos" element={<Challenges />} />
          <Route path="/planes" element={<PlanesEstudio />} />
          <Route path="/apuntes" element={<Apuntes />} />
          
          {/* Rutas para visualización de detalles */}
          <Route path="/retos/:id" element={<ChallengeDetail />} />
          <Route path="/planes/:id" element={<PlanDetail />} />
          <Route path="/apuntes/:id" element={<ApunteDetail />} />
          
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crear-reto" element={<CreateChallenge />} />
            <Route path="/apuntes/crear" element={<CreateApunte />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

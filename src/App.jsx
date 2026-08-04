import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Panelistas from './pages/Panelistas'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import MisPuntos from './pages/MisPuntos'
import MiEntrada from './pages/MiEntrada'
import Premios from './pages/Premios'
import Ranking from './pages/Ranking'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Dashboard from './pages/Dashboard/Dashboard'

import MiTienda from './pages/MiTienda'

import { ROLES } from './constants/roles'
import { Toaster } from 'sonner';

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!pathname.startsWith('/dashboard')) {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

function PendingClaimHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Capturar código de la URL si existe en los parámetros de búsqueda
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      sessionStorage.setItem('pendingClaimCode', code);
      
      // Limpiar el parámetro de la URL sin recargar la página
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  useEffect(() => {
    // 2. Si el usuario inicia sesión y tenemos un código pendiente,
    // y no estamos en la página de reclamar puntos, redirigimos allí.
    if (user && sessionStorage.getItem('pendingClaimCode')) {
      if (location.pathname !== '/mis-puntos') {
        navigate('/mis-puntos');
      }
    }
  }, [user, location.pathname, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <PendingClaimHandler />
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/panelistas" element={<Panelistas />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas del Asistente */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ASISTENTE, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <Perfil />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-puntos" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ASISTENTE, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <MisPuntos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mi-entrada" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ASISTENTE, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <MiEntrada />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/premios" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ASISTENTE, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <Premios />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ranking" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ASISTENTE, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <Ranking />
            </ProtectedRoute>
          } 
        />

        {/* Ruta Protegida de Tiendas/Vendedores */}
        <Route 
          path="/saio/mi-tienda" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.VENDEDOR, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <MiTienda />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/store" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.VENDEDOR, ROLES.ADMIN, ROLES.COORDINADOR]}>
              <MiTienda />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COORDINADOR]}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  )
}




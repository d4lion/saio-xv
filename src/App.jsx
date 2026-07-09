import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Panelistas from './pages/Panelistas'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import MisPuntos from './pages/MisPuntos'
import MiEntrada from './pages/MiEntrada'
import Premios from './pages/Premios'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/panelistas" element={<Panelistas />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas del Asistente */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-puntos" 
          element={
            <ProtectedRoute>
              <MisPuntos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mi-entrada" 
          element={
            <ProtectedRoute>
              <MiEntrada />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/premios" 
          element={
            <ProtectedRoute>
              <Premios />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  )
}




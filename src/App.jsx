import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import CookieBanner from './components/CookieBanner/CookieBanner'
import { ROLES } from './constants/roles'
import { Toaster } from 'sonner'

// ── Lazy-loaded pages (se descargan solo cuando el usuario navega a ellas) ──
const Panelistas     = lazy(() => import('./pages/Panelistas'))
const Perfil         = lazy(() => import('./pages/Perfil'))
const MisPuntos      = lazy(() => import('./pages/MisPuntos'))
const MiEntrada      = lazy(() => import('./pages/MiEntrada'))
const Premios        = lazy(() => import('./pages/Premios'))
const Ranking        = lazy(() => import('./pages/Ranking'))
const MiTienda       = lazy(() => import('./pages/MiTienda'))
const NotFound       = lazy(() => import('./pages/NotFound'))
const PaymentStatus  = lazy(() => import('./pages/PaymentStatus'))
const Boletas        = lazy(() => import('./pages/Boletas'))
const Privacidad     = lazy(() => import('./pages/Privacidad'))
const PasaporteLayout = lazy(() => import('./layouts/PasaporteLayout/PasaporteLayout'))
const Dashboard      = lazy(() => import('./pages/Dashboard/Dashboard'))

// ── Loader mínimo para transiciones de ruta ──────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050507',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '2px solid rgba(156,58,237,0.2)',
          borderTop: '2px solid #9c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

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
    const params = new URLSearchParams(window.location.href);
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
      if (location.pathname !== '/pasaporte/puntos') {
        navigate('/pasaporte/puntos');
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
      <CookieBanner />
      <Toaster position="bottom-right" richColors closeButton />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expertos" element={<Panelistas />} />
          <Route path="/panelistas" element={<Navigate to="/expertos" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/boletas" element={<Boletas />} />
          <Route path="/tickets" element={<Boletas />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/payment/status" element={<PaymentStatus />} />

          {/* Rutas Protegidas del Asistente (Experiencia Pasaporte) */}
          <Route
            path="/pasaporte"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ASISTENTE, ROLES.ADMIN, ROLES.COORDINADOR]}>
                <PasaporteLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MiEntrada />} />
            <Route path="entrada" element={<MiEntrada />} />
            <Route path="puntos" element={<MisPuntos />} />
            <Route path="premios" element={<Premios />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Ruta Protegida de Tiendas/Vendedores */}
          <Route
            path="/saio/mi-tienda"
            element={
              <ProtectedRoute allowedRoles={[ROLES.VENDEDOR]}>
                <MiTienda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute allowedRoles={[ROLES.VENDEDOR]}>
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

          {/* Ruta 404 para cualquier pestaña no definida */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}





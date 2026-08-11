import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center text-gray-900 select-none p-6 font-sans">
        {/* Panel Blanco Enterprise / Minimalista tipo Google */}
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center text-center space-y-6">
          
          {/* Spinner minimalista con escudo perfectamente centrado */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Outer spinner arc */}
            <div 
              className="absolute inset-0 rounded-full border-[3px] border-blue-100 border-t-blue-600 border-r-blue-600 animate-spin" 
              style={{ animationDuration: '0.8s' }}
            ></div>
            
            {/* Inner circle with centered shield */}
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Encabezado */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
              Adamind Security Check
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              Verificando autenticación y permisos...
            </p>
          </div>

          {/* Barra de carga real fluida tipo Google */}
          <div className="w-full space-y-2">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 h-full w-full animate-pulse"></div>
            </div>
          </div>

          {/* Badge de seguridad tipo Google Enterprise */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-mono">
              <Lock className="w-3 h-3 text-gray-500" />
              <span>Conexión cifrada TLS / 256-bit</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (!user) {
    // Redirigir a login, guardando la ubicación original para regresar después de autenticarse
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.activo === false) {
    return (
      <div className="min-h-screen bg-[#040b0f] flex flex-col items-center justify-center text-white select-none p-4 relative overflow-hidden">
        {/* Nebulosas decorativas */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="p-8 glass rounded-2xl max-w-md border border-red-500/30 text-center relative z-10 backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ boxShadow: '0 0 25px rgba(239,68,68,0.15)' }}>
            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-white mb-3 uppercase tracking-wider">
            Acceso Denegado
          </h2>
          <p className="text-secondary text-sm mb-6 leading-relaxed">
            Su cuenta ha sido temporalmente desactivada por un administrador del sistema. Comuníquese con soporte si cree que esto es un error.
          </p>
          <button 
            onClick={logout} 
            className="w-full py-2.5 px-6 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-200 hover:text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles) {
    const userRole = user?.rol ? String(user.rol).toLowerCase() : '';
    const isAllowed = allowedRoles.some(
      (role) => String(role).toLowerCase() === userRole
    );
    if (!isAllowed) {
      // Redirigir al inicio si el usuario no cuenta con el rol requerido
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

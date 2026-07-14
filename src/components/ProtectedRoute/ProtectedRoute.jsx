import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040b0f] flex flex-col items-center justify-center text-white select-none p-6">
        {/* Spinner orbital premium con estilo espacial */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Anillo exterior */}
          <div className="absolute inset-0 rounded-full border border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.2s' }}></div>
          
          {/* Anillo intermedio invertido */}
          <div className="absolute inset-4 rounded-full border border-primary-light/10"></div>
          <div className="absolute inset-4 rounded-full border-2 border-b-primary-light border-t-transparent border-r-transparent border-l-transparent animate-[spin_2.5s_linear_infinite_reverse]"></div>
          
          {/* Icono central de seguridad */}
          <ShieldCheck className="w-8 h-8 text-accent animate-pulse" />
        </div>
        
        <p className="text-secondary font-heading text-xs tracking-[0.2em] uppercase animate-pulse-glow">
          Adamind Security Checks...
        </p>
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

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir al inicio si el usuario no cuenta con el rol requerido
    return <Navigate to="/" replace />;
  }

  return children;
}

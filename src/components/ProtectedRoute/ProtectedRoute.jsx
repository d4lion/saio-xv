import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040b0f] flex flex-col items-center justify-center text-white select-none">
        {/* Spinner orbital premium con estilo espacial */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          {/* Anillo exterior */}
          <div className="absolute inset-0 rounded-full border border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
          
          {/* Anillo intermedio invertido */}
          <div className="absolute inset-3 rounded-full border border-primary-light/10"></div>
          <div className="absolute inset-3 rounded-full border border-b-primary-light border-t-transparent border-r-transparent border-l-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
          
          {/* Núcleo brillante */}
          <div className="w-4 h-4 rounded-full bg-accent glow-purple animate-pulse"></div>
        </div>
        
        <p className="text-secondary font-heading text-sm tracking-[0.2em] uppercase animate-pulse-glow">
          Cargando Seguridad...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirigir a login, guardando la ubicación original para regresar después de autenticarse
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, QrCode, Ticket, Gift, Trophy, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { motion, AnimatePresence } from 'framer-motion';
import EntropixCanvas from '../../components/Hero/EntropixCanvas';
import Swal from 'sweetalert2';
import logo from '../../assets/logo.png';

// Configuración de SweetAlert2 con temática espacial
const themedSwal = Swal.mixin({
  background: '#0e0a34',
  color: '#e2e8f0',
  confirmButtonColor: '#9c3aed',
  cancelButtonColor: '#30227f',
  customClass: {
    popup: 'border border-purple-500/25 rounded-2xl shadow-2xl backdrop-blur-xl',
    title: 'font-heading font-bold text-white text-md tracking-wide',
    htmlContainer: 'text-secondary font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:opacity-90 transition-opacity outline-none ring-0',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/5 transition-colors outline-none ring-0'
  }
});

export default function PasaporteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const userRole = user?.rol ? String(user.rol).toLowerCase() : '';
  const canAccessDashboard = userRole === ROLES.ADMIN || userRole === ROLES.COORDINADOR;

  const tabs = [
    { label: 'Mi Entrada', to: '/pasaporte/entrada', icon: Ticket },
    { label: 'Mis Puntos', to: '/pasaporte/puntos', icon: QrCode },
    { label: 'Premios', to: '/pasaporte/premios', icon: Gift },
    { label: 'Ranking', to: '/pasaporte/ranking', icon: Trophy },
    { label: 'Perfil', to: '/pasaporte/perfil', icon: User },
  ];

  async function handleLogout() {
    const confirmResult = await themedSwal.fire({
      title: '¿Cerrar Sesión?',
      text: 'Saldrás del portal seguro del asistente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Salir',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  }

  // Common NavLink classes
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl font-heading font-bold uppercase tracking-widest text-xs transition-all duration-300 w-full select-none
    ${isActive
      ? 'bg-gradient-to-r from-purple-600/80 to-accent/80 text-white shadow-[0_0_20px_rgba(156,58,237,0.3)] border border-white/20 translate-x-1'
      : 'text-secondary/70 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent'
    }`;

  return (
    <div className="min-h-[100dvh] w-full flex bg-[#050507] text-white overflow-hidden relative selection:bg-purple-500/30">
      
      {/* ─── BACKGROUND VISUALS ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <EntropixCanvas className="w-full h-full opacity-30 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050507]/90 via-[#050507]/60 to-[#0A0713]/90" />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] mix-blend-screen" />
        {/* Subtle noise */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* ─── MOBILE HEADER (Premium Solid) ─── */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-[60] transition-all duration-300">
        <div className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'bg-transparent' 
            : 'bg-[#040b0f] border-b border-purple-500/10 shadow-lg'
        }`}>
          <div className="flex items-center">
            <img
              src={logo}
              alt="SAIO XV Entropix"
              className="h-8 w-auto object-contain"
            />
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-3 group outline-none p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <span 
              className={`text-[10px] tracking-[0.2em] uppercase hidden sm:block transition-colors duration-300 font-mono ${isMobileMenuOpen ? 'text-white' : 'text-secondary group-hover:text-white'}`}
            >
              {isMobileMenuOpen ? 'CERRAR' : 'MENÚ'}
            </span>
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-[5px] relative">
              <span className={`block h-[2px] bg-white transition-all duration-500 origin-center ${isMobileMenuOpen ? 'w-5 absolute rotate-45' : 'w-6'}`} />
              <span className={`block h-[2px] bg-white transition-all duration-500 origin-center ${isMobileMenuOpen ? 'w-5 absolute -rotate-45' : 'w-4 self-end group-hover:w-6'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ─── SIDEBAR (Desktop) / FULLSCREEN MENU (Mobile) ─── */}
      <AnimatePresence>
        {(isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`
              fixed lg:relative top-0 left-0 h-[100dvh] w-full lg:w-[280px] shrink-0 
              border-r border-white/10 z-50 flex flex-col pt-20 lg:pt-0 
              bg-[#050507] lg:bg-black/20 lg:backdrop-blur-2xl
              ${isMobileMenuOpen ? 'block' : 'hidden lg:flex'}
            `}
          >
            {/* ─── DESKTOP SIDEBAR CONTENT ─── */}
            <div className="hidden lg:flex flex-col h-full w-full">
              {/* Desktop Brand Header */}
              <div className="flex items-center gap-4 p-8 border-b border-white/5">
                <img
                  src={logo}
                  alt="SAIO XV Entropix"
                  className="h-9 w-auto object-contain"
                />
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2 scrollbar-none">
                <div className="mb-6 px-2">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-secondary/50 font-bold mb-4">Navegación</p>
                </div>

                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <NavLink key={tab.to} to={tab.to} className={navLinkClass}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </NavLink>
                  );
                })}

                {canAccessDashboard && (
                  <>
                    <div className="mt-8 mb-4 px-2 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/50 font-bold mb-4">Administración</p>
                    </div>
                    <NavLink
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-heading font-bold uppercase tracking-widest text-xs transition-all duration-300 w-full select-none bg-purple-900/20 text-purple-200 border border-purple-500/20 hover:bg-purple-800/40 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0 text-purple-400" />
                      <span>Ir al Dashboard</span>
                    </NavLink>
                  </>
                )}
              </div>

              {/* User Bottom Area */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white font-heading font-bold text-sm truncate">{user?.nombre || 'Explorador'}</p>
                    <p className="text-accent font-mono text-[10px] uppercase tracking-widest">{user?.rol || 'Asistente'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-heading font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ─── MOBILE FULLSCREEN MENU CONTENT ─── */}
            <div className="lg:hidden flex flex-col h-full w-full px-8 pb-10 overflow-y-auto">
              <div className="flex-1 flex flex-col justify-center gap-4 py-10">
                {tabs.map((tab, i) => (
                  <NavLink 
                    key={tab.to} 
                    to={tab.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `inline-block text-4xl sm:text-6xl font-heading transition-colors duration-500 uppercase leading-[1.1] tracking-tighter ${isActive ? 'text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <span className="text-xl sm:text-2xl text-purple-500 mr-4 font-sans tracking-normal align-top">0{i + 1}</span>
                    {tab.label}
                  </NavLink>
                ))}
                
                {canAccessDashboard && (
                  <NavLink 
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-block text-4xl sm:text-6xl font-heading transition-colors duration-500 uppercase leading-[1.1] tracking-tighter text-white/40 hover:text-white mt-4"
                  >
                    <span className="text-xl sm:text-2xl text-amber-500 mr-4 font-sans tracking-normal align-top">0{tabs.length + 1}</span>
                    DASHBOARD
                  </NavLink>
                )}
              </div>

              {/* Mobile Footer / Logout */}
              <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-white font-heading font-bold text-base truncate">{user?.nombre || 'Explorador'}</p>
                    <p className="text-accent font-mono text-[10px] uppercase tracking-widest">{user?.rol || 'Asistente'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-heading font-bold text-sm uppercase tracking-widest transition-colors"
                >
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 h-[100dvh] overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Top spacer for mobile header */}
        <div className="h-16 lg:hidden w-full" />
        
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 min-h-[calc(100dvh-4rem)] lg:min-h-[100dvh] flex flex-col">
          <Outlet />
          
          {/* Subtle footer */}
          <footer className="mt-auto pt-10 pb-4 text-center">
             <p className="text-[10px] font-mono text-secondary/30 uppercase tracking-widest">
               © 2026 SAIO-XV · Entropix
             </p>
          </footer>
        </div>
      </main>

    </div>
  );
}

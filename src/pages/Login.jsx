import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { ROLES } from '../constants/roles';
import { motion, AnimatePresence } from 'framer-motion';
import EntropixCanvas from '../components/Hero/EntropixCanvas';

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function Login() {
  const { user, login, isFirebaseConfigured } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener ruta previa
  const from = location.state?.from
    ? (location.state.from.pathname + (location.state.from.search || ''))
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      return setError('Por favor completa todos los campos.');
    }
    
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      
      const userRole = (user?.rol || '').toLowerCase();
      let targetPath = from;

      if (!targetPath) {
        if (userRole === ROLES.VENDEDOR) {
          targetPath = '/saio/mi-tienda';
        } else if (userRole === ROLES.ADMIN || userRole === ROLES.COORDINADOR) {
          targetPath = '/dashboard';
        } else {
          targetPath = '/pasaporte/perfil';
        }
      }

      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 300);
    } catch (err) {
      console.error(err);
      let friendlyError = 'Ocurrió un error al procesar tu solicitud.';
      if (err.code === 'auth/invalid-email') friendlyError = 'El correo electrónico no es válido.';
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') friendlyError = 'Correo electrónico o contraseña incorrectos.';
      else if (err.message) friendlyError = err.message;
      
      setError(friendlyError);
      setIsSubmitting(false);
    }
  }

  // Handle WhatsApp Support
  const handleWhatsAppSupport = (e) => {
    e.preventDefault();
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || "573000000000";
    const message = "Hola equipo SAIO olvidé mis credenciales para la experiencia de pasaporte";
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#050507] text-white overflow-hidden select-none relative items-center justify-center">
      
      {/* ─── BACKGROUND VISUALS ─── */}
      <div className="absolute inset-0 z-0">
        <EntropixCanvas className="w-full h-full opacity-60 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/80 via-transparent to-[#050507]/90 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      </div>

      {/* ─── HEADER (Absolute) ─── */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => navigate('/')}
          className="text-secondary/80 hover:text-white transition-colors duration-300 font-heading text-xs uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer group bg-black/20 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Volver al Inicio
        </button>
      </div>

      {/* ─── CENTERED FORM CARD ─── */}
      <div className="w-full max-w-lg relative z-10 px-6 py-12">
        
        {/* Branding & Title */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="text-center mb-8">
          <motion.h1 variants={fadeUp} className="text-[clamp(2.2rem,4vw,3rem)] font-heading font-black tracking-tighter leading-none mb-3">
            Experiencia <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-accent">Pasaporte</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-secondary text-sm lg:text-base tracking-wide leading-relaxed">
            Ingresa tus credenciales para acceder a la experiencia de pasaporte SAIO-XV.
          </motion.p>
        </motion.div>

        {/* Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden bg-[#0A0713]/80"
        >
          {/* Iniciar Sesión Header */}
          <div className="border-b border-white/10 pb-5 mb-8 relative z-10">
            <h2 className="text-center font-heading text-xl font-bold text-white tracking-wide">
              Iniciar Sesión
            </h2>
          </div>

          {/* Firebase Alert */}
          {!isFirebaseConfigured && (
            <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200/90 text-xs flex items-start gap-3 relative z-10">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block mb-1 text-amber-400">Firebase requiere configuración:</span>
                Falta el archivo <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">.env</code> en la raíz.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }} 
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 mb-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="astronauta@saio.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500/30 font-sans"
                  disabled={isSubmitting || !isFirebaseConfigured}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-semibold text-secondary uppercase tracking-widest block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500/30 font-sans tracking-widest"
                  disabled={isSubmitting || !isFirebaseConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-white transition-colors cursor-pointer"
                  disabled={isSubmitting || !isFirebaseConfigured}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isFirebaseConfigured}
                className="w-full bg-gradient-to-r from-purple-600 to-accent hover:opacity-95 text-white font-heading font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-purple-500/20 text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Acceder al Sistema</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Support CTA (WhatsApp) */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center relative z-10">
            <p className="text-secondary text-xs mb-3">¿Tienes problemas con tus credenciales?</p>
            <button 
              onClick={handleWhatsAppSupport}
              className="text-white hover:text-accent font-bold text-xs underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-all duration-300 cursor-pointer"
            >
              Contacta al soporte
            </button>
          </div>
          
        </motion.div>

        {/* Footer Area */}
        <div className="mt-12 text-center text-[10px] font-mono text-secondary/40 uppercase tracking-widest">
          <p>© 2026 SAIO-XV. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}

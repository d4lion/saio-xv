import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { login, isFirebaseConfigured } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener ruta previa o redirigir a /perfil por defecto
  const from = location.state?.from?.pathname || '/perfil';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones básicas
    if (!email || !password) {
      return setError('Por favor completa todos los campos.');
    }
    
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      setSuccess('Sesión iniciada con éxito. Redirigiendo...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1200);
    } catch (err) {
      console.error(err);
      // Traducir mensajes comunes de Firebase Auth
      let friendlyError = 'Ocurrió un error al procesar tu solicitud.';
      if (err.code === 'auth/invalid-email') {
        friendlyError = 'El correo electrónico no es válido.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyError = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.message) {
        friendlyError = err.message;
      }
      setError(friendlyError);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full nebula-bg flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Elementos decorativos cósmicos en segundo plano */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Botón para volver al Inicio en la esquina superior izquierda */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-secondary hover:text-white transition-colors duration-300 font-heading text-sm flex items-center gap-2 cursor-pointer z-10 hover:translate-x-[-2px] transform"
      >
        ← Volver al Inicio
      </button>

      {/* Contenedor de la Tarjeta */}
      <div className="w-full max-w-md z-10 transition-all duration-500">
        <div className="text-center mb-8">
          {/* Logo o Marca */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent mb-4 glow-purple">
            <span className="text-white font-heading font-extrabold text-xl">S</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight text-white mb-2">
            Portal <span className="gradient-text-bright">SAIO-XV</span>
          </h1>
          <p className="text-secondary text-sm">
            Ingresa al sistema de control con tus credenciales asignadas
          </p>
        </div>

        {/* Alerta de Firebase no Configurado */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-200 text-xs leading-relaxed flex items-start gap-3 glow-purple" style={{ boxShadow: '0 0 15px rgba(245,158,11,0.08)' }}>
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Firebase requiere configuración:</span>
              No has configurado tus credenciales. Crea un archivo <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">.env</code> en la raíz del proyecto usando el ejemplo de <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">.env.example</code>.
            </div>
          </div>
        )}

        {/* Tarjeta Glassmorphic */}
        <div className="glass rounded-2xl p-8 relative shadow-2xl backdrop-blur-xl">
          <div className="border-b border-muted/20 pb-4 mb-6">
            <h2 className="text-center font-heading text-lg font-bold text-white tracking-wide">
              Iniciar Sesión
            </h2>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mensaje de Error */}
            {error && (
              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mensaje de Éxito */}
            {success && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Input Correo */}
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-medium text-secondary uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="astronauta@saio.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-light/5 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-accent/30 font-sans"
                  disabled={isSubmitting || !isFirebaseConfigured}
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-medium text-secondary uppercase tracking-wider block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-primary-light/5 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-accent/30 font-sans"
                  disabled={isSubmitting || !isFirebaseConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-white cursor-pointer"
                  disabled={isSubmitting || !isFirebaseConfigured}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white font-heading font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-accent/20 text-sm"
              disabled={isSubmitting || !isFirebaseConfigured}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Acceder al Sistema</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Enlaces inferiores */}
          <div className="text-center mt-6">
            <a href="#" className="text-xs text-secondary hover:text-accent-light transition-colors duration-200">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

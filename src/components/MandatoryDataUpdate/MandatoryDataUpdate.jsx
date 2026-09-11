import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertCircle, CheckCircle2, User, FileText, Mail, ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MandatoryDataUpdate({ user }) {
  const { logout } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [cedula, setCedula] = useState(user?.cedula || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReportIssue = (e) => {
    e.preventDefault();
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || "573000000000";
    const message = `Hola equipo SAIO, tengo una novedad con mis datos registrados (Cédula: ${user?.cedula || 'No registrada'}). Solicito corrección.`;
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!nombre.trim() || !cedula.trim() || !telefono.trim()) {
      setError('Por favor, completa todos los campos de datos.');
      return;
    }

    if (nombre.trim().length < 4) {
      setError('El nombre debe tener al menos 4 caracteres.');
      return;
    }

    if (!aceptaPoliticas) {
      setError('Debes aceptar las Políticas de Privacidad para continuar.');
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        telefono: telefono.trim(),
        dataVerified: true,
        acceptedPrivacyPolicy: true,
        verifiedAt: new Date().toISOString()
      });
      // AuthContext listeners should automatically pick up the change 
      // and ProtectedRoute will stop rendering this component.
    } catch (err) {
      console.error('Error al actualizar datos:', err);
      setError('Ocurrió un error al guardar tus datos. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#040b0f] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background visuals */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass p-8 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl backdrop-blur-xl relative z-10 w-full max-w-lg bg-[#0A0713]/90"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(156,58,237,0.15)]">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tighter text-white mb-2">
            Verificación de Datos
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            Antes de continuar, necesitamos que verifiques que tus datos sean correctos y aceptes nuestras políticas de privacidad. Esto solo te tomará un momento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
              >
                <div className="p-3 mb-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* Correo (Solo lectura) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-heading font-semibold text-secondary uppercase tracking-widest block">
                  Correo Electrónico (Solo Lectura)
                </label>
                <button
                  type="button"
                  onClick={handleReportIssue}
                  className="text-[10px] text-accent hover:text-purple-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  ¿Datos incorrectos? Reportar
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/40" />
                <input
                  type="email"
                  value={user?.correo || user?.email || ''}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-secondary/60 cursor-not-allowed outline-none font-sans"
                />
              </div>
            </div>

            {/* Cédula */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-heading font-semibold text-secondary uppercase tracking-widest block">
                Documento de Identidad
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/40" />
                <input
                  type="text"
                  value={cedula}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-secondary/60 cursor-not-allowed outline-none font-sans tracking-widest"
                />
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-heading font-semibold text-secondary uppercase tracking-widest block">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500/30 font-sans"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-heading font-semibold text-secondary uppercase tracking-widest block">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 3001234567"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500/30 font-sans tracking-widest"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={aceptaPoliticas}
                  onChange={(e) => setAceptaPoliticas(e.target.checked)}
                  className="peer sr-only"
                  disabled={loading}
                />
                <div className="w-5 h-5 rounded border border-secondary/50 bg-white/5 peer-checked:bg-purple-600 peer-checked:border-purple-500 transition-all duration-300 flex items-center justify-center group-hover:border-purple-500/50">
                  <CheckCircle2 className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${aceptaPoliticas ? 'scale-100' : 'scale-0'}`} />
                </div>
              </div>
              <span className="text-sm text-secondary/90 leading-snug group-hover:text-white transition-colors">
                He leído y acepto las{' '}
                <a 
                  href="/privacidad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-purple-500/30 hover:decoration-purple-400 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  Políticas de Privacidad y Tratamiento de Datos Personales
                </a>.
              </span>
            </label>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || !aceptaPoliticas}
              className="w-full bg-gradient-to-r from-purple-600 to-accent hover:opacity-95 text-white font-heading font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-purple-500/20 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirmar y Continuar</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={logout}
              disabled={loading}
              className="w-full text-center text-xs font-semibold text-secondary hover:text-white transition-colors py-2"
            >
              Cerrar sesión por ahora
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

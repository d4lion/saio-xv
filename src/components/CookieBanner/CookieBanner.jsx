import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const COOKIE_CONSENT_KEY = 'saio_cookie_consent'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay for smooth entrance after page load
      const timer = setTimeout(() => setIsVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setIsVisible(false)
  }

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div
            className="relative overflow-hidden bg-[#090d16]/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(156,58,237,0.25)] select-none"
            style={{
              background: `
                radial-gradient(ellipse 90% 80% at 100% 0%, rgba(156,58,237,0.15) 0%, transparent 60%),
                rgba(9, 13, 22, 0.95)
              `,
            }}
          >
            {/* Ambient top light */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

            {/* Header info */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Cookie size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4
                    className="text-white font-bold text-base font-heading leading-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Valoramos tu privacidad
                  </h4>
                  <span className="text-[10px] text-purple-300/70 uppercase tracking-widest font-mono" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Gestión de Cookies
                  </span>
                </div>
              </div>

              {/* Close X */}
              <button
                onClick={handleEssentialOnly}
                aria-label="Cerrar aviso de cookies"
                className="text-white/40 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content description */}
            <p className="text-secondary text-xs leading-relaxed mb-5 font-sans">
              Utilizamos cookies propias y de terceros para optimizar tu experiencia de navegación, personalizar contenido y analizar el tráfico en SAIO XV Entropix.{' '}
              <Link to="/privacidad" className="text-purple-400 hover:text-purple-300 underline font-medium">
                Política de privacidad
              </Link>
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                onClick={handleAcceptAll}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(156,58,237,0.4)] hover:shadow-[0_0_30px_rgba(156,58,237,0.6)] hover:scale-[1.02] transition-all cursor-pointer"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <ShieldCheck size={14} />
                <span>Aceptar todas</span>
              </button>

              <button
                onClick={handleEssentialOnly}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full glass border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-xs font-medium tracking-wider uppercase transition-all cursor-pointer"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Solo necesarias
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

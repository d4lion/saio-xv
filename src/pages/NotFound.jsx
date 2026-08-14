import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Users, LogIn, ArrowLeft, Compass } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'

export default function NotFound() {
  return (
    <main className="relative bg-[#040b0f] min-h-screen flex flex-col justify-between overflow-hidden">
      <Navbar />

      {/* Hero / Error content container */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 z-10">
        
        {/* Background cosmic glow effect */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 75% 60% at 50% 40%, rgba(156,58,237,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 20% 70%, rgba(76,41,182,0.2) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 80% 30%, rgba(48,34,127,0.25) 0%, transparent 50%)
            `,
          }}
        />

        {/* Twinkling star particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle pointer-events-none z-0"
            style={{
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              left: `${(i * 19 + 7) % 100}%`,
              top: `${(i * 29 + 11) % 100}%`,
              background: i % 2 === 0 ? '#9c3aed' : '#c3abdc',
              animationDelay: `${(i * 0.25) % 3.5}s`,
              animationDuration: `${2.5 + (i % 3)}s`,
              opacity: 0.5,
            }}
          />
        ))}

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Floating Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 mb-6"
          >
            <Compass size={14} className="text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs text-secondary-light tracking-[0.2em] uppercase font-medium">
              Error 404 · Ruta no encontrada
            </span>
          </motion.div>

          {/* Large Animated 404 Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative select-none my-2"
          >
            <h1
              className="text-[clamp(6rem,18vw,13rem)] font-black font-heading leading-none tracking-tighter"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, #ffffff 0%, #9c3aed 50%, #4c29b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 45px rgba(156,58,237,0.4))',
              }}
            >
              404
            </h1>

            {/* Glowing ring under 404 */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full pointer-events-none -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(156,58,237,0.25) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
            />
          </motion.div>

          {/* Subtitle & Explanation */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold text-white font-heading mb-4 leading-snug"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Pestaña fuera de este <span className="gradient-text">universo</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-secondary text-[clamp(0.95rem,1.5vw,1.15rem)] max-w-xl mb-10 leading-relaxed"
          >
            La página a la que intentas acceder no existe, se ha movido o aún no está disponible en la plataforma de SAIO XV Entropix.
          </motion.p>

          {/* Quick Action Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 w-full"
          >
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-semibold text-sm tracking-wide shadow-[0_0_30px_rgba(156,58,237,0.4)] hover:shadow-[0_0_45px_rgba(156,58,237,0.7)] transition-all duration-300 hover:scale-105"
            >
              <Home size={16} />
              <span>Volver al Inicio</span>
            </Link>

            <Link
              to="/panelistas"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full glass border border-purple-400/30 text-secondary-light font-medium text-sm tracking-wide hover:border-purple-400/60 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <Users size={16} />
              <span>Ver Panelistas</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full glass border border-purple-500/20 text-secondary hover:text-white font-medium text-sm tracking-wide hover:border-purple-400/40 transition-all duration-300 hover:scale-105"
            >
              <LogIn size={16} />
              <span>Iniciar Sesión</span>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Decorative Separator Line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />

      <Footer />
    </main>
  )
}

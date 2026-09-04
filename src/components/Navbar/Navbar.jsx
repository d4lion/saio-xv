import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext'
import { navLinks } from './navLinksData'


// ─── Animations ─────────────────────────────────────────────────────────
const menuVariants = {
  closed: {
    y: '-100%',
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
  },
  open: {
    y: 0,
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
  }
}

const staggerContainer = {
  closed: {},
  open: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
}

const linkItem = {
  closed: { y: '120%', rotation: 5, opacity: 0 },
  open: { 
    y: 0, 
    rotation: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

const fadeUp = {
  closed: { opacity: 0, y: 20 },
  open: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 }
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Block scroll when menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [menuOpen])

  return (
    <>
      {/* ─── Main Top Navbar ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 outline-none select-none ${
          scrolled && !menuOpen
            ? 'bg-[#040b0f]/80 backdrop-blur-md border-b border-purple-500/10 py-4 shadow-xl'
            : 'bg-transparent py-6 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group outline-none z-50 relative" onClick={() => setMenuOpen(false)}>
            <img
              src={logo}
              alt="SAIO XV Entropix"
              className="h-10 md:h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
            />
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center gap-6 z-50 relative">
            
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to={user ? "/perfil" : "/login"}
                className={`text-sm font-semibold tracking-wide transition-colors duration-300 relative group outline-none ${menuOpen ? 'text-white' : 'text-secondary hover:text-white'}`}
              >
                {user ? "MI PERFIL" : "ACCESO PORTAL"}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-500 to-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to="/boletas"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300 outline-none ${
                  menuOpen 
                  ? 'bg-white text-black hover:bg-purple-100'
                  : 'bg-gradient-to-r from-primary-light to-accent text-white hover:shadow-[0_0_20px_rgba(156,58,237,0.5)]'
                }`}
              >
                COMPRAR BOLETA
              </Link>
            </div>

            {/* Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 group outline-none"
              aria-label="Toggle menu"
            >
              <span 
                className={`text-[11px] tracking-[0.3em] uppercase hidden sm:block transition-colors duration-300 ${menuOpen ? 'text-white' : 'text-white/60 group-hover:text-white'}`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {menuOpen ? 'Close' : 'Menu'}
              </span>
              <div className="w-8 h-8 flex flex-col justify-center items-center gap-[6px] relative">
                <span className={`block h-[2px] bg-white transition-all duration-500 origin-center ${menuOpen ? 'w-6 absolute rotate-45' : 'w-8'}`} />
                <span className={`block h-[2px] bg-white transition-all duration-500 origin-center ${menuOpen ? 'w-6 absolute -rotate-45' : 'w-6 self-end group-hover:w-8'}`} />
              </div>
            </button>
            
          </div>
        </div>
      </motion.nav>

      {/* ─── Full-Screen Immersive Menu Overlay ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-30 bg-[#050507] flex flex-col px-6 sm:px-14 md:px-24 overflow-y-auto overflow-x-hidden"
          >
            {/* Deep space radial glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none fixed" />

            <div className="max-w-7xl mx-auto w-full flex flex-col min-h-[100dvh] justify-center pt-32 pb-24 relative z-10">
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 lg:gap-0 h-full">
                
                {/* ── Main Navigation Links ── */}
                <motion.ul 
                  variants={staggerContainer}
                  initial="closed"
                  animate="open"
                  className="flex flex-col gap-2 sm:gap-4 flex-1 justify-center"
                >
                  {navLinks.map((link, i) => (
                    <div key={link.label} className="overflow-hidden">
                      <motion.li variants={linkItem}>
                        {link.isRoute ? (
                          <Link
                            to={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="inline-block text-5xl sm:text-7xl md:text-8xl lg:text-[7vw] font-heading text-white/40 hover:text-white transition-colors duration-500 uppercase leading-[0.9] tracking-tighter"
                          >
                            <span className="text-xl sm:text-2xl text-purple-500 mr-4 font-sans tracking-normal align-top">0{i + 1}</span>
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="inline-block text-5xl sm:text-7xl md:text-8xl lg:text-[7vw] font-heading text-white/40 hover:text-white transition-colors duration-500 uppercase leading-[0.9] tracking-tighter hover:skew-x-2"
                          >
                            <span className="text-xl sm:text-2xl text-purple-500 mr-4 font-sans tracking-normal align-top">0{i + 1}</span>
                            {link.label}
                          </a>
                        )}
                      </motion.li>
                    </div>
                  ))}
                </motion.ul>

                {/* ── Meta info / Secondary Links ── */}
                <motion.div 
                  variants={fadeUp}
                  className="flex flex-col gap-8 lg:text-right"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  <div className="md:hidden flex flex-col gap-4 mb-4">
                     <Link
                        to={user ? "/perfil" : "/login"}
                        onClick={() => setMenuOpen(false)}
                        className="text-white text-sm tracking-[0.2em] uppercase border border-white/20 px-6 py-3 rounded-full text-center hover:bg-white hover:text-black transition-colors"
                      >
                        {user ? "Mi Perfil" : "Acceso Portal"}
                      </Link>
                      <Link
                        to="/boletas"
                        onClick={() => setMenuOpen(false)}
                        className="text-black bg-white text-sm tracking-[0.2em] uppercase px-6 py-3 rounded-full text-center hover:bg-purple-100 transition-colors"
                      >
                        Comprar Boleta
                      </Link>
                  </div>

                  <div>
                    <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-2">Evento</p>
                    <p className="text-white text-sm tracking-wide">15 y 16 Octubre</p>
                    <p className="text-white text-sm tracking-wide">UNAL, Medellín</p>
                  </div>
                  
                  <div>
                    <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-2">Contacto</p>
                    <a href="mailto:hello@adamind.cloud" className="text-white text-sm tracking-wide hover:text-purple-400 transition-colors">
                      hello@adamind.cloud
                    </a>
                  </div>

                  <div>
                    <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-2">Síguenos</p>
                    <div className="flex flex-wrap items-center lg:justify-end gap-4">
                      <a href="https://www.instagram.com/saio.med/" target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-purple-400 transition-colors">Instagram</a>
                      <a href="https://www.linkedin.com/company/aneiap" target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-purple-400 transition-colors">LinkedIn</a>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

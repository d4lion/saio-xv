import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const navLinks = [
  { label: 'Inicio', href: '/#hero' },
  { label: 'Agenda', href: '/#timeline' },
  { label: 'Talleres', href: '/#capabilities' },
  { label: 'Ponentes', href: '/panelistas', isRoute: true },
  { label: 'Boletas', href: '/#tickets' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass border-b border-purple-500/20 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="SAIO XV Entropix"
              className="h-10 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
            />
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.isRoute ? (
                  <Link
                    to={link.href}
                    className="text-secondary hover:text-white text-sm tracking-wide transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-accent group-hover:w-full transition-all duration-300" />
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-secondary hover:text-white text-sm tracking-wide transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-accent group-hover:w-full transition-all duration-300" />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            to="/#tickets"
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-light to-accent text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(156,58,237,0.5)] hover:scale-105 transition-all duration-300"
          >
            Comprar boleta
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-secondary hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-4 right-4 z-40 glass rounded-2xl p-6 border border-purple-500/20"
          >
            <ul className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-secondary hover:text-white text-base tracking-wide transition-colors duration-300 block"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-secondary hover:text-white text-base tracking-wide transition-colors duration-300 block"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <a
                  href="/#tickets"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-light to-accent text-sm text-white font-semibold"
                >
                  Comprar boleta
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

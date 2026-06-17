import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import SpaceScene from '../SpaceScene/SpaceScene'
import SponsorsCarousel from '../SponsorsCarousel/SponsorsCarousel'
import logo from '../../assets/logo.png'

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }
  }),
}

export default function Hero() {
  const scrollRef = useRef(null)

  const scrollDown = () => {
    document.getElementById('new-data')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      ref={scrollRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* === VIDEO LAYER === */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* === DARK OVERLAY === */}
      {/* Oscurecido de 65% a 85% para mayor contraste */}
      <div className="absolute inset-0 z-[1] bg-[#040b0f]/85" />

      {/* === PURPLE NEBULA === */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 10%, rgba(76,41,182,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 50%, rgba(156,58,237,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 10% 70%, rgba(48,34,127,0.25) 0%, transparent 55%)
          `
        }}
      />

      {/* === SPACE SCENE (planets, stars) === */}
      <div className="absolute inset-0 z-[3]">
        <SpaceScene />
      </div>

      {/* === HERO CONTENT === */}
      <div className="relative z-[4] flex flex-col flex-1 justify-center items-center text-center px-6 pt-28 pb-8">

        {/* Badge */}
        <motion.div
          variants={fadeUp} custom={0} initial="hidden" animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-400/30 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-secondary-light tracking-[0.2em] uppercase">Evento Estudiantil · ANIAP</span>
        </motion.div>

        {/* Logo image replacing text title, with added glow */}
        <motion.div
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          className="flex justify-center mb-8 relative"
        >
          {/* Backlight glow for logo */}
          <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
          <img
            src={logo}
            alt="SAIO XV Entropix"
            className="w-auto object-contain relative z-10"
            style={{ 
              maxHeight: 'clamp(220px, 22vw, 320px)',
              filter: 'drop-shadow(0 0 25px rgba(156,58,237,0.8)) drop-shadow(0 0 60px rgba(76,41,182,0.6))'
            }}
          />
        </motion.div>

        {/* Divider line */}
        <motion.div
          variants={fadeUp} custom={3} initial="hidden" animate="visible"
          className="w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent my-8"
          style={{ boxShadow: '0 0 15px rgba(156,58,237,1)' }}
        />

        {/* Tagline with glow-text added */}
        <motion.p
          variants={fadeUp} custom={4} initial="hidden" animate="visible"
          className="text-white text-[clamp(1.2rem,3vw,1.6rem)] font-medium tracking-wide max-w-xl mb-4 glow-text"
        >
          Aprende, conecta y crece con la industria.
        </motion.p>

        {/* Supporting text */}
        <motion.p
          variants={fadeUp} custom={5} initial="hidden" animate="visible"
          className="text-secondary text-[clamp(0.85rem,1.5vw,1rem)] max-w-2xl leading-relaxed mb-10"
        >
          Un evento estudiantil propuesto por ANIAP donde se presentan talleres, panelistas y sponsors,
          todos en busca de aprender y conectar con la industria.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp} custom={6} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <a
            href="#tickets"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-semibold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(156,58,237,0.5)] transition-all duration-300 hover:scale-105"
          >
            Comprar boleta
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#capabilities"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full glass border border-purple-400/30 text-secondary-light font-medium text-sm tracking-wide hover:border-purple-400/60 hover:text-white transition-all duration-300"
          >
            Ver talleres
          </a>
        </motion.div>

        {/* Sponsors Carousel — inside the hero */}
        <motion.div
          variants={fadeUp} custom={8} initial="hidden" animate="visible"
          className="w-full max-w-4xl mt-16"
        >
          <SponsorsCarousel />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={scrollDown}
        className="relative z-[4] flex flex-col items-center gap-2 pb-8 mx-auto text-muted hover:text-secondary transition-colors"
        aria-label="Scroll down"
      >
        <span className="text-[10px] tracking-widest uppercase">Descubrir</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  )
}

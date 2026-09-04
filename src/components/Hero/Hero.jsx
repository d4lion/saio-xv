import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import EntropixCanvas from './EntropixCanvas'
import EntropixObject from './EntropixObject'
import Countdown from '../Countdown/Countdown'
import { FaLinkedinIn, FaInstagram } from 'react-icons/fa'

// ─── Animations ──────────────────────────────────────────────────
const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

const fadeLine = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }
  }
}

// ─── Component ───────────────────────────────────────────────────
export default function Hero() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen min-h-dvh flex flex-col overflow-hidden select-none"
      style={{ background: '#050507' }}
    >
      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── Deep-space neo-purple atmosphere ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 65% 30%, rgba(156,58,237,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 60% 70% at 25% 65%, rgba(76,41,182,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 75%, rgba(45,16,74,0.2) 0%, transparent 55%),
            radial-gradient(ellipse 90% 50% at 50% 0%, rgba(48,34,127,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 10% 20%, rgba(109,40,217,0.08) 0%, transparent 50%),
            linear-gradient(180deg, #050507 0%, #0a0618 25%, #0d0824 50%, #080514 75%, #050507 100%)
          `
        }}
      />

      {/* ── Canvas particle system ── */}
      <div className="absolute inset-0 z-[3]">
        {mounted && <EntropixCanvas />}
      </div>

      {/* ── Left vertical micro-label (desktop only) ── */}
      <div className="hidden xl:flex absolute left-6 top-1/2 -translate-y-1/2 z-[15]">
        <span
          className="text-[10px] tracking-[0.35em] text-white/15 uppercase -rotate-90 whitespace-nowrap"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          001 — ENTROPIX
        </span>
      </div>

      {/* ── Left vertical Socials (desktop only) ── */}
      <div className="hidden xl:flex absolute left-24 bottom-24 z-[15] flex-col gap-6 items-center">
        <a href="https://www.instagram.com/saio.med/" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white hover:scale-110 transition-all duration-300">
          <FaInstagram size={20} />
        </a>
        <a href="https://www.linkedin.com/company/aneiap" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white hover:scale-110 transition-all duration-300">
          <FaLinkedinIn size={20} />
        </a>
        <div className="w-px h-16 bg-gradient-to-t from-transparent to-white/20 mt-2" />
      </div>

      {/* ── Right vertical micro-label (desktop only) ── */}
      <div className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 z-[15]">
        <span
          className="text-[10px] tracking-[0.35em] text-white/15 uppercase rotate-90 whitespace-nowrap"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          COMPLEX SYSTEMS
        </span>
      </div>

      {/* ── 3D Object — right side (desktop only) ── */}
      <div className="hidden lg:block absolute z-[5]" style={{ top: '2%', right: '5%', width: '55%', height: '70%' }}>
        {mounted && <EntropixObject />}
      </div>

      {/* ════════════════════════════════════════════════════════════════
           MAIN CONTENT
         ════════════════════════════════════════════════════════════════ */}
      <div className="relative z-[10] flex-1 flex flex-col justify-center max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-14 pt-12 sm:pt-24 lg:pt-24 pb-16 sm:pb-12 lg:pb-10 w-full">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5 sm:gap-6 lg:gap-8"
        >
          {/* ── Eyebrow ── */}
          <motion.div variants={fadeUp} className="flex items-center justify-start gap-3 sm:gap-4">
            <div className="w-5 sm:w-8 h-px bg-white/20" />
            <span
              className="text-[10px] sm:text-[11px] lg:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] text-white/50 uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              SAIO XV · ENTROPIX 2026
            </span>
            <div className="w-5 sm:w-0 h-px bg-white/20 lg:hidden" />
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            variants={fadeUp}
            className="text-white font-heading leading-[0.85] sm:leading-[0.92] tracking-tighter sm:tracking-[-0.03em] max-w-5xl text-left w-full"
            style={{
              fontSize: 'clamp(2.5rem, 14vw, 6.5rem)',
              fontWeight: 800,
            }}
          >
            DECISIONES
            <br />
            INTELIGENTES
            <br />
            EN ENTORNOS
            <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #e2e0ff 0%, #9c3aed 50%, #6d28d9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              COMPLEJOS
            </span>
          </motion.h1>

          {/* ── Supporting copy + CTAs ── */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6 lg:gap-12">
            
            {/* Left: copy */}
            <motion.div variants={fadeUp} className="max-w-md w-full">
              <p className="text-white/60 text-[15px] sm:text-base lg:text-[14px] leading-relaxed font-sans text-left">
                Un encuentro donde estudiantes, empresas y líderes se conectan
                para entender, cuestionar y transformar la forma en que tomamos
                decisiones.
              </p>
            </motion.div>

            {/* Right: CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 lg:gap-6 w-full sm:w-auto mt-2 sm:mt-0">
              <a
                href="#tickets"
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-6 py-3.5 sm:py-3 bg-white text-[#050507] text-[14px] sm:text-[13px] font-bold tracking-wide uppercase rounded-none hover:bg-purple-200 transition-colors duration-300 w-full sm:w-auto text-center"
              >
                <span>COMPRAR BOLETA</span>
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">↗</span>
              </a>
              
              <a
                href="#features"
                className="text-white/60 text-[14px] sm:text-[13px] tracking-wide uppercase hover:text-white transition-colors duration-300 relative group py-3 sm:py-0"
              >
                <span>EXPLORAR EL EVENTO</span>
                <span className="absolute -bottom-1 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-0 h-px bg-white/60 group-hover:w-full transition-all duration-300" />
              </a>
            </motion.div>
          </div>

          {/* ── Thin editorial line ── */}
          <motion.div
            variants={fadeLine}
            className="w-full h-px origin-left"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(156,58,237,0.15), transparent 80%)',
            }}
          />

          {/* ── Bottom strip: Countdown + Event info ── */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6"
          >
            {/* Countdown */}
            <div>
              <Countdown targetDate="2026-10-15T08:00:00" />
            </div>

            {/* Event meta */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
              <span
                className="text-[10px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-white/40 uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                MEDELLÍN · COLOMBIA
              </span>
              <span className="text-white/20 sm:hidden">·</span>
              <span
                className="text-[10px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-white/30 uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                15—16 OCTUBRE 2026
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-[15] flex-col items-center gap-2"
      >
        <span
          className="text-[9px] tracking-[0.4em] text-white/20 uppercase"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          SCROLL
        </span>
        <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  )
}

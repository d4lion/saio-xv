import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import logo from '../assets/logo.png'
import SEO from '../components/SEO/SEO'

/* ─── Data ─────────────────────────────────────────── */
import { adminService } from '../services/adminService'

/* ─── Data ─────────────────────────────────────────── */
import { featured, speakers, stats } from '../constants/panelistas/data'

/* ─── Brand icons (lucide-react no incluye brand icons) ─── */
import { IconLinkedin, IconTwitterX } from '../components/utils/BrandIcons'

/* ─── Helpers ───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const isRealUrl = (url) => Boolean(url && typeof url === 'string' && url.trim() !== '' && url.trim() !== '#');

/* ─── Avatar / Photo component ─────────────────────── */
function SpeakerPhoto({ photo, initials, color, size = 'lg' }) {
  const isLg = size === 'lg'
  const dim = isLg ? 'w-28 h-28 text-3xl' : 'w-20 h-20 text-xl'

  if (photo) {
    return (
      <div
        className={`${dim} rounded-full overflow-hidden flex-shrink-0 relative`}
        style={{ border: `2px solid ${color}88`, boxShadow: `0 0 30px ${color}44` }}
      >
        <img src={photo} alt="" className="w-full h-full object-cover" />
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${color}55`, animation: 'pulse-ring 3s ease-out infinite' }}
        />
      </div>
    )
  }

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-black font-heading relative flex-shrink-0`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}66, ${color}22)`,
        border: `2px solid ${color}88`,
        boxShadow: `0 0 30px ${color}44`,
        color: '#ffffff',
      }}
    >
      {initials}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${color}55`, animation: 'pulse-ring 3s ease-out infinite' }}
      />
    </div>
  )
}

// Keep Avatar as alias for backward compat
function Avatar({ initials, color, size = 'lg' }) {
  return <SpeakerPhoto initials={initials} color={color} size={size} photo={null} />
}

function TopicBadge({ label, color }) {
  return (
    <span
      className="text-[10px] tracking-widest uppercase px-3 py-1 rounded-full font-medium"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}44`,
        color: color,
      }}
    >
      {label}
    </span>
  )
}

/* ─── Expert Detail Modal (Awwwards Style Split Layout) ───────────────────── */
function ExpertDetailModal({ speaker, onClose }) {
  if (!speaker) return null;
  const color = speaker.color || '#9c3aed';
  const topics = Array.isArray(speaker.topics) ? speaker.topics : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-[#090e15] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-auto"
          style={{
            boxShadow: `0 0 60px ${color}33`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Split Layout: Left side photo/avatar, Right side details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pt-2">
            
            {/* Left Column: Circular/Framed Image */}
            <div className="shrink-0 flex flex-col items-center">
              <div 
                className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden relative border-2 flex items-center justify-center bg-[#040b0f] shadow-xl"
                style={{
                  borderColor: `${color}66`,
                  boxShadow: `0 0 35px ${color}40`,
                }}
              >
                {speaker.photo ? (
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl font-black text-white/20 font-heading" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {speaker.initials}
                  </span>
                )}
              </div>

            </div>

            {/* Right Column: Information & Biography */}
            <div className="flex-1 w-full text-center sm:text-left">
              <h2
                className="text-2xl sm:text-4xl font-black text-white font-heading leading-tight mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {speaker.name}
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-5">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/80 font-mono" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {speaker.role}
                </span>
                <span className="w-1.5 h-1.5 rounded-full hidden sm:inline-block" style={{ backgroundColor: color }} />
                <span className="text-xs sm:text-sm font-bold text-white/90">
                  @ {speaker.company}
                </span>
              </div>

              {/* Bio full text */}
              <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5">
                <h4 className="text-[11px] uppercase tracking-widest text-purple-400 font-mono mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Biografía Completa
                </h4>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-line max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {speaker.bio || 'Sin biografía disponible.'}
                </p>
              </div>

              {/* Topics */}
              {topics.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[11px] uppercase tracking-widest text-white/40 font-mono mb-2.5" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Especialidades & Temas
                  </h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {topics.map(t => (
                      <span
                        key={t}
                        className="text-[11px] tracking-wider uppercase px-3 py-1 rounded-full font-medium"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}44`,
                          color: color,
                          fontFamily: "'Space Mono', monospace",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social links & Close button */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {isRealUrl(speaker.social?.linkedin) && (
                    <a
                      href={speaker.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 text-xs font-medium text-white hover:bg-[#9c3aed] hover:border-purple-400 hover:shadow-[0_0_15px_rgba(156,58,237,0.5)] transition-all"
                    >
                      <IconLinkedin size={14} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {isRealUrl(speaker.social?.twitter) && (
                    <a
                      href={speaker.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 text-xs font-medium text-white hover:bg-[#9c3aed] hover:border-purple-400 hover:shadow-[0_0_15px_rgba(156,58,237,0.5)] transition-all"
                    >
                      <IconTwitterX size={14} />
                      <span>Twitter / X</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer ml-auto"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Bento Featured Expert Card (Awwwards Style) ───────────────────── */
function BentoCard({ speaker, variant = 'primary', index = 0, onSelect }) {
  const color = speaker.color || '#9c3aed';
  const topics = Array.isArray(speaker.topics) ? speaker.topics : [];
  const isPrimary = variant === 'primary';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
      onClick={() => onSelect && onSelect(speaker)}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-[#070b10] border border-white/5 ${isPrimary ? 'min-h-[500px] lg:h-auto' : 'min-h-[350px] lg:h-auto'}`}
    >
      {/* Image Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {speaker.photo ? (
          <img 
            src={speaker.photo} 
            alt={speaker.name} 
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-[1.5s] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121820] to-[#040b0f]">
             <span className="text-[12rem] font-black text-white/5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
               {speaker.initials}
             </span>
          </div>
        )}
      </div>

      {/* Gradients */}
      {/* Bottom gradient — text readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: isPrimary
            ? `linear-gradient(to top, rgba(4,11,15, 0.97) 0%, rgba(4,11,15, 0.55) 40%, transparent 70%)`
            : `linear-gradient(to top, rgba(4,11,15, 0.97) 0%, rgba(4,11,15, 0.65) 50%, transparent 80%)`
        }}
      />
      {/* Top gradient — badge and social icons readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(to bottom, rgba(4,11,15, 0.75) 0%, rgba(4,11,15, 0.3) 25%, transparent 55%)`
        }}
      />
      {/* Hover color tint */}
      <div
        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-25 transition-opacity duration-1000"
        style={{
          background: `linear-gradient(to top, ${color} 0%, transparent 60%)`
        }}
      />

      {/* Content */}
      <div className={`absolute inset-0 z-20 flex flex-col justify-between ${isPrimary ? 'p-8 md:p-10 lg:p-12' : 'p-6 md:p-8'}`}>
        
        {/* Top bar */}
        <div className="flex items-center justify-between w-full">
          <div
            className="text-[10px] tracking-[0.3em] uppercase px-4 py-1.5 rounded-full font-bold backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', border: `1px solid rgba(255,255,255,0.1)`, fontFamily: "'Space Mono', monospace" }}
          >
            Keynote Experto
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {isRealUrl(speaker.social?.linkedin) && (
              <a
                href={speaker.social.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:bg-[#9c3aed] hover:border-purple-400 text-white hover:shadow-[0_0_15px_rgba(156,58,237,0.6)]"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)` }}
              >
                <IconLinkedin size={16} />
              </a>
            )}
            {isRealUrl(speaker.social?.twitter) && (
              <a
                href={speaker.social.twitter} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:bg-[#9c3aed] hover:border-purple-400 text-white hover:shadow-[0_0_15px_rgba(156,58,237,0.6)]"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)` }}
              >
                <IconTwitterX size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Text Block */}
        <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-[0.25,1,0.5,1]">
          <h3
            className={`${isPrimary ? 'text-[clamp(2.5rem,5vw,4.5rem)]' : 'text-[clamp(1.8rem,3vw,2.5rem)]'} font-black text-white leading-[0.9] font-heading tracking-tight mb-4`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {speaker.name}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="text-white/80 text-sm md:text-base uppercase tracking-widest font-mono" style={{ fontFamily: "'Space Mono', monospace" }}>
              {speaker.role}
            </p>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <p className="text-white/90 text-sm md:text-base font-bold">
              {speaker.company}
            </p>
          </div>

          <div className={`overflow-hidden transition-all duration-700 ease-[0.25,1,0.5,1] ${isPrimary ? 'max-h-0 group-hover:max-h-40 opacity-0 group-hover:opacity-100' : 'max-h-0 group-hover:max-h-36 opacity-0 group-hover:opacity-100'}`}>
            {speaker.bio && (
              <div>
                <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-2 font-sans mt-2">
                  {speaker.bio}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect && onSelect(speaker); }}
                  className="mt-2 text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Leer más <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
          
          {topics.length > 0 && (
             <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
               {topics.slice(0, isPrimary ? 4 : 3).map(t => (
                 <span key={t} className="text-[10px] tracking-widest uppercase px-3 py-1 rounded-full text-white" style={{ border: `1px solid rgba(255,255,255,0.15)`, fontFamily: "'Space Mono', monospace" }}>
                   {t}
                 </span>
               ))}
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Responsive hook ────────────────────────────── */
function useWindowWidth() {
  const [width, setWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1280);
  const handleResize = useCallback(() => setWidth(window.innerWidth), []);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  return width;
}

/* ─── Bento Layout (7/5 split on lg, stacked on mobile) ─ */
function BentoLayout({ primary, rest, onSelect }) {
  const width = useWindowWidth();
  const isLg = width >= 1024;

  if (isLg) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.25rem', alignItems: 'stretch' }}>
        <BentoCard speaker={primary} variant="primary" index={0} onSelect={onSelect} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {rest.map((sp, i) => (
            <BentoCard key={sp.id || sp.name} speaker={sp} variant="secondary" index={i + 1} onSelect={onSelect} />
          ))}
        </div>
      </div>
    );
  }

  // Mobile/tablet: stacked
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <BentoCard speaker={primary} variant="primary" index={0} onSelect={onSelect} />
      {rest.map((sp, i) => (
        <BentoCard key={sp.id || sp.name} speaker={sp} variant="secondary" index={i + 1} onSelect={onSelect} />
      ))}
    </div>
  );
}

/* ─── Featured Speakers Bento Grid ──────────────────── */
function FeaturedSpeakersBento({ speakers, onSelect }) {
  if (!speakers || speakers.length === 0) return null;

  const [primary, ...rest] = speakers;
  const hasSideSpeakers = rest.length > 0;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 80% at 15% 50%, rgba(156,58,237,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 85% 40%, rgba(76,41,182,0.10) 0%, transparent 50%)
          `,
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-3 font-medium" style={{ fontFamily: "'Space Mono', monospace" }}>
            Keynote Principal
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-black font-heading text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Expertos <span className="gradient-text">destacados</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        {hasSideSpeakers ? (
          <BentoLayout primary={primary} rest={rest} onSelect={onSelect} />
        ) : (
          // Single featured speaker: full-width centred
          <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <BentoCard speaker={primary} variant="primary" index={0} onSelect={onSelect} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Speaker Card (Awwwards Style) ───────────── */
function SpeakerCard({ speaker, index = 0, onSelect }) {
  const color = speaker.color || '#9c3aed';
  const topics = Array.isArray(speaker.topics) ? speaker.topics : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay: (index % 6) * 0.1, ease: [0.25, 1, 0.5, 1] }}
      onClick={() => onSelect && onSelect(speaker)}
      className="group relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden cursor-pointer bg-[#0a0f16]"
      style={{
        border: `1px solid rgba(255, 255, 255, 0.05)`,
      }}
    >
      {/* Background Image / Placeholder */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {speaker.photo ? (
          <img 
            src={speaker.photo} 
            alt={speaker.name} 
            className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,1,0.5,1] group-hover:scale-110 filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121820] to-[#040b0f]">
             <span className="text-8xl font-black text-white/10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
               {speaker.initials}
             </span>
          </div>
        )}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div 
        className="absolute inset-0 z-10 transition-opacity duration-700"
        style={{
          background: `linear-gradient(to top, rgba(4,11,15, 0.98) 0%, rgba(4,11,15, 0.8) 35%, transparent 75%)`
        }}
      />

      {/* Top gradient — social icons readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(to bottom, rgba(4,11,15, 0.75) 0%, rgba(4,11,15, 0.3) 25%, transparent 55%)`
        }}
      />
      
      {/* Overlay color hint on hover */}
      <div 
        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
        style={{
          background: `linear-gradient(to top, ${color} 0%, transparent 100%)`
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
        
        {/* Top bar with social icons in top-right */}
        <div className="flex items-center justify-between w-full">
          <div
            className="text-[10px] tracking-[0.25em] uppercase px-3 py-1 rounded-full font-bold backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', border: `1px solid rgba(255,255,255,0.1)`, fontFamily: "'Space Mono', monospace" }}
          >
            Experto SAIO
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {isRealUrl(speaker.social?.linkedin) && (
              <a
                href={speaker.social.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:bg-[#9c3aed] hover:border-purple-400 text-white hover:shadow-[0_0_15px_rgba(156,58,237,0.6)]"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)` }}
              >
                <IconLinkedin size={16} />
              </a>
            )}
            {isRealUrl(speaker.social?.twitter) && (
              <a
                href={speaker.social.twitter} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:bg-[#9c3aed] hover:border-purple-400 text-white hover:shadow-[0_0_15px_rgba(156,58,237,0.6)]"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)` }}
              >
                <IconTwitterX size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Bottom content block */}
        <div className="transform translate-y-12 group-hover:translate-y-0 transition-transform duration-700 ease-[0.25,1,0.5,1]">
          {/* Header Info */}
          <div className="mb-4">
            <h3
              className="text-white font-bold text-2xl md:text-3xl leading-tight font-heading mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {speaker.name}
            </h3>
            <p className="text-white/70 text-xs md:text-[13px] font-bold tracking-widest uppercase mt-1 leading-snug" style={{ fontFamily: "'Space Mono', monospace" }}>
              {speaker.role} <span style={{ color }}>@ {speaker.company}</span>
            </p>
          </div>

          {/* Hidden Content (Reveals on Hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[0.25,1,0.5,1] max-h-0 group-hover:max-h-48 overflow-hidden">
            {speaker.bio && (
              <div>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-2 font-sans mt-2">
                  {speaker.bio}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelect && onSelect(speaker); }}
                  className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Leer más <ChevronRight size={13} />
                </button>
              </div>
            )}
            
            {/* Topics */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {topics.slice(0, 3).map(t => (
                  <span key={t} className="text-[9px] tracking-widest uppercase px-2 py-1 border rounded-sm" style={{ borderColor: `${color}40`, color: color, fontFamily: "'Space Mono', monospace" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page Hero ─────────────────────────────────────── */
function PageHero() {
  return (
    <section className="relative min-h-[60vh] flex flex-col justify-center items-center text-center px-6 pt-28 pb-16 overflow-hidden">
      {/* Deep nebula */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 80% at 50% 0%, rgba(76,41,182,0.4) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 60%, rgba(156,58,237,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 10% 80%, rgba(48,34,127,0.3) 0%, transparent 50%),
            #040b0f
          `,
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle pointer-events-none"
          style={{
            width: `${(i % 3) + 1}px`,
            height: `${(i % 3) + 1}px`,
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 31 + 7) % 100}%`,
            background: i % 2 === 0 ? '#9c3aed' : '#c3abdc',
            animationDelay: `${(i * 0.3) % 4}s`,
            animationDuration: `${2 + (i % 3)}s`,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Horizontal light beam */}
      <div
        className="absolute top-1/3 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.15), transparent)' }}
      />

      <div className="relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-400/30 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-secondary-light tracking-[0.2em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>SAIO XV Entropix · 2026</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-black font-heading leading-tight mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="block text-[clamp(3rem,9vw,7rem)] text-white tracking-tight">
            Nuestros
          </span>
          <span
            className="block text-[clamp(3rem,9vw,7rem)] gradient-text-bright tracking-tight"
          >
            Expertos
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-secondary text-[clamp(1rem,2vw,1.2rem)] max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Líderes e innovadores de la industria tecnológica latinoamericana que comparten
          su experiencia y visión con la próxima generación de profesionales.
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-6 mt-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="flex items-center gap-3 px-5 py-3 rounded-full glass border border-purple-500/20"
              >
                <Icon size={15} className="text-accent" />
                <span className="text-white font-bold text-sm">{stat.value}</span>
                <span className="text-secondary text-xs">{stat.label}</span>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #040b0f)' }}
      />
    </section>
  )
}

/* ─── Page ──────────────────────────────────────────── */
export default function Panelistas() {
  const [panelistasList, setPanelistasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminService.getAllPanelistas();
        if (data && data.length > 0) {
          setPanelistasList(data);
        } else {
          // Fallback static data if Firestore has no panelistas
          const fallbackData = [
            { ...featured, id: 'featured-default', isFeatured: true, bentoPosition: 1 },
            ...speakers.map((s, idx) => ({ ...s, id: `speaker-default-${idx}` }))
          ];
          setPanelistasList(fallbackData);
        }
      } catch (err) {
        console.error("Error cargando panelistas de Firestore:", err);
        const fallbackData = [
          { ...featured, id: 'featured-default', isFeatured: true, bentoPosition: 1 },
          ...speakers.map((s, idx) => ({ ...s, id: `speaker-default-${idx}` }))
        ];
        setPanelistasList(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredSpeakers = panelistasList
    .filter(p => p.isFeatured)
    .sort((a, b) => (a.bentoPosition || 99) - (b.bentoPosition || 99))
    .slice(0, 3);
  const regularSpeakers = panelistasList.filter(p => !p.isFeatured);

  return (
    <main className="relative bg-[#040b0f] min-h-screen">
      <SEO 
        title="Expertos & Keynotes Destacados | SAIO XV Entropix"
        description="Conoce a los líderes e innovadores en Inteligencia Artificial, Ciencia de Datos y Tecnología que estarán compartiendo conferencias y talleres en SAIO XV Entropix."
        path="/expertos"
      />
      <Navbar />

      <PageHero />

      {featuredSpeakers.length > 0 && (
        <>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />
          <FeaturedSpeakersBento speakers={featuredSpeakers} onSelect={setSelectedSpeaker} />
        </>
      )}

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      {/* Speaker Grid */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(48,34,127,0.08) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium" style={{ fontFamily: "'Space Mono', monospace" }}>
              Todos los expertos
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.2rem)] font-black font-heading text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Expertos que <span className="gradient-text">inspiran</span>
            </h2>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#9c3aed] border-t-transparent rounded-full animate-spin" style={{ boxShadow: '0 0 20px rgba(156,58,237,0.5)' }} />
              <span className="text-secondary text-xs font-mono tracking-[0.2em] uppercase">
                Cargando expertos...
              </span>
            </div>
          ) : regularSpeakers.length === 0 && featuredSpeakers.length === 0 ? (
            <div className="text-center py-16 text-secondary text-sm">
              Próximamente anunciaremos los expertos del evento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {regularSpeakers.map((speaker, idx) => (
                <SpeakerCard key={speaker.id || speaker.name} speaker={speaker} index={idx} onSelect={setSelectedSpeaker} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.4), transparent)' }} />

      {/* CTA */}
      <section className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 50% 50%, rgba(76,41,182,0.3) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 20% 30%, rgba(156,58,237,0.15) 0%, transparent 50%),
              #040b0f
            `,
          }}
        />

        {/* Floating orbs */}
        {[
          { size: '400px', x: '5%', y: '-10%', color: '#9c3aed55', delay: 0 },
          { size: '300px', x: '75%', y: '50%', color: '#4c29b655', delay: 2 },
        ].map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float pointer-events-none"
            style={{
              width: orb.size, height: orb.size,
              left: orb.x, top: orb.y,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              animationDelay: `${orb.delay}s`,
              opacity: 0.4,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-6 font-medium">
            Únete al evento
          </span>
          <h2
            className="text-[clamp(2.2rem,5vw,4rem)] font-black font-heading text-white leading-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Aprende directo de los
            <br />
            <span className="gradient-text-bright">mejores de la industria</span>
          </h2>
          <p className="text-secondary text-[clamp(1rem,1.8vw,1.15rem)] mb-10 leading-relaxed">
            No te pierdas la oportunidad de conectar en persona con estos líderes tecnológicos.
            Asegura tu lugar en SAIO XV Entropix.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
              to="/boletas"
              className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-bold text-base tracking-wide hover:shadow-[0_0_50px_rgba(156,58,237,0.6)] transition-all duration-300 hover:scale-105"
            >
              Comprar mi boleta
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full glass border border-purple-400/30 text-secondary-light font-medium text-base tracking-wide hover:border-purple-400/60 hover:text-white transition-all duration-300"
            >
              Ver programa completo
            </Link>
          </div>
          <p className="mt-8 text-muted text-sm">
            Pago 100% seguro · Boleta por correo · Organizado por ANEIAP
          </p>
        </motion.div>
      </section>

      <Footer />

      {/* Expert Detail Modal */}
      <ExpertDetailModal speaker={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} />
    </main>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import logo from '../assets/logo.png'
import SEO from '../components/SEO/SEO'

/* ─── Data ─────────────────────────────────────────── */
import { adminService } from '../services/adminService'

/* ─── Data ─────────────────────────────────────────── */
import {stats } from '../constants/panelistas/data'

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

/* ─── Bento Featured Speaker Card ───────────────────── */
function BentoCard({ speaker, variant = 'primary', index = 0 }) {
  const color = speaker.color || '#9c3aed';
  const topics = Array.isArray(speaker.topics) ? speaker.topics : [];

  // Primary card: large, left side of grid
  // Secondary/tertiary: stacked on the right
  const isPrimary = variant === 'primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-3xl overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg, ${color}12 0%, rgba(4,11,15,0.97) 40%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 60px ${color}15, inset 0 0 60px ${color}05`,
      }}
      whileHover={{ scale: 1.012, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* Ambient glow on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ boxShadow: `inset 0 0 80px ${color}20, 0 0 80px ${color}20` }}
      />

      {/* Noise / grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] rounded-3xl"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Border gradient line top */}
      <div
        className="absolute top-0 left-8 right-8 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      <div className={`flex flex-col ${isPrimary ? 'p-8 md:p-10 gap-6 items-center justify-center h-full' : 'p-6 md:p-8 gap-5'}`}>

        {/* Top row: badge + social */}
        <div className={`flex items-center justify-between w-full`}>
          <div
            className="text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 rounded-full font-semibold"
            style={{ background: `${color}18`, color: color, border: `1px solid ${color}35` }}
          >
            Ponente Destacado
          </div>
          <div className="flex gap-2">
            {speaker.social?.linkedin && (
              <a
                href={speaker.social.linkedin} target="_blank" rel="noopener noreferrer"
                aria-label={`${speaker.name} LinkedIn`}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: `${color}15`, border: `1px solid ${color}30`, color: color }}
                onClick={e => e.stopPropagation()}
              >
                <IconLinkedin size={13} />
              </a>
            )}
            {speaker.social?.twitter && (
              <a
                href={speaker.social.twitter} target="_blank" rel="noopener noreferrer"
                aria-label={`${speaker.name} Twitter`}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: `${color}15`, border: `1px solid ${color}30`, color: color }}
                onClick={e => e.stopPropagation()}
              >
                <IconTwitterX size={13} />
              </a>
            )}
          </div>
        </div>

        {isPrimary ? (
          /* ── PRIMARY: centered vertical layout ── */
          <>
            {/* Large circular photo — centered */}
            <div className="relative flex-shrink-0">
              <motion.div
                className="absolute rounded-full"
                style={{ inset: '-8px', border: `1px solid ${color}40` }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.15, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{ inset: '-16px', border: `1px solid ${color}20` }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.05, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              <div
                className="w-36 h-36 rounded-full overflow-hidden"
                style={{
                  border: `3px solid ${color}70`,
                  boxShadow: `0 0 60px ${color}50, 0 0 0 6px ${color}12`,
                }}
              >
                {speaker.photo ? (
                  <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-black text-white text-4xl"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${color}55, ${color}22)`,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {speaker.initials}
                  </div>
                )}
              </div>
            </div>

            {/* Name / role / company — centered */}
            <div className="text-center">
              <h3
                className="text-[clamp(1.5rem,3vw,2.2rem)] font-black text-white leading-tight font-heading"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {speaker.name}
              </h3>
              <p className="text-secondary-light text-sm mt-1 font-medium">{speaker.role}</p>
              <p className="text-sm mt-0.5 font-semibold" style={{ color }}>{speaker.company}</p>
            </div>

            {/* Bio — centered */}
            {speaker.bio && (
              <p className="text-secondary leading-relaxed text-[clamp(0.88rem,1.3vw,1rem)] line-clamp-4 text-center max-w-lg">
                {speaker.bio}
              </p>
            )}

            {/* Topics — centered */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {topics.slice(0, 4).map(t => (
                  <TopicBadge key={t} label={t} color={color} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── SECONDARY: horizontal photo + name row ── */
          <>
            {/* Circular photo — hero element */}
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset: '-6px', border: `1px solid ${color}40` }}
                  animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset: '-12px', border: `1px solid ${color}20` }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.05, 0.3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    border: `2.5px solid ${color}70`,
                    boxShadow: `0 0 40px ${color}40, 0 0 0 4px ${color}10`,
                  }}
                >
                  {speaker.photo ? (
                    <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-black text-white text-2xl"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${color}55, ${color}22)`,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {speaker.initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Name block beside photo */}
              <div className="min-w-0">
                <h3
                  className="text-[clamp(1.1rem,2vw,1.5rem)] font-black text-white leading-tight font-heading"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {speaker.name}
                </h3>
                <p className="text-secondary-light text-sm mt-0.5 font-medium">{speaker.role}</p>
                <p className="text-sm mt-0.5 font-semibold" style={{ color }}>{speaker.company}</p>
              </div>
            </div>

            {/* Bio */}
            {speaker.bio && (
              <p className="text-secondary leading-relaxed text-sm line-clamp-3">
                {speaker.bio}
              </p>
            )}

            {/* Topics */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topics.slice(0, 3).map(t => (
                  <TopicBadge key={t} label={t} color={color} />
                ))}
              </div>
            )}
          </>
        )}
      </div>


      {/* Corner accent glow */}
      <div
        className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${color}18, transparent 65%)`,
        }}
      />
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
function BentoLayout({ primary, rest }) {
  const width = useWindowWidth();
  const isLg = width >= 1024;

  if (isLg) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.25rem', alignItems: 'stretch' }}>
        <BentoCard speaker={primary} variant="primary" index={0} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {rest.map((sp, i) => (
            <BentoCard key={sp.id || sp.name} speaker={sp} variant="secondary" index={i + 1} />
          ))}
        </div>
      </div>
    );
  }

  // Mobile/tablet: stacked
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <BentoCard speaker={primary} variant="primary" index={0} />
      {rest.map((sp, i) => (
        <BentoCard key={sp.id || sp.name} speaker={sp} variant="secondary" index={i + 1} />
      ))}
    </div>
  );
}

/* ─── Featured Speakers Bento Grid ──────────────────── */
function FeaturedSpeakersBento({ speakers }) {
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
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-3 font-medium">
            Keynote Principal
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-black font-heading text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Ponentes <span className="gradient-text">destacados</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        {hasSideSpeakers ? (
          <BentoLayout primary={primary} rest={rest} />
        ) : (
          // Single featured speaker: full-width centred
          <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <BentoCard speaker={primary} variant="primary" index={0} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Speaker Card (minimal / sphere hero) ───────────── */
function SpeakerCard({ speaker, index = 0 }) {
  const color = speaker.color || '#9c3aed';
  const topics = Array.isArray(speaker.topics) ? speaker.topics : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden cursor-default flex flex-col"
      style={{
        border: `1px solid ${color}20`,
        background: 'transparent',
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}
      whileHover={{
        boxShadow: `0 0 50px ${color}18, inset 0 0 50px ${color}08`,
        borderColor: `${color}45`,
        transition: { duration: 0.4 },
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />
      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
      />

      <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-5 h-full">

        {/* ── Circular photo sphere (hero) ── */}
        <div className="relative flex-shrink-0">
          {/* Outer slow pulse ring */}
          <motion.div
            className="absolute rounded-full"
            style={{ inset: '-8px', border: `1px solid ${color}35` }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.45, 0.1, 0.45] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner fast pulse ring */}
          <motion.div
            className="absolute rounded-full"
            style={{ inset: '-4px', border: `1px solid ${color}50` }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />

          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: `2px solid ${color}60`,
              boxShadow: `0 0 30px ${color}35, 0 0 0 4px ${color}10`,
            }}
          >
            {speaker.photo ? (
              <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-black text-white text-xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${color}55, ${color}22)`,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {speaker.initials}
              </div>
            )}
          </div>
        </div>

        {/* Name / role / company */}
        <div className="text-center">
          <h3
            className="text-white font-bold text-base leading-tight font-heading mb-0.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {speaker.name}
          </h3>
          <p className="text-secondary-light text-xs mb-0.5">{speaker.role}</p>
          <p className="text-xs font-semibold" style={{ color }}>{speaker.company}</p>
        </div>

        {/* Bio */}
        {speaker.bio && (
          <p className="text-secondary text-xs leading-relaxed text-center line-clamp-3 flex-1">
            {speaker.bio}
          </p>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {topics.slice(0, 3).map(t => <TopicBadge key={t} label={t} color={color} />)}
          </div>
        )}

        {/* Social */}
        {(speaker.social?.linkedin || speaker.social?.twitter) && (
          <div className="flex gap-2 pt-3 border-t w-full justify-center" style={{ borderColor: `${color}15` }}>
            {speaker.social.linkedin && (
              <a
                href={speaker.social.linkedin}
                aria-label={`${speaker.name} LinkedIn`}
                target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}
                onClick={e => e.stopPropagation()}
              >
                <IconLinkedin size={12} />
              </a>
            )}
            {speaker.social.twitter && (
              <a
                href={speaker.social.twitter}
                aria-label={`${speaker.name} Twitter`}
                target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}
                onClick={e => e.stopPropagation()}
              >
                <IconTwitterX size={12} />
              </a>
            )}
          </div>
        )}
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
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-white text-sm tracking-wide transition-colors duration-300 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Volver al inicio
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <img src={logo} alt="SAIO XV Entropix" className="h-16 w-auto object-contain opacity-80" />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-400/30 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-secondary-light tracking-[0.2em] uppercase">SAIO XV Entropix · 2026</span>
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
            Panelistas
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

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminService.getAllPanelistas();
        setPanelistasList(data);
      } catch (err) {
        console.error("Error cargando panelistas de Firestore:", err);
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
        title="Ponentes & Panelistas Destacados | SAIO XV Entropix"
        description="Conoce a los líderes e innovadores en Inteligencia Artificial, Ciencia de Datos y Tecnología que estarán compartiendo conferencias y talleres en SAIO XV Entropix."
        path="/panelistas"
      />
      <Navbar />

      <PageHero />

      {featuredSpeakers.length > 0 && (
        <>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />
          <FeaturedSpeakersBento speakers={featuredSpeakers} />
        </>
      )}

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,41,182,0.3), transparent)' }} />

      {/* Speaker Grid */}
      <section className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(48,34,127,0.08) 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
              Todos los ponentes
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.2rem)] font-black font-heading text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Expertos que <span className="gradient-text">inspiran</span>
            </h2>
          </motion.div>

          {loading ? (
            <div className="text-center py-16 text-secondary text-sm animate-pulse">
              Cargando panelistas desde Firebase...
            </div>
          ) : regularSpeakers.length === 0 && featuredSpeakers.length === 0 ? (
            <div className="text-center py-16 text-secondary text-sm">
              Próximamente anunciaremos los ponentes del evento.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularSpeakers.map((speaker, idx) => (
                <SpeakerCard key={speaker.id || speaker.name} speaker={speaker} index={idx} />
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
          <a
              href="/#tickets"
              className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-bold text-base tracking-wide hover:shadow-[0_0_50px_rgba(156,58,237,0.6)] transition-all duration-300 hover:scale-105"
            >
              Comprar mi boleta
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full glass border border-purple-400/30 text-secondary-light font-medium text-base tracking-wide hover:border-purple-400/60 hover:text-white transition-all duration-300"
            >
              Ver programa completo
            </Link>
          </div>
          <p className="mt-8 text-muted text-sm">
            Pago 100% seguro · Boleta por correo · Organizado por ANIAP
          </p>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}

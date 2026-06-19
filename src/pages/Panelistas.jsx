import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Mic, Award, Users, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import logo from '../assets/logo.png'

/* ─── Brand icons (lucide-react no incluye brand icons) ─── */
function IconLinkedin({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function IconTwitterX({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/* ─── Data ─────────────────────────────────────────── */
const featured = {
  name: 'Dr. Alejandra Moreno',
  role: 'Directora de IA',
  company: 'Tech Latam',
  bio: 'Pionera en machine learning aplicado a sistemas de salud en América Latina. Con más de 15 años de experiencia, ha liderado proyectos de IA en Google, Microsoft y startups del ecosistema latinoamericano. Conferencista internacional y mentora de cientos de estudiantes.',
  topics: ['Machine Learning', 'IA en Salud', 'Liderazgo Tech'],
  color: '#9c3aed',
  initials: 'AM',
}

const speakers = [
  {
    name: 'Carlos Ramírez',
    role: 'Data Engineer Senior',
    company: 'Rappi',
    bio: 'Especialista en arquitecturas de datos a escala. Construye pipelines que procesan millones de transacciones diarias.',
    topics: ['Data Engineering', 'Spark', 'Kafka'],
    color: '#4c29b6',
    initials: 'CR',
    photo: null,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Valeria Torres',
    role: 'ML Research Lead',
    company: 'Mercado Libre',
    bio: 'Lidera investigación en modelos de recomendación y NLP para el mayor e-commerce de LATAM.',
    topics: ['NLP', 'Recomendación', 'Deep Learning'],
    color: '#9c3aed',
    initials: 'VT',
    photo: null,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Andrés Fuentes',
    role: 'Head of Analytics',
    company: 'Bancolombia',
    bio: 'Transforma datos financieros en estrategias de negocio. Experto en analítica prescriptiva y modelos de riesgo.',
    topics: ['Analytics', 'Fintech', 'Business Intelligence'],
    color: '#828dbc',
    initials: 'AF',
    photo: null,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Laura Jiménez',
    role: 'Cloud Architect',
    company: 'AWS Latam',
    bio: 'Diseña infraestructuras escalables en la nube para startups y corporaciones. Certificada en múltiples plataformas cloud.',
    topics: ['Cloud', 'AWS', 'DevOps'],
    color: '#c3abdc',
    initials: 'LJ',
    photo: null,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Miguel Ángel Cruz',
    role: 'AI Product Manager',
    company: 'Nubank',
    bio: 'Lleva productos de IA de la idea al mercado. Ha lanzado más de 20 features impulsados por modelos de ML en producción.',
    topics: ['Product Management', 'IA Aplicada', 'Fintech'],
    color: '#4c29b6',
    initials: 'MC',
    photo: null,
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Sofía Herrera',
    role: 'Data Scientist',
    company: 'Kavak',
    bio: 'Aplica ciencia de datos al mercado automotriz. Especialista en modelos de valuación predictiva y análisis de fraude.',
    topics: ['Data Science', 'Python', 'Modelado Predictivo'],
    color: '#9c3aed',
    initials: 'SH',
    photo: null,
    social: { linkedin: '#', twitter: '#' },
  },
]

const stats = [
  { icon: Mic, value: '20+', label: 'Ponentes confirmados' },
  { icon: Award, value: '15+', label: 'Años de experiencia promedio' },
  { icon: Users, value: '8', label: 'Empresas representadas' },
]

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

/* ─── Featured Speaker ──────────────────────────────── */
function FeaturedSpeaker() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 80% at 20% 50%, rgba(156,58,237,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 80% 50%, rgba(76,41,182,0.12) 0%, transparent 50%)
          `,
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
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
            Ponente <span className="gradient-text">destacado</span>
          </h2>
        </motion.div>

        <div
          className="relative rounded-3xl overflow-hidden p-0.5"
          style={{
            background: `linear-gradient(135deg, ${featured.color}66, rgba(76,41,182,0.4), ${featured.color}22)`,
          }}
        >
          <div
            className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row gap-10 items-center"
            style={{ background: 'rgba(4,11,15,0.92)' }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center gap-5">
              <Avatar initials={featured.initials} color={featured.color} size="lg" />
              <div className="flex gap-3">
                <a href="#" aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full glass border border-purple-500/20 flex items-center justify-center text-secondary hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300">
                  <IconLinkedin size={14} />
                </a>
                <a href="#" aria-label="Twitter / X"
                  className="w-9 h-9 rounded-full glass border border-purple-500/20 flex items-center justify-center text-secondary hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300">
                  <IconTwitterX size={14} />
                </a>
                <a href="#" aria-label="Web"
                  className="w-9 h-9 rounded-full glass border border-purple-500/20 flex items-center justify-center text-secondary hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300">
                  <Globe size={14} />
                </a>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div
                className="inline-block text-[10px] tracking-[0.25em] uppercase px-3 py-1 rounded-full mb-4 font-medium"
                style={{ background: `${featured.color}22`, color: featured.color, border: `1px solid ${featured.color}44` }}
              >
                Keynote Speaker
              </div>
              <h3
                className="text-[clamp(1.8rem,4vw,3rem)] font-black font-heading text-white mb-1 leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {featured.name}
              </h3>
              <p className="text-secondary-light font-medium mb-1">{featured.role}</p>
              <p className="text-accent text-sm mb-6">{featured.company}</p>
              <p className="text-secondary leading-relaxed text-[clamp(0.9rem,1.4vw,1.05rem)] max-w-2xl mb-8">
                {featured.bio}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {featured.topics.map(t => <TopicBadge key={t} label={t} color={featured.color} />)}
              </div>
            </div>
          </div>

          {/* Corner accent */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 100% 0%, ${featured.color}20, transparent 60%)`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

/* ─── Speaker Card ──────────────────────────────────── */
function SpeakerCard({ speaker }) {
  return (
    <div
      className="group relative rounded-2xl glass border border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-default flex flex-col"
    >
      {/* Card hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none z-0"
        style={{ boxShadow: `inset 0 0 50px ${speaker.color}18` }}
      />
      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${speaker.color}, transparent)` }}
      />

      {/* ── PHOTO BANNER (top of card) ── */}
      <div
        className="relative w-full h-44 flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${speaker.color}33 0%, rgba(4,11,15,0.9) 60%, ${speaker.color}18 100%)`,
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, ${speaker.color}44 0%, transparent 50%),
                              radial-gradient(circle at 20% 70%, rgba(48,34,127,0.4) 0%, transparent 50%)`,
          }}
        />

        {speaker.photo ? (
          /* Real photo */
          <img
            src={speaker.photo}
            alt={speaker.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          /* Placeholder decorative pattern when no photo */
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-[5rem] font-black font-heading leading-none select-none opacity-10"
              style={{ color: speaker.color, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {speaker.initials}
            </div>
          </div>
        )}

        {/* Bottom gradient fade into card */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(4,11,15,0.95))' }}
        />

        {/* Company badge — top right */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider"
          style={{
            background: 'rgba(4,11,15,0.75)',
            border: `1px solid ${speaker.color}55`,
            color: speaker.color,
            backdropFilter: 'blur(8px)',
          }}
        >
          {speaker.company}
        </div>
      </div>

      {/* ── AVATAR overlapping banner ── */}
      <div className="relative px-5 -mt-10 mb-3 z-10">
        <SpeakerPhoto
          photo={speaker.photo}
          initials={speaker.initials}
          color={speaker.color}
          size="sm"
        />
      </div>

      {/* ── CONTENT ── */}
      <div className="px-5 pb-5 flex flex-col flex-1">
        {/* Name + role */}
        <div className="mb-3">
          <h3 className="text-white font-bold text-base leading-tight font-heading mb-0.5">
            {speaker.name}
          </h3>
          <p className="text-secondary-light text-sm">{speaker.role}</p>
        </div>

        <p className="text-secondary text-sm leading-relaxed mb-4 line-clamp-3 flex-1">{speaker.bio}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {speaker.topics.map(t => <TopicBadge key={t} label={t} color={speaker.color} />)}
        </div>

        {/* Social links */}
        <div className="flex gap-2 pt-3 border-t border-purple-500/10">
          {speaker.social.linkedin && (
            <a href={speaker.social.linkedin} aria-label={`${speaker.name} LinkedIn`}
              className="w-7 h-7 rounded-full glass border border-purple-500/20 flex items-center justify-center text-muted hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300"
              onClick={e => e.stopPropagation()}>
              <IconLinkedin size={12} />
            </a>
          )}
          {speaker.social.twitter && (
            <a href={speaker.social.twitter} aria-label={`${speaker.name} Twitter`}
              className="w-7 h-7 rounded-full glass border border-purple-500/20 flex items-center justify-center text-muted hover:text-purple-400 hover:border-purple-400/40 transition-all duration-300"
              onClick={e => e.stopPropagation()}>
              <IconTwitterX size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
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
  return (
    <main className="relative bg-[#040b0f] min-h-screen">
      <Navbar />

      <PageHero />

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />

      <FeaturedSpeaker />

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <SpeakerCard key={speaker.name} speaker={speaker} />
            ))}
          </div>
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

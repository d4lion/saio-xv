import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, BarChart3, Cpu, Link2 } from 'lucide-react'
import UniverseBackground from '../UniverseBackground/UniverseBackground'

const capabilities = [
  {
    icon: Brain,
    title: 'Talleres de IA',
    description: 'Sesiones prácticas sobre modelos de machine learning, redes neuronales y aplicaciones reales de inteligencia artificial.',
    color: '#9c3aed',
    gradient: 'from-purple-600/30 to-accent/10',
  },
  {
    icon: BarChart3,
    title: 'Data Science',
    description: 'Aprende análisis exploratorio, visualización de datos y estadística aplicada de la mano de expertos de la industria.',
    color: '#4c29b6',
    gradient: 'from-primary-light/30 to-primary/10',
  },
  {
    icon: Cpu,
    title: 'Panelistas',
    description: 'Charlas y paneles con profesionales y líderes tecnológicos que comparten su experiencia y visión del futuro.',
    color: '#828dbc',
    gradient: 'from-secondary/20 to-primary/10',
  },
  {
    icon: Link2,
    title: 'Networking',
    description: 'Conecta con sponsors, reclutadores y compañeros de toda la región para construir tu red profesional desde hoy.',
    color: '#c3abdc',
    gradient: 'from-secondary-light/20 to-accent/5',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="capabilities" ref={ref} className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden">
      <UniverseBackground opacity={0.25} nebulaColor="rgba(156,58,237,0.2)" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
            Qué encontrarás
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Aprende con los{' '}
            <span className="gradient-text">mejores</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={cap.title}
                variants={cardVariant}
                className={`group relative p-6 rounded-2xl glass border border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden`}
              >
                {/* Card glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ boxShadow: `inset 0 0 40px ${cap.color}18` }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative"
                  style={{ background: `${cap.color}22`, border: `1px solid ${cap.color}44` }}
                >
                  <Icon size={22} style={{ color: cap.color }} />
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `0 0 20px ${cap.color}55` }}
                  />
                </div>

                <h3 className="text-white font-bold text-base mb-3 leading-snug font-heading">
                  {cap.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  {cap.description}
                </p>

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${cap.color}, transparent)` }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

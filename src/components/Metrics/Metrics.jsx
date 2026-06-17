import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

function useCountUp(end, duration = 2500, decimals = 0, active = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = eased * end
      setValue(parseFloat(current.toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, end, duration, decimals])
  return value
}

const metrics = [
  { value: 500, suffix: '+', label: 'Asistentes', sub: 'estudiantes esperados', color: '#9c3aed' },
  { value: 15, suffix: '+', label: 'Talleres', sub: 'prácticos e interactivos', color: '#4c29b6' },
  { value: 20, suffix: '+', label: 'Ponentes', sub: 'expertos de la industria', color: '#828dbc' },
  { value: 8, suffix: 'h', label: 'Horas', sub: 'de contenido y networking', color: '#c3abdc' },
]

function MetricCard({ metric, inView, index }) {
  const count = useCountUp(metric.value, 2200, metric.decimals || 0, inView)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative p-8 rounded-2xl glass border border-purple-500/20 hover:border-purple-400/40 text-center overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-default"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${metric.color}22, transparent 70%)` }}
      />

      {/* Counter */}
      <div className="relative z-10">
        <div
          className="text-[clamp(2.8rem,5vw,4rem)] font-black font-heading leading-none mb-2"
          style={{ color: metric.color, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span>{count}</span>
          <span>{metric.suffix}</span>
        </div>
        <h3 className="text-white font-semibold text-lg mb-1">{metric.label}</h3>
        <p className="text-secondary text-xs tracking-wide">{metric.sub}</p>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)` }}
      />
    </motion.div>
  )
}


export default function Metrics() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="metrics" ref={ref} className="relative py-28 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(76,41,182,0.1) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
            El Evento en Números
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SAIO XV en <span className="gradient-text">números</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.label} metric={metric} inView={inView} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

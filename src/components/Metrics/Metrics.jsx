import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import UniverseBackground from '../UniverseBackground/UniverseBackground'
import {dmetrics} from './dataMetrics'

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



const getBentoStyles = (index) => {
  switch (index) {
    case 0:
      return 'lg:col-span-1 lg:row-span-2 flex flex-col justify-center items-center text-center' // Tall left
    case 1:
      return 'lg:col-span-2 lg:row-span-1 flex flex-col sm:flex-row items-center sm:text-left text-center justify-center sm:justify-start gap-8' // Wide top right
    case 2:
      return 'lg:col-span-1 lg:row-span-1 flex flex-col justify-center items-center text-center' // Square bottom middle
    case 3:
      return 'lg:col-span-1 lg:row-span-1 flex flex-col justify-center items-center text-center' // Square bottom right
    default:
      return ''
  }
}

function MetricCard({ metric, inView, index }) {
  const count = useCountUp(metric.value, 2200, metric.decimals || 0, inView)
  const bentoClass = getBentoStyles(index)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative p-8 lg:p-10 rounded-[2rem] glass border border-white/5 hover:border-purple-500/30 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(156,58,237,0.2)] bg-black/20 hover:bg-black/40 ${bentoClass}`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${metric.color}15, transparent 60%)` }}
      />
      
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Counter */}
      <div className={`relative z-10 w-full h-full ${index === 1 ? 'flex flex-col sm:flex-row items-center gap-6 lg:gap-12' : 'flex flex-col items-center justify-center'}`}>
        <div
          className={`font-black font-heading leading-none ${index === 0 ? 'text-[clamp(4.5rem,8vw,7rem)] mb-6' : index === 1 ? 'text-[clamp(3.5rem,6vw,5.5rem)] shrink-0' : 'text-[clamp(3rem,5vw,4.5rem)] mb-4'}`}
          style={{ color: metric.color, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span>{count}</span>
          <span className={`${index === 0 ? 'text-4xl lg:text-5xl' : 'text-3xl lg:text-4xl'} opacity-80`}>{metric.suffix}</span>
        </div>
        
        <div className={`${index === 1 ? 'sm:text-left text-center' : 'text-center'}`}>
          <h3 className={`text-white font-black mb-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}`}>{metric.label}</h3>
          <p className={`text-secondary text-sm lg:text-base tracking-wide leading-relaxed ${index === 0 ? 'max-w-[200px] mx-auto' : ''}`}>{metric.sub}</p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)` }}
      />
    </motion.div>
  )
}


export default function Metrics() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="metrics" ref={ref} className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden">
      <UniverseBackground opacity={0.35} nebulaColor="rgba(76,41,182,0.2)" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-auto lg:grid-rows-2 gap-4 lg:gap-6 min-h-[50vh]">
          {dmetrics.map((metric, i) => (
            <MetricCard key={metric.label} metric={metric} inView={inView} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

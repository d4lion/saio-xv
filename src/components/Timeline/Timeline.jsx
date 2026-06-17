import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Database, Cpu, BarChart2, Eye, Zap } from 'lucide-react'

const steps = [
  { icon: Database, label: 'Registro', desc: 'Inscríbete y asegura tu lugar en SAIO XV', color: '#9c3aed' },
  { icon: Cpu, label: 'Talleres', desc: 'Sesiones prácticas con expertos de la industria', color: '#4c29b6' },
  { icon: BarChart2, label: 'Paneles', desc: 'Debates y charlas sobre tendencias tecnológicas', color: '#828dbc' },
  { icon: Eye, label: 'Networking', desc: 'Conecta con sponsors, reclutadores y asistentes', color: '#c3abdc' },
  { icon: Zap, label: 'Cierre', desc: 'Premiaciones, sorteos y cierre de edición', color: '#30227f' },
]

export default function Timeline() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="timeline" ref={ref} className="relative py-28 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 20% 50%, rgba(48,34,127,0.12) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
            Agenda
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            El viaje del <span className="gradient-text">evento</span>
          </h2>
        </motion.div>

        {/* Timeline horizontal — desktop */}
        <div className="hidden md:block relative">
          {/* Progress line */}
          <div className="absolute top-10 left-[10%] right-[10%] h-px bg-primary/30">
            <motion.div
              className="h-full bg-gradient-to-r from-accent via-primary-light to-secondary"
              initial={{ width: 0 }}
              animate={inView ? { width: '100%' } : {}}
              transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Node */}
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center relative mb-5 z-10"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${step.color}44, ${step.color}11)`,
                      border: `2px solid ${step.color}66`,
                      boxShadow: `0 0 20px ${step.color}33`,
                    }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                    {/* Pulse ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: `1px solid ${step.color}44`,
                        animation: `pulse-ring 2.5s ease-out ${i * 0.4}s infinite`,
                      }}
                    />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1 font-heading">{step.label}</h3>
                  <p className="text-secondary text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Timeline vertical — mobile */}
        <div className="md:hidden flex flex-col gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className="flex items-start gap-4"
              >
                {/* Vertical connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${step.color}22`, border: `1.5px solid ${step.color}55` }}
                  >
                    <Icon size={20} style={{ color: step.color }} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 mt-2 bg-gradient-to-b from-primary-light/50 to-transparent min-h-[2rem]" />
                  )}
                </div>
                <div className="pt-3">
                  <h3 className="text-white font-bold text-sm mb-1">{step.label}</h3>
                  <p className="text-secondary text-xs">{step.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  MapPin, 
  Tag} from 'lucide-react'
import UniverseBackground from '../UniverseBackground/UniverseBackground'
import { scheduleTabs, scheduleData } from './CronoData'



export default function Timeline() {
  const [activeTab, setActiveTab] = useState('manana')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const currentEvents = scheduleData[activeTab] || []

  return (
    <section id="agenda" ref={ref} className="relative py-24 lg:py-16">
      <UniverseBackground opacity={0.3} nebulaColor="rgba(48,34,127,0.2)" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-3 font-semibold px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            Cronograma del Evento
          </span>
          <h2
            className="text-[clamp(2.2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Agenda de <span className="gradient-text">Actividades</span>
          </h2>
          <p className="text-secondary max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Selecciona el bloque del día para consultar las actividades y espacios del evento.
          </p>
        </motion.div>

        {/* Tabs navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {scheduleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-light to-accent text-white shadow-[0_0_25px_rgba(156,58,237,0.4)] scale-105 border border-purple-400/50'
                    : 'glass border border-purple-500/20 text-secondary hover:text-white hover:border-purple-400/40'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-accent'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Horizontal Cards Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Top horizontal progress connecting line for desktop */}
            <div className="hidden lg:block absolute top-6 left-12 right-12 h-0.5 bg-gradient-to-r from-purple-500/30 via-accent/40 to-purple-500/30 pointer-events-none" />

            {currentEvents.length === 0 ? (
              <div className="text-center py-12 px-6 glass rounded-2xl border border-purple-500/20 max-w-md mx-auto my-6">
                <p className="text-secondary text-sm font-medium">No hay actividades programadas en esta sección por el momento.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${
                currentEvents.length === 1 
                  ? 'max-w-xl mx-auto' 
                  : currentEvents.length === 2 
                  ? 'md:grid-cols-2 max-w-4xl mx-auto' 
                  : 'md:grid-cols-2 lg:grid-cols-3'
              } gap-6 relative z-10`}>
                {currentEvents.map((event, i) => {
                  const Icon = event.icon
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.12 }}
                      className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl glass border border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(156,58,237,0.18)]"
                    >
                      {/* Background glow on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${event.color}22, transparent 75%)`
                        }}
                      />

                      <div>
                        {/* Top Header Node & Time */}
                        <div className="flex items-center justify-between gap-3 mb-5">
                          {/* Time Badge */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold">
                            <Clock size={12} className="text-accent" />
                            <span>{event.time}</span>
                          </div>

                          {/* Node Icon */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center relative shrink-0"
                            style={{ background: `${event.color}22`, border: `1px solid ${event.color}44` }}
                          >
                            <Icon size={18} style={{ color: event.color }} />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="mb-3">
                          <span
                            className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full inline-block"
                            style={{
                              backgroundColor: `${event.color}20`,
                              color: event.color,
                              border: `1px solid ${event.color}40`
                            }}
                          >
                            {event.category}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="text-white font-bold text-lg font-heading mb-1.5 leading-snug group-hover:text-purple-200 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-secondary-light text-xs font-medium mb-3">
                          {event.subtitle}
                        </p>

                        {/* Description */}
                        <p className="text-secondary text-xs leading-relaxed mb-6">
                          {event.description}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-purple-500/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-purple-300/80 font-medium text-xs">
                          <MapPin size={13} className="text-accent shrink-0" />
                          <span>{event.location}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {event.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-900/30 text-purple-200/70 border border-purple-500/20"
                            >
                              <Tag size={8} />
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom accent glow */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${event.color}, transparent)`
                        }}
                      />
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

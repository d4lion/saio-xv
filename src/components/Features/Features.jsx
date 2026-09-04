import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { capabilities } from './capabilities'
import UniverseBackground from '../UniverseBackground/UniverseBackground'

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <section id="capabilities" ref={ref} className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden select-none">
      <UniverseBackground opacity={0.3} nebulaColor="rgba(156,58,237,0.15)" />

      <div className="max-w-[1400px] w-full mx-auto px-6 relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 lg:mb-16"
        >
          <span className="inline-block text-[10px] tracking-[0.4em] text-white/50 uppercase mb-4 font-mono">
            Qué encontrarás
          </span>
          <h2
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-black font-heading text-white leading-none tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Aprende con los{' '}
            <span className="gradient-text">mejores</span>
          </h2>
        </motion.div>

        {/* Dynamic Interactive Board */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 lg:gap-5 lg:min-h-[65vh] w-full"
        >
          {capabilities.map((cap, idx) => {
            const isActive = activeIdx === idx
            const Icon = cap.icon

            return (
              <motion.div
                key={cap.title}
                layout
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => {
                  if (window.innerWidth >= 1024) setActiveIdx(idx)
                }}
                className={`group relative overflow-hidden rounded-[2rem] flex flex-col justify-between p-6 lg:p-8 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] border ${
                  isActive 
                    ? 'lg:flex-[3] flex-[1] border-purple-500/40 bg-[#0a0614]/80 shadow-[0_0_50px_rgba(156,58,237,0.2)]' 
                    : 'lg:flex-[0.8] flex-[0.5] border-white/5 bg-black/30 hover:bg-black/50 opacity-70 hover:opacity-100'
                }`}
                style={{ backdropFilter: 'blur(20px)' }}
              >
                {/* Active Background Glow */}
                <div 
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  style={{ background: `radial-gradient(circle at 50% 100%, ${cap.color}25 0%, transparent 70%)` }}
                />

                {/* Noise overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Giant Watermark Icon */}
                <div 
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:left-auto lg:right-[-10%] pointer-events-none transition-all duration-[1.2s] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isActive ? 'opacity-[0.08] scale-100 rotate-0 blur-[2px]' : 'opacity-0 scale-50 rotate-45 blur-md'
                  }`}
                >
                  <Icon size={350} style={{ color: cap.color }} />
                </div>

                {/* Top: Icon */}
                <div className="relative z-10 flex items-center gap-4">
                  <div 
                    className={`w-12 h-12 lg:w-16 lg:h-16 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-white/10 scale-100' : 'bg-white/5 scale-90'}`} 
                    style={{ border: `1px solid ${cap.color}44`, boxShadow: isActive ? `0 0 30px ${cap.color}30` : 'none' }}
                  >
                    <Icon size={isActive ? 28 : 22} style={{ color: isActive ? cap.color : '#888' }} className="transition-all duration-700" />
                  </div>
                  
                  {/* Title when inactive (mobile only) */}
                  <h3 className={`lg:hidden font-black font-heading transition-all duration-700 ${isActive ? 'text-2xl text-white opacity-0 absolute' : 'text-xl text-white/70 opacity-100 relative'}`}>
                    {cap.title}
                  </h3>
                </div>

                {/* Bottom: Text Content */}
                <div className="relative z-10 mt-auto pt-8">
                  <motion.div layout="position">
                    {/* Desktop inactive/active title */}
                    <h3 className={`font-black font-heading transition-all duration-700 hidden lg:block ${
                      isActive 
                        ? 'text-3xl lg:text-4xl text-white mb-4' 
                        : 'text-2xl lg:text-[2.2rem] uppercase tracking-[0.15em] text-white/20 -rotate-90 origin-bottom-left absolute bottom-[-20px] left-4 whitespace-nowrap opacity-100'
                    }`}>
                      {cap.title}
                    </h3>

                    {/* Mobile active title */}
                    <h3 className={`lg:hidden font-black font-heading transition-all duration-700 ${isActive ? 'text-2xl text-white mb-2' : 'hidden'}`}>
                      {cap.title}
                    </h3>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        isActive ? 'max-h-[200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-8'
                      }`}
                    >
                      <p className="text-secondary text-sm lg:text-lg leading-relaxed max-w-lg">
                        {cap.description}
                      </p>
                      
                      <Link to="/panelistas" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer text-white hover:text-purple-400 group/btn">
                        Descubrir más 
                        <span className="group-hover/btn:translate-x-1 transition-transform" style={{ color: cap.color }}>→</span>
                      </Link>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom colored accent line */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
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

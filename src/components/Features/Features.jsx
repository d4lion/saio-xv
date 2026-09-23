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

      {/* Noise overlay estático para toda la sección — tamaño fijo, 0 recálculos al redimensionar cards */}
      <div 
        className="absolute inset-0 opacity-[0.025] z-0 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='featuresNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23featuresNoise)'/%3E%3C/svg%3E")` }}
      />

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
              <div
                key={cap.title}
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => {
                  if (window.innerWidth >= 1024 && activeIdx !== idx) {
                    setActiveIdx(idx)
                  }
                }}
                className={`group relative overflow-hidden rounded-[2rem] flex flex-col justify-between p-6 lg:p-8 cursor-pointer transition-[flex,background-color,border-color] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu will-change-[flex] border ${
                  isActive 
                    ? 'lg:flex-[3] flex-[1] border-purple-500/40 bg-[#0a0614]/85' 
                    : 'lg:flex-[0.8] flex-[0.5] border-white/[0.07] bg-[#07050f]/60 hover:bg-[#0c081a]/80 hover:border-white/15'
                }`}
              >
                {/* Ambient Glow (GPU accelerated via opacity) */}
                <div 
                  className={`absolute inset-0 rounded-[2rem] pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  style={{ 
                    boxShadow: `inset 0 0 35px ${cap.color}20, 0 0 50px rgba(156,58,237,0.18)` 
                  }}
                />

                {/* Active Background Radial Glow */}
                <div 
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  style={{ background: `radial-gradient(circle at 50% 100%, ${cap.color}25 0%, transparent 70%)` }}
                />

                {/* Giant Watermark Icon (GPU accelerated, without heavy gaussian blur) */}
                <div 
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:left-auto lg:right-[-10%] pointer-events-none transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu will-change-transform ${
                    isActive ? 'opacity-[0.07] scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'
                  }`}
                >
                  <Icon size={350} style={{ color: cap.color }} />
                </div>

                {/* Top: Icon, Index & Mobile Inactive Title */}
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-12 h-12 lg:w-16 lg:h-16 shrink-0 rounded-2xl flex items-center justify-center transition-[transform,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        isActive ? 'bg-white/10 scale-100' : 'bg-white/5 scale-90'
                      }`} 
                      style={{ 
                        border: `1px solid ${cap.color}44`, 
                        boxShadow: isActive ? `0 0 30px ${cap.color}30` : 'none' 
                      }}
                    >
                      <Icon 
                        size={isActive ? 28 : 22} 
                        style={{ color: isActive ? cap.color : '#888' }} 
                        className="transition-colors duration-500" 
                      />
                    </div>
                    
                    {/* Title when inactive (mobile only) */}
                    <h3 className={`lg:hidden font-bold font-heading text-lg text-white/90 transition-opacity duration-500 ${
                      isActive ? 'opacity-0 hidden' : 'opacity-100'
                    }`}>
                      {cap.title}
                    </h3>
                  </div>

                  {/* Tech Index badge */}
                  <span className={`font-mono text-xs tracking-widest transition-opacity duration-500 select-none ${
                    isActive ? 'text-white/60' : 'text-white/20'
                  }`}>
                    0{idx + 1}
                  </span>
                </div>

                {/* Desktop Inactive Vertical Title (separated to prevent layout thrashing) */}
                <div 
                  className={`hidden lg:block absolute bottom-8 left-8 pointer-events-none -rotate-90 origin-bottom-left whitespace-nowrap transition-[opacity,transform] duration-500 ease-out ${
                    isActive 
                      ? 'opacity-0 translate-y-4 pointer-events-none' 
                      : 'opacity-100 translate-y-0'
                  }`}
                >
                  <span className="text-xl xl:text-2xl font-black font-heading uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">
                    {cap.title}
                  </span>
                </div>

                {/* Bottom: Active Text Content */}
                <div className="relative z-10 mt-auto pt-6">
                  {/* Active Heading */}
                  <h3 
                    className={`font-black font-heading text-2xl lg:text-3xl xl:text-4xl text-white transition-[opacity,transform] duration-500 ease-out ${
                      isActive 
                        ? 'opacity-100 translate-y-0 mb-3' 
                        : 'opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden'
                    }`}
                  >
                    {cap.title}
                  </h3>

                  {/* Zero-reflow CSS Grid accordion content */}
                  <div 
                    className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div 
                      className={`overflow-hidden transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <p className="text-secondary text-sm lg:text-base xl:text-lg leading-relaxed max-w-lg mb-6">
                        {cap.description}
                      </p>
                      
                      <Link 
                        to="/expertos" 
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer text-white hover:text-purple-400 group/btn"
                      >
                        Descubrir más 
                        <span 
                          className="group-hover/btn:translate-x-1 transition-transform inline-block" 
                          style={{ color: cap.color }}
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom colored accent line */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-1 transition-opacity duration-700 pointer-events-none ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ background: `linear-gradient(90deg, transparent, ${cap.color}, transparent)` }}
                />
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

function FloatingOrb({ size, x, y, color, delay = 0 }) {
  return (
    <div
      className="absolute rounded-full animate-float blur-xl pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        animationDelay: `${delay}s`,
        opacity: 0.35,
      }}
    />
  )
}

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="cta" ref={ref} className="relative py-40 overflow-hidden">
      {/* Intense nebula bg */}
      <div className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 80% at 50% 50%, rgba(76,41,182,0.35) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(156,58,237,0.2) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(48,34,127,0.3) 0%, transparent 55%),
            #040b0f
          `
        }}
      />

      {/* Floating orbs */}
      <FloatingOrb size="500px" x="10%" y="-20%" color="#9c3aed88" delay={0} />
      <FloatingOrb size="350px" x="70%" y="60%" color="#4c29b688" delay={3} />
      <FloatingOrb size="250px" x="40%" y="70%" color="#30227f88" delay={1.5} />

      {/* Particle dots */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            width: `${(i % 3) + 1.5}px`,
            height: `${(i % 3) + 1.5}px`,
            left: `${(i * 23 + 7) % 100}%`,
            top: `${(i * 37 + 11) % 100}%`,
            background: i % 2 === 0 ? '#9c3aed' : '#c3abdc',
            animationDelay: `${(i * 0.4) % 4}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-6 font-medium"
        >
          ¡Cupos casi agotados!
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, delay: 0.1 }}
          className="text-[clamp(2.2rem,5vw,4.5rem)] font-black font-heading text-white leading-tight mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Tu boleta para
          <br />
          <span className="gradient-text-bright">SAIO XV Entropix</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-secondary text-[clamp(1rem,1.8vw,1.2rem)] max-w-xl mx-auto leading-relaxed mb-4"
        >
          Aprende de los mejores, conecta con la industria y lleva tu carrera al siguiente nivel.
          Los lugares se están llenando rápido.
        </motion.p>

        {/* Price callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-10"
          style={{
            background: 'rgba(156,58,237,0.12)',
            border: '1px solid rgba(156,58,237,0.35)',
          }}
        >
          <span className="text-secondary-light text-sm">Desde</span>
          <span
            className="text-white font-black text-xl font-heading"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            $50.000 COP
          </span>
          <span className="text-accent text-sm font-medium">· Pago único</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#tickets"
            className="group flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-bold text-base tracking-wide hover:shadow-[0_0_50px_rgba(156,58,237,0.6)] transition-all duration-300 hover:scale-105"
          >
            Comprar mi boleta
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </a>
          <a
            href="#capabilities"
            className="flex items-center justify-center gap-2 px-10 py-4 rounded-full glass border border-purple-400/30 text-secondary-light font-medium text-base tracking-wide hover:border-purple-400/60 hover:text-white transition-all duration-300"
          >
            Ver el programa
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2"
        >
          {[
            'Pago 100% seguro',
            'Boleta por correo',
            'Cupo limitado',
            'Organizado por ANIAP',
          ].map((item) => (
            <span key={item} className="text-muted text-xs">{item}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

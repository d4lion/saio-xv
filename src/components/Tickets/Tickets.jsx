import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Flame, ShieldCheck, ExternalLink, Zap, Crown, Sparkles } from 'lucide-react'
import { TICKETS_DATA } from '../../constants/tickets'
import { ticketService } from '../../services/ticketService'
import { useAuth } from '../../context/AuthContext'


const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function AvailabilityBar({ total, remaining, color }) {
  const pct = Math.round((remaining / total) * 100)
  const filled = 100 - pct
  return (
    <div className="mt-6 p-4 rounded-2xl bg-black/20 border border-white/[0.03] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px] text-gray-400 font-medium tracking-widest uppercase">Disponibilidad</span>
        <span className="text-[11px] font-bold text-white">
          {remaining} cupos
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.6)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.9)' }}>
        <motion.div
          className="h-full relative rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${color}22, ${color}88, ${color})`,
            boxShadow: `0 0 10px ${color}`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${filled}%` }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
        >
          {/* Energy core pulse */}
          <div className="absolute top-0 right-0 bottom-0 w-6 bg-white blur-[3px] opacity-70 animate-pulse" />
        </motion.div>
      </div>
    </div>
  )
}

export default function Tickets() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { user } = useAuth()
  const [tickets, setTickets] = useState(TICKETS_DATA)

  useEffect(() => {
    ticketService.getActiveTickets().then((data) => {
      if (data && data.length > 0) setTickets(data)
    })
  }, [])

  const handleBuyTicket = async (ticket) => {
    // 1. Trazabilidad de clic e intención con metadata de dispositivo
    await ticketService.trackTicketCheckoutClick(ticket, user)

    // 2. Redirección al checkout Wompi
    if (ticket.checkoutUrl) {
      window.open(ticket.checkoutUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getIcon = (iconName) => {
    if (iconName === 'Crown') return Crown
    if (iconName === 'Sparkles') return Sparkles
    return Zap
  }

  return (
    <section id="tickets" ref={ref} className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden">
      {/* Immersive Space Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Deep Nebulas */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(156,58,237,0.12) 0%, transparent 70%),
              radial-gradient(circle at 10% 40%, rgba(76,41,182,0.15) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(48,34,127,0.2) 0%, transparent 50%)
            `,
          }}
        />

        {/* Cyberpunk Tech Grid */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #9c3aed 1px, transparent 1px),
              linear-gradient(to bottom, #9c3aed 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 10%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 10%, transparent 75%)'
          }}
        />

        {/* Space Dust / Stars */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={`ticket-star-${i}`}
            className="absolute rounded-full animate-twinkle"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              left: `${(i * 23 + 11) % 100}%`,
              top: `${(i * 31 + 7) % 100}%`,
              background: i % 2 === 0 ? '#c3abdc' : '#9c3aed',
              animationDelay: `${(i * 0.3) % 4}s`,
              animationDuration: `${2.5 + (i % 3)}s`,
              opacity: 0.6,
              boxShadow: `0 0 6px ${i%2===0?'#c3abdc':'#9c3aed'}`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
            Boletas
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Asegura tu <span className="gradient-text">lugar</span>
          </h2>
          <p className="text-secondary mt-4 max-w-xl mx-auto text-[clamp(0.9rem,1.4vw,1.05rem)] leading-relaxed">
            Los cupos son limitados. Selecciona tu entrada y paga de forma inmediata y segura con <span className="gradient-text font-bold">Wompi</span>.
          </p>
        </motion.div>




        {/* 2-Ticket Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto text-left"
        >
          {tickets.map((plan) => {
            const Icon = typeof plan.icon === 'function' || typeof plan.icon === 'object'
              ? plan.icon
              : getIcon(plan.iconName)
            return (
              <motion.div
                key={plan.id}
                variants={cardVariant}
                className={`relative p-[1.5px] rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'shadow-[0_20px_40px_-15px_rgba(156,58,237,0.25)]' 
                    : 'hover:shadow-2xl hover:shadow-white/5'
                }`}
              >
                {/* Rotating Glowing Border for Popular Ticket */}
                {plan.popular ? (
                  <div 
                    className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] pointer-events-none z-0"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0 280deg, #9c3aed 330deg, ${plan.color} 360deg)`
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 border border-white/10 group-hover:border-white/20 rounded-3xl pointer-events-none transition-colors z-0" />
                )}

                <div 
                  className="relative z-10 flex flex-col h-full rounded-[23px] overflow-hidden"
                  style={{
                    background: 'rgba(10, 14, 23, 0.85)',
                    backdropFilter: 'blur(24px)',
                  }}
                >
                  {/* Soft Background Glow */}
                <div 
                  className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none transition-opacity duration-500 group-hover:opacity-50"
                  style={{ background: plan.color }}
                />

                {/* Popular badge */}
                {plan.popular && (
                  <div
                    className="absolute top-5 right-5 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase z-20 flex items-center gap-1.5 backdrop-blur-md"
                    style={{
                      background: `${plan.color}15`,
                      border: `1px solid ${plan.color}50`,
                      color: '#fff',
                      boxShadow: `0 0 20px ${plan.color}40`
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: plan.color, boxShadow: `0 0 6px ${plan.color}` }} />
                    Recomendado
                  </div>
                )}

                <div className="relative p-8 md:p-10 h-full flex flex-col justify-between z-10 mt-2">
                  
                  {/* Space Stardust Noise Overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none rounded-3xl"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                  />

                  {/* Nebula Inner Gradient */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none rounded-3xl"
                    style={{ background: `radial-gradient(circle at 10% 10%, ${plan.color}40, transparent 40%), radial-gradient(circle at 90% 90%, ${plan.color}20, transparent 40%)` }}
                  />

                  <div className="relative z-10">
                    {/* Icon + Title with Sci-Fi Orbitals */}
                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative shrink-0 flex items-center justify-center w-14 h-14">
                        {/* Orbital Ring 1 */}
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_8s_linear_infinite]" style={{ borderTopColor: plan.color, borderRightColor: 'transparent' }} />
                        {/* Orbital Ring 2 */}
                        <div className="absolute inset-[-5px] rounded-full border border-white/5 animate-[spin_12s_linear_infinite_reverse]" style={{ borderBottomColor: plan.color, borderLeftColor: 'transparent' }} />
                        
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center relative z-10 backdrop-blur-md"
                          style={{ background: `radial-gradient(circle, ${plan.color}40, transparent)`, border: `1px solid ${plan.color}50`, boxShadow: `0 0 15px ${plan.color}30` }}
                        >
                          <Icon size={20} style={{ color: plan.color }} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-black text-2xl font-heading leading-none tracking-tight drop-shadow-md">{plan.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{plan.subtitle}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 font-bold text-sm mt-2">{plan.currency}</span>
                        <span
                          className="text-[clamp(3rem,5vw,4rem)] font-black text-white tracking-tighter leading-none"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {plan.price}
                        </span>
                      </div>
                      <span className="text-gray-500 text-[11px] uppercase tracking-wider block mt-2 ml-1">{plan.period}</span>

                      {/* Availability bar */}
                      <AvailabilityBar
                        total={plan.totalAvailable}
                        remaining={plan.remainingAvailable}
                        color={plan.color}
                      />
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-10">
                      {(plan.features || []).map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[13px] leading-relaxed text-gray-300">
                          <Check size={18} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
                          <span className="font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleBuyTicket(plan)}
                    className="relative z-10 group/btn flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 overflow-hidden"
                    style={
                      plan.popular
                        ? {
                            backgroundColor: plan.color,
                            color: '#fff',
                            boxShadow: `0 8px 25px -5px ${plan.color}60`,
                          }
                        : {
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          }
                    }
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {plan.cta} <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    {plan.popular && (
                      <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                    )}
                    {!plan.popular && (
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    )}
                  </button>
                </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2"
        >
          {[
            'Pago 100% seguro con Wompi',
            'Boleta por correo inmediata',
            'Cupo estrictamente limitado',
          ].map((item) => (
            <span key={item} className="text-muted text-xs">{item}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

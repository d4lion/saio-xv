import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Flame, ShieldCheck, ExternalLink, Zap, Crown, Sparkles } from 'lucide-react'
import { TICKETS_DATA } from '../../constants/tickets'
import { ticketService } from '../../services/ticketService'
import { useAuth } from '../../context/AuthContext'

const urgencyItems = [
  { icon: Flame, text: 'Las boletas VIP están casi agotadas', color: '#ff6b35' },
  { icon: ShieldCheck, text: 'Pago 100% seguro garantizado por Wompi', color: '#9c3aed' },
]

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
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-secondary tracking-wide uppercase">Disponibilidad</span>
        <span className="text-[10px] font-bold" style={{ color }}>
          {remaining} lugares restantes
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${filled}%` }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        />
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
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76,41,182,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 90% 80%, rgba(156,58,237,0.1) 0%, transparent 50%)
          `,
        }}
      />

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
            Los cupos son limitados. Selecciona tu entrada y paga de forma inmediata y segura con Wompi Colombia.
          </p>
        </motion.div>

        {/* Urgency banners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {urgencyItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.text}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide"
                style={{
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}40`,
                  color: item.color,
                }}
              >
                <Icon size={13} />
                {item.text}
              </div>
            )
          })}
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
                className="relative rounded-3xl overflow-hidden flex flex-col group"
                style={{
                  padding: '1px',
                  background: plan.popular
                    ? `linear-gradient(135deg, ${plan.color}aa, rgba(76,41,182,0.6), ${plan.color}55)`
                    : `linear-gradient(135deg, ${plan.color}44, rgba(30,20,60,0.8), ${plan.color}22)`,
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div
                    className="absolute -top-px left-1/2 -translate-x-1/2 px-5 py-1 rounded-b-xl text-[10px] font-bold tracking-widest uppercase z-10"
                    style={{
                      background: `linear-gradient(90deg, ${plan.color}, #4c29b6)`,
                      color: '#fff',
                    }}
                  >
                    Experiencia Recomendada
                  </div>
                )}

                <div
                  className="relative rounded-3xl p-8 h-full flex flex-col justify-between"
                  style={{ background: 'rgba(4,11,15,0.95)', backdropFilter: 'blur(20px)' }}
                >
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ boxShadow: `inset 0 0 60px ${plan.glowColor}` }}
                  />

                  <div>
                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}44` }}
                      >
                        <Icon size={20} style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl font-heading">{plan.name}</h3>
                        <p className="text-secondary-light text-xs mt-0.5">{plan.subtitle}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="relative z-10 mb-6 pb-6 border-b border-purple-500/15">
                      <div className="flex items-end gap-2">
                        <span
                          className="text-[clamp(2.5rem,5vw,3.5rem)] font-black font-heading leading-none"
                          style={{ color: plan.color, fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {plan.price}
                        </span>
                        <div className="mb-1.5">
                          <div className="text-secondary-light text-xs font-medium">{plan.currency}</div>
                          <div className="text-muted text-[10px]">{plan.period}</div>
                        </div>
                      </div>

                      {/* Availability bar */}
                      <AvailabilityBar
                        total={plan.totalAvailable}
                        remaining={plan.remainingAvailable}
                        color={plan.color}
                      />
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 relative z-10">
                      {(plan.features || []).map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <div
                            className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}55` }}
                          >
                            <Check size={9} style={{ color: plan.color }} />
                          </div>
                          <span className="text-secondary text-sm leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleBuyTicket(plan)}
                    className="relative z-10 group/btn flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02]"
                    style={
                      plan.popular
                        ? {
                            background: `linear-gradient(135deg, ${plan.color}, #4c29b6)`,
                            color: '#fff',
                            boxShadow: `0 0 30px ${plan.color}44`,
                          }
                        : {
                            background: `${plan.color}20`,
                            border: `1px solid ${plan.color}66`,
                            color: '#ffffff',
                          }
                    }
                  >
                    <span>{plan.cta}</span>
                    <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </button>
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
            'Transferible a otra persona',
            'Cupo estrictamente limitado',
          ].map((item) => (
            <span key={item} className="text-muted text-xs">{item}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

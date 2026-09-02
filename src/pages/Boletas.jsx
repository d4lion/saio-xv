import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, ShieldCheck, Flame, ExternalLink, Ticket as TicketIcon, Zap, Crown, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import { TICKETS_DATA } from '../constants/tickets'
import { ticketService } from '../services/ticketService'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO/SEO'

function AvailabilityBar({ total, remaining, color }) {
  const pct = Math.round((remaining / total) * 100)
  const filled = 100 - pct
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-secondary tracking-wide uppercase">Disponibilidad</span>
        <span className="text-[11px] font-bold" style={{ color }}>
          {remaining} cupos restantes
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${filled}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function Boletas() {
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
    <main className="relative bg-[#040b0f] min-h-screen flex flex-col justify-between overflow-hidden">
      <SEO 
        title="Boletas Oficiales & Entradas | SAIO XV Entropix"
        description="Adquiere tus entradas oficial General ($50.000 COP) o VIP ($90.000 COP) para SAIO XV Entropix con pago 100% seguro a través del checkout oficial de Wompi."
        path="/boletas"
      />
      <Navbar />

      {/* Hero / Main Tickets Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 pt-32 pb-20 z-10">
        
        {/* Deep Space Glowing Backdrop */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 10%, rgba(156,58,237,0.18) 0%, transparent 65%),
              radial-gradient(ellipse 60% 50% at 85% 70%, rgba(76,41,182,0.2) 0%, transparent 55%),
              radial-gradient(ellipse 40% 40% at 15% 80%, rgba(48,34,127,0.25) 0%, transparent 50%)
            `,
          }}
        />

        {/* Floating Twinkling Particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle pointer-events-none z-0"
            style={{
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              left: `${(i * 19 + 7) % 100}%`,
              top: `${(i * 29 + 11) % 100}%`,
              background: i % 2 === 0 ? '#9c3aed' : '#c3abdc',
              animationDelay: `${(i * 0.3) % 4}s`,
              animationDuration: `${2.5 + (i % 3)}s`,
              opacity: 0.4,
            }}
          />
        ))}

        <div className="relative z-10 max-w-5xl w-full mx-auto">
          
          {/* Tag Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-400/30 mb-6"
          >
            <TicketIcon size={14} className="text-purple-400" />
            <span className="text-xs text-secondary-light tracking-[0.2em] uppercase font-medium">
              Venta de Boletas Oficiales · SAIO XV Entropix
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[clamp(2.2rem,5vw,3.8rem)] font-black font-heading text-white leading-tight mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Elige tu <span className="gradient-text">experiencia</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-secondary text-[clamp(0.95rem,1.5vw,1.15rem)] max-w-xl mx-auto leading-relaxed mb-8"
          >
            Selecciona tu entrada y completa el pago 100% seguro a través del checkout oficial de Wompi Colombia.
          </motion.p>

          {/* Urgency Banners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#ff6b35]/15 border border-[#ff6b35]/40 text-[#ff6b35]">
              <Flame size={14} />
              <span>Las boletas VIP tienen cupos estrictamente limitados</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-400/40 text-purple-300">
              <ShieldCheck size={14} />
              <span>Pago 100% seguro garantizado por Wompi</span>
            </div>
          </motion.div>

          {/* 2-Ticket Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto text-left">
            {tickets.map((ticket, idx) => {
              const Icon = typeof ticket.icon === 'function' || typeof ticket.icon === 'object' 
                ? ticket.icon 
                : getIcon(ticket.iconName)
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.15 }}
                  className="relative rounded-3xl overflow-hidden flex flex-col group"
                  style={{
                    padding: '1px',
                    background: ticket.popular
                      ? `linear-gradient(135deg, ${ticket.color}cc, rgba(76,41,182,0.8), ${ticket.color}66)`
                      : `linear-gradient(135deg, ${ticket.color}55, rgba(30,20,60,0.8), ${ticket.color}22)`,
                  }}
                >
                  {/* Popular Badge */}
                  {ticket.popular && (
                    <div
                      className="absolute -top-px left-1/2 -translate-x-1/2 px-6 py-1 rounded-b-xl text-[10px] font-bold tracking-widest uppercase z-20 shadow-lg"
                      style={{
                        background: `linear-gradient(90deg, ${ticket.color}, #4c29b6)`,
                        color: '#fff',
                      }}
                    >
                      Experiencia Recomendada
                    </div>
                  )}

                  <div
                    className="relative rounded-3xl p-8 md:p-9 h-full flex flex-col justify-between z-10"
                    style={{ background: 'rgba(4,11,15,0.95)', backdropFilter: 'blur(20px)' }}
                  >
                    {/* Inner Glow */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none z-0"
                      style={{ boxShadow: `inset 0 0 60px ${ticket.glowColor}` }}
                    />

                    <div className="relative z-10">
                      {/* Icon + Title */}
                      <div className="flex items-center gap-4 mb-5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                          style={{ background: `${ticket.color}25`, border: `1px solid ${ticket.color}55` }}
                        >
                          <Icon size={22} style={{ color: ticket.color }} />
                        </div>
                        <div>
                          <h3 className="text-white font-black text-xl font-heading leading-tight">{ticket.name}</h3>
                          <p className="text-secondary-light text-xs mt-0.5">{ticket.subtitle}</p>
                        </div>
                      </div>

                      {/* Pricing Header */}
                      <div className="mb-6 pb-6 border-b border-purple-500/15">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-[clamp(2.8rem,5vw,3.6rem)] font-black font-heading leading-none"
                            style={{ color: ticket.color, fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {ticket.price}
                          </span>
                          <div>
                            <span className="text-secondary-light text-xs font-bold block">{ticket.currency}</span>
                            <span className="text-muted text-[10px] uppercase tracking-wider">{ticket.period}</span>
                          </div>
                        </div>

                        <AvailabilityBar
                          total={ticket.totalAvailable}
                          remaining={ticket.remainingAvailable}
                          color={ticket.color}
                        />
                      </div>

                      {/* Features List */}
                      <ul className="space-y-3.5 mb-8">
                        {(ticket.features || []).map((f) => (
                          <li key={f} className="flex items-start gap-3 text-xs leading-relaxed">
                            <div
                              className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: `${ticket.color}30`, border: `1px solid ${ticket.color}66` }}
                            >
                              <Check size={10} style={{ color: ticket.color }} />
                            </div>
                            <span className="text-secondary-light font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Wompi Checkout Button */}
                    <button
                      onClick={() => handleBuyTicket(ticket)}
                      className="relative z-10 group/btn flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02]"
                      style={
                        ticket.popular
                          ? {
                              background: `linear-gradient(135deg, ${ticket.color}, #4c29b6)`,
                              color: '#fff',
                              boxShadow: `0 0 30px ${ticket.color}44`,
                            }
                          : {
                              background: `${ticket.color}25`,
                              border: `1px solid ${ticket.color}66`,
                              color: '#ffffff',
                            }
                      }
                    >
                      <span>{ticket.cta}</span>
                      <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom Trust Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-muted text-xs"
          >
            <span>🔒 Checkout procesado por Wompi Colombia</span>
            <span>✉️ Entrada enviada inmediatamente a tu correo</span>
            <span>🎫 Ticket digital con código QR oficial</span>
          </motion.div>

        </div>
      </section>

      {/* Separator Line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />

      <Footer />
    </main>
  )
}

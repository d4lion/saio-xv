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

export default function Boletas() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ticketService.getActiveTickets().then((data) => {
      if (data) setTickets(data)
      setLoading(false)
    }).catch(() => {
      // En caso de error de conexión, se queda cargando
      setLoading(true)
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



          {/* Tickets Loading or Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#9c3aed] border-t-transparent rounded-full animate-spin" style={{ boxShadow: '0 0 15px rgba(156,58,237,0.5)' }}></div>
              <span className="text-gray-400 text-sm animate-pulse">Cargando boletas...</span>
            </div>
          ) : (
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
                  className={`relative p-[1.5px] rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 hover:-translate-y-2 ${
                    ticket.popular 
                      ? 'shadow-[0_20px_40px_-15px_rgba(156,58,237,0.25)]' 
                      : 'hover:shadow-2xl hover:shadow-white/5'
                  }`}
                >
                  {/* Rotating Glowing Border for Popular Ticket */}
                  {ticket.popular ? (
                    <div 
                      className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] pointer-events-none z-0"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0 280deg, #9c3aed 330deg, ${ticket.color} 360deg)`
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
                    style={{ background: ticket.color }}
                  />

                  {/* Popular Badge */}
                  {ticket.popular && (
                    <div
                      className="absolute top-5 right-5 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase z-20 flex items-center gap-1.5 backdrop-blur-md"
                      style={{
                        background: `${ticket.color}15`,
                        border: `1px solid ${ticket.color}50`,
                        color: '#fff',
                        boxShadow: `0 0 20px ${ticket.color}40`
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ticket.color, boxShadow: `0 0 6px ${ticket.color}` }} />
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
                      style={{ background: `radial-gradient(circle at 10% 10%, ${ticket.color}40, transparent 40%), radial-gradient(circle at 90% 90%, ${ticket.color}20, transparent 40%)` }}
                    />

                    <div className="relative z-10">
                      {/* Icon + Title with Sci-Fi Orbitals */}
                      <div className="flex items-center gap-5 mb-8">
                        <div className="relative shrink-0 flex items-center justify-center w-14 h-14">
                          {/* Orbital Ring 1 */}
                          <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_8s_linear_infinite]" style={{ borderTopColor: ticket.color, borderRightColor: 'transparent' }} />
                          {/* Orbital Ring 2 */}
                          <div className="absolute inset-[-5px] rounded-full border border-white/5 animate-[spin_12s_linear_infinite_reverse]" style={{ borderBottomColor: ticket.color, borderLeftColor: 'transparent' }} />
                          
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center relative z-10 backdrop-blur-md"
                            style={{ background: `radial-gradient(circle, ${ticket.color}40, transparent)`, border: `1px solid ${ticket.color}50`, boxShadow: `0 0 15px ${ticket.color}30` }}
                          >
                            <Icon size={20} style={{ color: ticket.color }} />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-black text-2xl font-heading leading-none tracking-tight drop-shadow-md">{ticket.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{ticket.subtitle}</p>
                        </div>
                      </div>

                      {/* Pricing Header */}
                      <div className="mb-8">
                        <div className="flex items-start gap-1.5">
                          <span className="text-gray-400 font-bold text-sm mt-2">{ticket.currency}</span>
                          <span
                            className="text-[clamp(3rem,5vw,4rem)] font-black text-white tracking-tighter leading-none"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                          >
                            {ticket.price}
                          </span>
                        </div>
                        <span className="text-gray-500 text-[11px] uppercase tracking-wider block mt-2 ml-1">{ticket.period}</span>

                        <AvailabilityBar
                          total={ticket.totalAvailable}
                          remaining={ticket.remainingAvailable}
                          color={ticket.color}
                        />
                      </div>

                      {/* Features List */}
                      <ul className="space-y-4 mb-10">
                        {(ticket.features || []).map((f) => (
                          <li key={f} className="flex items-start gap-3 text-[13px] leading-relaxed text-gray-300">
                            <Check size={18} className="shrink-0 mt-0.5" style={{ color: ticket.color }} />
                            <span className="font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Wompi Checkout Button */}
                    <button
                      onClick={() => handleBuyTicket(ticket)}
                      className="relative z-10 group/btn flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 overflow-hidden"
                      style={
                        ticket.popular
                          ? {
                              backgroundColor: ticket.color,
                              color: '#fff',
                              boxShadow: `0 8px 25px -5px ${ticket.color}60`,
                            }
                          : {
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#ffffff',
                            }
                      }
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {ticket.cta} <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                      {ticket.popular && (
                        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                      )}
                      {!ticket.popular && (
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      )}
                    </button>

                  </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          )}

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

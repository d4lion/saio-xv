import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Zap, Star, Crown, ArrowRight, Flame, Clock } from 'lucide-react'

const plans = [
  {
    id: 'general',
    name: 'General',
    icon: Zap,
    price: '$50.000',
    currency: 'COP',
    period: 'por persona',
    color: '#4c29b6',
    borderColor: 'rgba(76,41,182,0.5)',
    glowColor: 'rgba(76,41,182,0.25)',
    features: [
      'Acceso a todos los talleres',
      'Asistencia a paneles',
      'Material digital del evento',
      'Networking con asistentes',
      'Coffee break incluido',
    ],
    cta: 'Comprar boleta',
    available: 200,
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Star,
    price: '$90.000',
    currency: 'COP',
    period: 'por persona',
    color: '#9c3aed',
    borderColor: 'rgba(156,58,237,0.7)',
    glowColor: 'rgba(156,58,237,0.3)',
    features: [
      'Todo lo de General',
      'Sesión privada con ponentes',
      'Kit de bienvenida exclusivo',
      'Acceso a zona VIP de networking',
      'Certificado de participación',
      'Grabaciones del evento',
    ],
    cta: 'Quiero mi boleta',
    available: 50,
    popular: true,
  },
  {
    id: 'squad',
    name: 'Squad',
    icon: Crown,
    price: '$200.000',
    currency: 'COP',
    period: 'por 3 personas',
    color: '#c3abdc',
    borderColor: 'rgba(195,171,220,0.5)',
    glowColor: 'rgba(195,171,220,0.15)',
    features: [
      'Acceso para 3 personas',
      'Todo lo de Premium x3',
      'Mesa reservada en networking',
      'Mención especial en el evento',
      'Foto grupal con panelistas',
    ],
    cta: 'Ir con mi squad',
    available: 20,
    popular: false,
  },
]

const urgencyItems = [
  { icon: Flame, text: 'Las boletas Premium están casi agotadas', color: '#ff6b35' },
  { icon: Clock, text: 'Precio especial disponible por tiempo limitado', color: '#9c3aed' },
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
        <span className="text-[10px] text-secondary tracking-wide">Disponibilidad</span>
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

      <div className="max-w-7xl mx-auto px-6">
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
            Los cupos son limitados. Elige tu experiencia y forma parte de la edición más grande de SAIO.
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

        {/* Pricing cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6 items-start"
        >
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.id}
                variants={cardVariant}
                className="relative rounded-2xl overflow-hidden"
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
                    Más popular
                  </div>
                )}

                <div
                  className="relative rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: 'rgba(4,11,15,0.95)', backdropFilter: 'blur(20px)' }}
                >
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: `inset 0 0 60px ${plan.glowColor}` }}
                  />

                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}44` }}
                    >
                      <Icon size={18} style={{ color: plan.color }} />
                    </div>
                    <h3 className="text-white font-bold text-lg font-heading">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="relative z-10 mb-6">
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
                      total={plan.id === 'general' ? 300 : plan.id === 'premium' ? 80 : 30}
                      remaining={plan.available}
                      color={plan.color}
                    />
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1 relative z-10">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}55` }}
                        >
                          <Check size={9} style={{ color: plan.color }} />
                        </div>
                        <span className="text-secondary text-sm leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href="#"
                    className="relative z-10 group flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300"
                    style={
                      plan.popular
                        ? {
                            background: `linear-gradient(135deg, ${plan.color}, #4c29b6)`,
                            color: '#fff',
                            boxShadow: `0 0 0 0 ${plan.color}`,
                          }
                        : {
                            background: `${plan.color}18`,
                            border: `1px solid ${plan.color}55`,
                            color: plan.color,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.boxShadow = `0 0 30px ${plan.color}55`
                        e.currentTarget.style.transform = 'scale(1.02)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.boxShadow = `0 0 0 0 ${plan.color}`
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    {plan.cta}
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
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
            'Pago 100% seguro',
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

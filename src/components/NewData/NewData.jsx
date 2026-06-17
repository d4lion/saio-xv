import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function DataNode({ cx, cy, r = 6, delay = 0, color = '#9c3aed', label, labelPos = 'above' }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.9" />
      <circle cx={cx} cy={cy} r={r + 6} fill={color} opacity="0.15">
        <animate attributeName="r" values={`${r + 4};${r + 14};${r + 4}`} dur={`${2.5 + delay}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0;0.15" dur={`${2.5 + delay}s`} repeatCount="indefinite" />
      </circle>
      {label && (
        <text
          x={cx}
          y={labelPos === 'above' ? cy - r - 10 : cy + r + 16}
          textAnchor="middle"
          fill="#c3abdc"
          fontSize="10"
          fontFamily="Outfit, sans-serif"
          letterSpacing="1"
        >
          {label}
        </text>
      )}
    </g>
  )
}

function DataLine({ x1, y1, x2, y2, delay = 0 }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4c29b6" strokeWidth="1.5" strokeOpacity="0.5">
      <animate attributeName="stroke-opacity" values="0.2;0.8;0.2" dur={`${3 + delay}s`} repeatCount="indefinite" />
    </line>
  )
}

function MovingParticle({ x1, y1, x2, y2, dur = 3, color = '#c3abdc', delay = 0 }) {
  return (
    <circle r="2.5" fill={color} opacity="0.8">
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite">
        <mpath>
          <path d={`M ${x1} ${y1} L ${x2} ${y2}`} />
        </mpath>
      </animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

export default function NewData() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="new-data" ref={ref} className="relative py-28 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(76,41,182,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Text side */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
            Descubrimiento
          </span>
          <h2
            className="text-[clamp(2.5rem,5vw,4rem)] font-black font-heading leading-tight mb-6 text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Nuevos{' '}
            <span className="gradient-text">Horizontes</span>
          </h2>
          <p className="text-secondary leading-relaxed text-[clamp(0.9rem,1.5vw,1.05rem)]">
            SAIO XV es el espacio donde estudiantes y la industria se encuentran. Cada sesión,
            taller y conversación es una oportunidad de transformar tu carrera y expandir
            tu perspectiva tecnológica.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {[
              { label: 'Satisfacción de asistentes', pct: '96%' },
              { label: 'Participantes que conectan con la industria', pct: '88%' },
              { label: 'Estudiantes que regresan cada año', pct: '82%' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2 text-secondary">
                  <span>{item.label}</span>
                  <span className="text-purple-400">{item.pct}</span>
                </div>
                <div className="h-1 rounded-full bg-primary/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-light to-accent"
                    initial={{ width: 0 }}
                    animate={inView ? { width: item.pct } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SVG visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <svg viewBox="0 0 400 360" width="100%" height="320" className="overflow-visible">
            {/* Orbital paths */}
            <ellipse cx="200" cy="180" rx="150" ry="80" fill="none" stroke="#30227f" strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
            <ellipse cx="200" cy="180" rx="90" ry="50" fill="none" stroke="#4c29b6" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />

            {/* Connection lines */}
            <DataLine x1="200" y1="180" x2="80" y2="100" delay={0} />
            <DataLine x1="200" y1="180" x2="320" y2="100" delay={0.5} />
            <DataLine x1="200" y1="180" x2="60" y2="260" delay={1} />
            <DataLine x1="200" y1="180" x2="340" y2="260" delay={1.5} />
            <DataLine x1="200" y1="180" x2="200" y2="60" delay={0.7} />
            <DataLine x1="80" y1="100" x2="200" y2="60" delay={0.3} />
            <DataLine x1="320" y1="100" x2="200" y2="60" delay={0.8} />
            <DataLine x1="80" y1="100" x2="60" y2="260" delay={1.2} />
            <DataLine x1="320" y1="100" x2="340" y2="260" delay={0.9} />

            {/* Moving particles on paths */}
            <MovingParticle x1="200" y1="180" x2="80" y2="100" dur={2} delay={0} color="#9c3aed" />
            <MovingParticle x1="200" y1="180" x2="320" y2="100" dur={2.5} delay={0.8} color="#c3abdc" />
            <MovingParticle x1="200" y1="180" x2="60" y2="260" dur={3} delay={0.3} color="#828dbc" />
            <MovingParticle x1="200" y1="180" x2="340" y2="260" dur={2.2} delay={1.5} color="#9c3aed" />
            <MovingParticle x1="80" y1="100" x2="340" y2="260" dur={4} delay={0.5} color="#4c29b6" />

            {/* Nodes */}
            <DataNode cx={200} cy={180} r={14} color="#9c3aed" delay={0} label="SAIO XV" labelPos="above" />
            <DataNode cx={80} cy={100} r={8} color="#4c29b6" delay={0.5} label="Captura" labelPos="above" />
            <DataNode cx={320} cy={100} r={8} color="#4c29b6" delay={1} label="Análisis" labelPos="above" />
            <DataNode cx={60} cy={260} r={8} color="#30227f" delay={0.3} label="IA" labelPos="below" />
            <DataNode cx={340} cy={260} r={8} color="#30227f" delay={0.7} label="Acción" labelPos="below" />
            <DataNode cx={200} cy={60} r={6} color="#c3abdc" delay={1.2} label="Insights" labelPos="above" />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}

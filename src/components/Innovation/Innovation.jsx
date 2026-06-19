import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function NeuralNode({ cx, cy, r = 8, color = '#9c3aed', delay = 0 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.85">
        <animate attributeName="r" values={`${r};${r * 1.3};${r}`} dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.85;0.5;0.85" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={r + 10} fill={color} opacity="0">
        <animate attributeName="r" values={`${r + 5};${r + 25};${r + 5}`} dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
    </g>
  )
}

function NeuralEdge({ x1, y1, x2, y2, delay = 0 }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4c29b6" strokeWidth="1" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${2 + delay}s`} repeatCount="indefinite" />
    </line>
  )
}

function Particle({ x1, y1, x2, y2, dur, delay, color }) {
  return (
    <circle r="2" fill={color} opacity="0.9">
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={`M ${x1} ${y1} L ${x2} ${y2}`} />
      <animate attributeName="opacity" values="0;0.9;0.9;0" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  )
}

const highlights = [
  { title: 'Inteligencia Artificial', desc: 'Talleres prácticos sobre redes neuronales y ML aplicado.' },
  { title: 'Data Science', desc: 'Aprende estadística y análisis con casos reales de la industria.' },
  { title: 'Tecnologías Emergentes', desc: 'Descubre las tendencias que están transformando el mercado.' },
  { title: 'Conexión con la Industria', desc: 'Interactúa con sponsors y reclutadores durante el evento.' },
]

export default function Innovation() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // Node positions for a neural-like layout
  const nodes = [
    { id: 1, cx: 200, cy: 180, r: 16, color: '#9c3aed', delay: 0 },
    { id: 2, cx: 80, cy: 80, r: 9, color: '#4c29b6', delay: 0.3 },
    { id: 3, cx: 320, cy: 80, r: 9, color: '#4c29b6', delay: 0.6 },
    { id: 4, cx: 60, cy: 200, r: 7, color: '#828dbc', delay: 0.9 },
    { id: 5, cx: 340, cy: 200, r: 7, color: '#828dbc', delay: 1.2 },
    { id: 6, cx: 80, cy: 300, r: 9, color: '#30227f', delay: 0.4 },
    { id: 7, cx: 320, cy: 300, r: 9, color: '#30227f', delay: 0.7 },
    { id: 8, cx: 140, cy: 340, r: 6, color: '#c3abdc', delay: 1.1 },
    { id: 9, cx: 260, cy: 340, r: 6, color: '#c3abdc', delay: 0.5 },
    { id: 10, cx: 200, cy: 50, r: 7, color: '#9c3aed', delay: 0.8 },
    { id: 11, cx: 130, cy: 140, r: 5, color: '#4c29b6', delay: 0.2 },
    { id: 12, cx: 270, cy: 140, r: 5, color: '#4c29b6', delay: 1.0 },
  ]

  const edges = [
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
    [2, 10], [2, 11], [3, 10], [3, 12],
    [6, 8], [7, 9], [6, 4], [7, 5],
    [11, 4], [12, 5], [8, 9],
  ]

  const getNode = (id) => nodes.find(n => n.id === id)

  return (
    <section id="innovation" ref={ref} className="relative py-28 lg:py-10 lg:min-h-[100dvh] lg:flex lg:flex-col lg:justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(76,41,182,0.1) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* SVG Network */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.1 }}
          className="relative flex justify-center order-2 md:order-1"
        >
          <svg viewBox="0 0 400 400" width="100%" height="380" overflow="visible">
            {/* Edges */}
            {edges.map(([a, b], i) => {
              const na = getNode(a), nb = getNode(b)
              return <NeuralEdge key={i} x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy} delay={i * 0.15} />
            })}

            {/* Particles */}
            {edges.slice(0, 8).map(([a, b], i) => {
              const na = getNode(a), nb = getNode(b)
              const colors = ['#9c3aed', '#c3abdc', '#4c29b6', '#828dbc']
              return (
                <Particle key={i} x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                  dur={2 + i * 0.3} delay={i * 0.4} color={colors[i % 4]} />
              )
            })}

            {/* Nodes */}
            {nodes.map(n => (
              <NeuralNode key={n.id} cx={n.cx} cy={n.cy} r={n.r} color={n.color} delay={n.delay} />
            ))}
          </svg>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="order-1 md:order-2"
        >
          <span className="inline-block text-xs tracking-[0.3em] text-accent uppercase mb-4 font-medium">
            Ponentes
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Expertos que{' '}
            <span className="gradient-text">inspiran</span>
          </h2>
          <p className="text-secondary leading-relaxed mb-10 text-[clamp(0.9rem,1.4vw,1rem)]">
            En SAIO XV reunimos a profesionales y líderes de la industria tecnológica para compartir
            su conocimiento, experiencias y visión del futuro con la próxima generación de talentos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                className="p-4 rounded-xl glass border border-purple-500/20 hover:border-purple-400/35 transition-colors duration-300"
              >
                <h4 className="text-white text-sm font-semibold mb-1">{h.title}</h4>
                <p className="text-secondary text-xs leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

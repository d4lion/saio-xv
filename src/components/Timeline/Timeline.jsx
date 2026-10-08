import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import UniverseBackground from '../UniverseBackground/UniverseBackground'
import { AGENDA_DAYS } from '../../constants/agenda/data'

export default function Timeline() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // Tomamos los días de data.js y extraemos 3 actividades destacadas por día
  const day1Highlights = AGENDA_DAYS[0].activities
    .filter((a) => ['charla', 'panel', 'taller'].includes(a.category))
    .slice(0, 3)

  const day2Highlights = AGENDA_DAYS[1].activities
    .filter((a) => ['charla', 'panel', 'taller'].includes(a.category))
    .slice(0, 3)

  return (
    <section id="agenda" ref={ref} className="relative py-20 lg:py-28 overflow-hidden">
      {/* Fondo espacial profundo */}
      <UniverseBackground opacity={0.3} nebulaColor="rgba(48,34,127,0.25)" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Encabezado de sección */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2
            className="text-[clamp(2.2rem,4vw,3.5rem)] font-black font-heading text-white leading-tight mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Agenda de <span className="gradient-text">Actividades</span>
          </h2>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            Una mirada general a la estructura del evento. Explora las actividades destacadas del Día 1 y Día 2 o accede a la programación detallada hora a hora.
          </p>
        </motion.div>

        {/* Tarjetas por Día (Grid de 2 columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Tarjeta Día 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="group relative flex flex-col justify-between p-7 sm:p-9 rounded-3xl glass border border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(156,58,237,0.18)]"
          >
            <div>
              {/* Encabezado del Día 1 */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-purple-500/20">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-purple-300 block mb-1">
                    Jueves 15 de Octubre
                  </span>
                  <h3 className="text-white font-black text-xl font-heading">
                    Día 1 · Analítica & Liderazgo
                  </h3>
                </div>
                <span className="hidden sm:inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  07:00 – 16:00
                </span>
              </div>

              {/* Lista de actividades destacadas */}
              <div className="space-y-4 mb-6">
                {day1Highlights.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0 group-hover/item:scale-125 transition-transform" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-purple-300">
                          {act.start}
                        </span>
                        {act.badge && (
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-300/30">
                            {act.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-semibold leading-snug group-hover/item:text-purple-200 transition-colors">
                        {act.title}
                      </p>
                      {act.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary mt-0.5">
                          <MapPin size={11} className="text-accent" />
                          {act.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/15 flex items-center justify-between text-xs">
              <span className="text-secondary">Conferencias, paneles y talleres prácticos</span>
              <Link
                to="/agenda?dia=1"
                className="inline-flex items-center gap-1.5 text-accent font-bold hover:text-purple-300 transition-colors"
              >
                Ver día 1 <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Tarjeta Día 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="group relative flex flex-col justify-between p-7 sm:p-9 rounded-3xl glass border border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(156,58,237,0.18)]"
          >
            <div>
              {/* Encabezado del Día 2 */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-purple-500/20">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300 block mb-1">
                    Viernes 16 de Octubre
                  </span>
                  <h3 className="text-white font-black text-xl font-heading">
                    Día 2 · IA & Impacto Social
                  </h3>
                </div>
                <span className="hidden sm:inline-block text-xs font-mono font-semibold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  08:00 – 15:50
                </span>
              </div>

              {/* Lista de actividades destacadas */}
              <div className="space-y-4 mb-6">
                {day2Highlights.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 group-hover/item:scale-125 transition-transform" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-cyan-300">
                          {act.start}
                        </span>
                      </div>
                      <p className="text-white text-sm font-semibold leading-snug group-hover/item:text-cyan-200 transition-colors">
                        {act.title}
                      </p>
                      {act.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary mt-0.5">
                          <MapPin size={11} className="text-cyan-400" />
                          {act.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/15 flex items-center justify-between text-xs">
              <span className="text-secondary">Talleres de IA, charlas TED y cierre</span>
              <Link
                to="/agenda?dia=2"
                className="inline-flex items-center gap-1.5 text-cyan-300 font-bold hover:text-white transition-colors"
              >
                Ver día 2 <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* CTA Principal de la Sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link
            to="/agenda"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary-light to-accent text-white font-bold text-sm sm:text-base tracking-wide hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(156,58,237,0.4)] border border-purple-400/40"
          >
            Explorar Agenda Completa Hora por Hora
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

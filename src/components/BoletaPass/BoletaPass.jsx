import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Sparkles, Utensils, Coffee, MapPin, CalendarDays, Shield, Fingerprint, Ticket, Award } from 'lucide-react'
import { getFoodLimits } from '../../constants/foodLimits'

/** Paleta y tagline según el tipo de boleta comprada */
function getTier(ticketType = '') {
  const t = ticketType.toLowerCase()
  if (t.includes('supernova')) {
    return { a: '#e879f9', b: '#8b5cf6', tagline: 'Acceso total · Máxima órbita' }
  }
  if (t.includes('estrella fugaz')) {
    return { a: '#c4b5fd', b: '#7c3aed', tagline: 'Trayectoria veloz · Acceso esencial' }
  }
  return { a: '#a78bfa', b: '#6d28d9', tagline: 'Acceso confirmado' }
}

function Meter({ icon: Icon, label, used, max, color }) {
  const included = max > 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          {label}
        </span>
        <span className="text-white font-mono">{included ? `${used}/${max}` : 'No incluido'}</span>
      </div>
      <div className="flex gap-1.5">
        {included ? (
          Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={
                i < used
                  ? { background: color, boxShadow: `0 0 10px ${color}` }
                  : { background: 'rgba(255,255,255,0.08)' }
              }
            />
          ))
        ) : (
          <div className="h-1.5 flex-1 rounded-full border border-dashed border-white/15" />
        )}
      </div>
    </div>
  )
}

/**
 * Credencial digital del asistente. Se reutiliza en "Mi Entrada" y en "Perfil".
 * Muestra la boleta comprada, el QR de acceso, datos del titular y alimentación.
 */
export default function BoletaPass({ user }) {
  const [qrSrc, setQrSrc] = useState('')

  const ticketType = user?.boleta || 'No determinado'
  const tier = getTier(ticketType)
  const { maxAlmuerzos, maxRefrigerios } = getFoodLimits(ticketType)
  const almuerzos = user?.comidas?.almuerzos?.length || 0
  const refrigerios = user?.comidas?.refrigerios?.length || 0

  useEffect(() => {
    if (!user?.uid) return
    QRCode.toDataURL(user.uid, {
      width: 280,
      margin: 1,
      color: { dark: '#040b0f', light: '#ffffff' },
    })
      .then(setQrSrc)
      .catch((err) => console.error('Error generando QR:', err))
  }, [user?.uid])

  return (
    <article
      className="bp-card relative w-full max-w-4xl mx-auto rounded-[2rem] p-[1.5px] overflow-hidden"
      style={{ '--a': tier.a, '--b': tier.b, boxShadow: `0 20px 80px -20px ${tier.b}66` }}
      aria-label={`Credencial digital: ${ticketType}`}
    >
      {/* Borde holográfico animado */}
      <div className="bp-border absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 rounded-[calc(2rem-1.5px)] bg-[#070510] overflow-hidden">
        {/* Resplandores de fondo */}
        <div
          className="absolute -top-24 -left-16 w-80 h-80 rounded-full blur-[110px] opacity-30 pointer-events-none"
          style={{ background: tier.b }}
        />
        <div
          className="absolute -bottom-28 right-0 w-80 h-80 rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: tier.a }}
        />
        <div className="bp-grid absolute inset-0 pointer-events-none opacity-[0.07]" />
        <div className="bp-shine absolute inset-0 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto]">
          {/* ───── Cuerpo principal ───── */}
          <div className="p-6 sm:p-9 flex flex-col gap-7">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border"
                style={{ color: tier.a, borderColor: `${tier.a}55`, background: `${tier.a}14` }}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Pase confirmado
              </span>
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-secondary">
                SAIO-XV · ENTROPIX
              </span>
            </header>

            {/* Boleta comprada */}
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mb-2">
                <Ticket className="w-3.5 h-3.5" style={{ color: tier.a }} />
                Tu boleta
              </p>
              <h2
                className="text-4xl sm:text-5xl font-heading font-black leading-[1.05] tracking-tight text-transparent bg-clip-text break-words"
                style={{ backgroundImage: `linear-gradient(110deg, #fff 10%, ${tier.a} 55%, ${tier.b} 100%)` }}
              >
                {ticketType}
              </h2>
              <p className="mt-2 text-xs text-secondary tracking-wide">{tier.tagline}</p>
            </div>

            {/* Puntos y rol */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{ borderColor: `${tier.a}40`, background: `${tier.b}1f` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${tier.a}26` }}
                >
                  <Award className="w-5 h-5" style={{ color: tier.a }} />
                </div>
                <div>
                  <p className="text-[10px] text-secondary tracking-[0.2em] uppercase font-bold mb-0.5">
                    Puntos acumulados
                  </p>
                  <p className="text-2xl font-heading font-black text-white leading-none">
                    {(user?.puntos || 0).toLocaleString()}{' '}
                    <span className="text-sm" style={{ color: tier.a }}>PTS</span>
                  </p>
                </div>
              </div>
              <span
                className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border"
                style={{ color: tier.a, borderColor: `${tier.a}55`, background: `${tier.a}14` }}
              >
                {user?.rol || 'Asistente'}
              </span>
            </div>

            {/* Titular */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-white/10">
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] block mb-1">
                  Asistente
                </span>
                <span className="text-lg font-heading font-bold text-white block truncate">
                  {user?.nombre || 'Explorador'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] block mb-1">
                  Cédula
                </span>
                <span className="text-lg font-mono text-white block truncate">{user?.cedula || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: tier.a }} />
                15–16 OCT, 2026
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: tier.a }} />
                Medellín, CO
              </div>
            </div>

            {/* Alimentación */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white mb-4">
                <Utensils className="w-4 h-4 text-orange-400" />
                Alimentación incluida
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Meter icon={Utensils} label="Almuerzos" used={almuerzos} max={maxAlmuerzos} color="#fb923c" />
                <Meter icon={Coffee} label="Refrigerios" used={refrigerios} max={maxRefrigerios} color="#c084fc" />
              </div>
            </div>
          </div>

          {/* ───── Talón con QR ───── */}
          <div className="relative lg:w-[300px] p-6 sm:p-9 lg:pl-9 flex flex-col items-center justify-center gap-5 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-white/15">
            <div
              className="relative p-3 rounded-3xl bg-white transition-transform duration-500 hover:scale-[1.04] hover:-rotate-1"
              style={{ boxShadow: `0 0 0 1px ${tier.a}55, 0 0 50px ${tier.b}66` }}
            >
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt="Código QR de acceso"
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl block object-contain"
                />
              ) : (
                <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-gray-500">
                  Cargando...
                </div>
              )}
            </div>
            <p className="text-[10px] text-center text-secondary uppercase tracking-[0.25em] leading-relaxed">
              Presenta este código<br />en el ingreso
            </p>
            <div className="flex items-center gap-2 text-[9px] text-secondary/70 font-mono max-w-full">
              <Fingerprint className="w-3.5 h-3.5 shrink-0" style={{ color: tier.a }} />
              <span className="truncate">{user?.uid}</span>
            </div>
            <Shield className="absolute top-4 right-4 w-4 h-4 text-white/10 hidden lg:block" />
          </div>
        </div>
      </div>

      <style>{`
        .bp-border::before {
          content: '';
          position: absolute;
          inset: -60%;
          background: conic-gradient(from 0deg, transparent 0 55%, var(--a), var(--b), transparent 95%);
          animation: bp-rotate 7s linear infinite;
        }
        .bp-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse at top left, #000, transparent 70%);
        }
        .bp-shine::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: -40%;
          width: 30%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.07), transparent);
          transform: skewX(-18deg);
          animation: bp-shine 6s ease-in-out infinite;
        }
        @keyframes bp-rotate { to { transform: rotate(360deg); } }
        @keyframes bp-shine { 0%, 55% { left: -40%; } 100% { left: 140%; } }
        @media (prefers-reduced-motion: reduce) {
          .bp-border::before, .bp-shine::after { animation: none; }
        }
      `}</style>
    </article>
  )
}

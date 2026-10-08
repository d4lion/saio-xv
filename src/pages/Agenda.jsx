import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Award,
  Sun,
  Sunset,
  ArrowRight,
  LocateFixed,
  Ticket,
} from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import SEO from '../components/SEO/SEO'
import {
  AGENDA_DAYS,
  AGENDA_CATEGORIES,
  AGENDA_FILTERS,
  COMPACT_CATEGORIES,
} from '../constants/agenda/data'

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers de tiempo (todo en hora de Colombia, America/Bogota)
   ═══════════════════════════════════════════════════════════════════════════ */
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Las actividades de duración 0 (p. ej. "Refrigerio #4") se consideran "en curso" 15 min
const effectiveEnd = (a) => (toMin(a.end) > toMin(a.start) ? toMin(a.end) : toMin(a.start) + 15)

const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return { time: `${h12}:${String(m).padStart(2, '0')}`, period: h < 12 ? 'a. m.' : 'p. m.' }
}

const fullTime = (hhmm) => {
  const { time, period } = formatTime(hhmm)
  return `${time} ${period}`
}

const formatDuration = (mins) => {
  if (!mins || mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h} h ${m} min`
  if (h) return `${h} h`
  return `${m} min`
}

/**
 * Hora actual en Bogotá. Para pruebas se puede simular con ?ahora=2026-10-15T10:00
 */
function getBogotaNow(override) {
  if (override) {
    const m = override.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/)
    if (m) return { date: m[1], minutes: Number(m[2]) * 60 + Number(m[3]) }
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t)?.value
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  }
}

function getStatus(day, act, now) {
  if (now.date < day.date) return 'upcoming'
  if (now.date > day.date) return 'past'
  if (now.minutes >= effectiveEnd(act)) return 'past'
  if (now.minutes >= toMin(act.start)) return 'live'
  return 'upcoming'
}

/* ─── Hook: reloj que se actualiza cada 30 s ─────────────────────────────── */
function useBogotaNow(override) {
  const [realNow, setRealNow] = useState(() => getBogotaNow())
  const simulated = useMemo(() => (override ? getBogotaNow(override) : null), [override])
  useEffect(() => {
    if (override) return undefined
    const id = setInterval(() => setRealNow(getBogotaNow()), 30000)
    return () => clearInterval(id)
  }, [override])
  return simulated ?? realNow
}

/* ═══════════════════════════════════════════════════════════════════════════
   Componentes
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Tarjeta "Ahora mismo" (solo durante la jornada del evento) ──────────── */
function NowCard({ now, onGoTo }) {
  const today = AGENDA_DAYS.find((d) => d.date === now.date)
  if (!today) return null

  const acts = today.activities
  const live = acts.find((a) => getStatus(today, a, now) === 'live')
  const next = acts.find((a) => toMin(a.start) > now.minutes && a.id !== live?.id)

  // Jornada terminada: no se muestra nada
  if (!live && !next) return null

  const liveCat = live ? AGENDA_CATEGORIES[live.category] : null
  const liveRemaining = live ? effectiveEnd(live) - now.minutes : 0
  const liveProgress = live
    ? Math.min(100, Math.max(0, ((now.minutes - toMin(live.start)) / (effectiveEnd(live) - toMin(live.start))) * 100))
    : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-600/20 via-[#0e0a23]/90 to-[#0e0a23]/90 text-left shadow-[0_0_40px_rgba(156,58,237,0.18)]">
      {live ? (
        <div className="p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Ahora · Día {today.id}
            </span>
          </div>
          <p className="text-lg font-bold leading-snug text-white sm:text-xl">{live.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
            {live.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} style={{ color: liveCat.color }} />
                {live.location}
              </span>
            )}
            {liveRemaining > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-purple-300" />
                Termina en {formatDuration(liveRemaining)}
              </span>
            )}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-[width] duration-700"
              style={{ width: `${liveProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-300">
            Hoy · Día {today.id}
          </span>
          <p className="mt-1 text-sm text-white/70">La jornada aún no inicia.</p>
        </div>
      )}

      {next && (
        <button
          type="button"
          onClick={() => onGoTo(today.id, live ? live.id : next.id)}
          className="flex w-full items-center gap-3 border-t border-white/10 bg-black/20 px-4 py-3 text-left transition-colors hover:bg-black/30 sm:px-5"
        >
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">
            {live ? 'Después' : 'Primero'}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
            {fullTime(next.start)} · {next.title}
          </span>
          <ArrowRight size={16} className="shrink-0 text-purple-300" />
        </button>
      )}
    </div>
  )
}

/* ─── Selector de día (sticky) ───────────────────────────────────────────── */
function DayTabs({ selectedId, todayId, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Seleccionar día del evento"
      className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#0b0a1a]/95 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md"
    >
      {AGENDA_DAYS.map((day) => {
        const active = day.id === selectedId
        return (
          <button
            key={day.id}
            id={`agenda-tab-dia-${day.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls="agenda-lista"
            onClick={() => onChange(day.id)}
            className={`relative flex min-h-[58px] items-center justify-center gap-3 rounded-xl px-3 transition-all duration-300 ${
              active
                ? 'bg-gradient-to-r from-primary-light to-accent text-white shadow-[0_0_22px_rgba(156,58,237,0.45)]'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg leading-none ${
                active ? 'bg-white/20' : 'bg-white/5'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{day.month}</span>
              <span className="text-base font-black">{day.dayNumber}</span>
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[15px] font-bold sm:text-base">Día {day.id}</span>
              <span className={`text-xs ${active ? 'text-white/85' : 'text-white/45'}`}>{day.weekday}</span>
            </span>
            {todayId === day.id && (
              <span className="absolute -top-1.5 right-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-950">
                Hoy
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Chips de filtro ────────────────────────────────────────────────────── */
function FilterChips({ value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AGENDA_FILTERS.map((f) => {
        const active = value === f.id
        return (
          <button
            key={f.id}
            id={`agenda-filtro-${f.id}`}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f.id)}
            className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-semibold transition-all duration-200 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm ${
              active
                ? 'border-white bg-white text-[#0b0a1a]'
                : 'border-white/12 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white'
            }`}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                active ? 'bg-[#0b0a1a]/10 text-[#0b0a1a]/70' : 'bg-white/10 text-white/50'
              }`}
            >
              {counts[f.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Separador Mañana / Tarde ───────────────────────────────────────────── */
function PeriodDivider({ period }) {
  const isMorning = period === 'manana'
  const Icon = isMorning ? Sun : Sunset
  return (
    <li className="flex items-center gap-3 pb-4 pt-2" aria-hidden="true">
      <span className="flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
        <Icon size={14} className={isMorning ? 'text-amber-300' : 'text-orange-400'} />
        {isMorning ? 'Mañana' : 'Tarde'}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </li>
  )
}

/* ─── Actividad (fila del timeline) ──────────────────────────────────────── */
function ActivityItem({ act, status, isFirst, isLast, now, isEventDay }) {
  const cat = AGENDA_CATEGORIES[act.category]
  const Icon = cat.icon
  const start = formatTime(act.start)
  const duration = formatDuration(toMin(act.end) - toMin(act.start))
  const compact = COMPACT_CATEGORIES.includes(act.category)
  const isLive = status === 'live'
  const isPast = status === 'past' && isEventDay
  const progress = isLive
    ? Math.min(100, Math.max(0, ((now.minutes - toMin(act.start)) / (effectiveEnd(act) - toMin(act.start))) * 100))
    : 0

  return (
    <li
      id={`act-${act.id}`}
      className={`grid scroll-mt-44 grid-cols-[50px_1fr] gap-2 transition-opacity duration-500 sm:grid-cols-[84px_1fr] sm:gap-4 ${
        isPast ? 'opacity-45' : ''
      }`}
    >
      {/* Columna de hora */}
      <div className={`text-right ${compact ? 'pt-3' : 'pt-4'}`}>
        <time
          dateTime={act.start}
          className={`block font-bold leading-none tabular-nums ${
            compact ? 'text-sm text-white/60 sm:text-base' : 'text-base text-white sm:text-xl'
          }`}
        >
          {start.time}
        </time>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-white/35 sm:text-[11px]">
          {start.period}
        </span>
      </div>

      {/* Línea + punto + tarjeta */}
      <div className="relative pb-3 pl-6 sm:pl-8">
        <span
          aria-hidden="true"
          className={`absolute left-[7px] w-px bg-white/10 ${isFirst ? 'top-6' : 'top-0'} ${isLast ? 'h-6' : 'bottom-0'}`}
        />
        <span
          aria-hidden="true"
          className={`absolute left-0 h-[15px] w-[15px] rounded-full border-2 ${compact ? 'top-[18px]' : 'top-[22px]'}`}
          style={{
            borderColor: cat.color,
            background: isLive ? cat.color : '#040b0f',
            boxShadow: isLive ? `0 0 0 4px ${cat.color}33, 0 0 16px ${cat.color}` : 'none',
          }}
        />

        {compact ? (
          /* ── Tarjeta compacta (pausas / preguntas) ── */
          <article
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 sm:px-4 ${
              isLive ? 'border-purple-400/60 bg-purple-500/10' : 'border-dashed border-white/12 bg-transparent'
            }`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${cat.color}1a`, color: cat.color }}
            >
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="flex flex-wrap items-center gap-x-2 text-[15px] font-semibold leading-snug text-white/90">
                {act.title}
                {isLive && <LivePill />}
              </h3>
              <p className="mt-0.5 text-xs leading-snug text-white/50">
                {duration ? `${duration}` : 'Al finalizar'}
                {' · '}
                {act.location || <span className="italic">Lugar por confirmar</span>}
              </p>
              {act.note && <p className="mt-1 text-xs text-white/50">{act.note}</p>}
            </div>
          </article>
        ) : (
          /* ── Tarjeta principal ── */
          <article
            className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
              isLive
                ? 'border-purple-400/60 bg-purple-500/[0.12] shadow-[0_0_35px_rgba(156,58,237,0.25)]'
                : 'border-white/[0.08] bg-white/[0.035]'
            }`}
          >
            {/* Tinte de categoría */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(120% 80% at 100% 0%, ${cat.color}14, transparent 60%)` }}
            />

            <div className="relative">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: `${cat.color}1f`, color: cat.color, border: `1px solid ${cat.color}40` }}
                >
                  <Icon size={12} />
                  {cat.label}
                </span>
                {isLive && <LivePill />}
                {act.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                    <Award size={12} />
                    {act.badge}
                  </span>
                )}
              </div>

              <h3 className="text-[17px] font-bold leading-snug text-white sm:text-lg">{act.title}</h3>

              <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-white/65 sm:flex-row sm:flex-wrap sm:gap-x-5">
                <span className="inline-flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: cat.color }} />
                  {act.location ? (
                    <span className="text-white/80">{act.location}</span>
                  ) : (
                    <span className="italic text-white/45">Lugar por confirmar</span>
                  )}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={15} className="shrink-0 text-white/40" />
                  Hasta las {fullTime(act.end)}
                  {duration && <span className="text-white/40">· {duration}</span>}
                </span>
              </div>

              {act.note && (
                <p className="mt-3 border-t border-white/[0.07] pt-3 text-sm leading-relaxed text-white/60">
                  {act.note}
                </p>
              )}

              {isLive && (
                <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </li>
  )
}

function LivePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      Ahora
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Página
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Agenda() {
  const [searchParams, setSearchParams] = useSearchParams()
  const nowOverride = searchParams.get('ahora')
  const now = useBogotaNow(nowOverride)
  const reduceMotion = useReducedMotion()

  const todayDay = AGENDA_DAYS.find((d) => d.date === now.date)
  const paramDay = Number(searchParams.get('dia'))
  const selectedId = AGENDA_DAYS.some((d) => d.id === paramDay) ? paramDay : todayDay?.id ?? 1
  const day = AGENDA_DAYS.find((d) => d.id === selectedId)
  const isEventDay = todayDay?.id === day.id

  const [filter, setFilter] = useState('todo')
  const [visibility, setVisibility] = useState({ key: null, visible: true })
  const pendingScrollRef = useRef(null)
  const listRef = useRef(null)

  /* ── Filtrado ── */
  const counts = useMemo(() => {
    const c = {}
    AGENDA_FILTERS.forEach((f) => {
      c[f.id] = f.categories
        ? day.activities.filter((a) => f.categories.includes(a.category)).length
        : day.activities.length
    })
    return c
  }, [day])

  const visible = useMemo(() => {
    const f = AGENDA_FILTERS.find((x) => x.id === filter)
    return f?.categories ? day.activities.filter((a) => f.categories.includes(a.category)) : day.activities
  }, [day, filter])

  const dayStart = day.activities[0].start
  const dayEnd = day.activities.reduce((max, a) => (toMin(a.end) > toMin(max) ? a.end : max), dayStart)

  /* ── Actividad objetivo para el botón flotante "Ahora" ── */
  const targetAct = useMemo(() => {
    if (!todayDay) return null
    return (
      todayDay.activities.find((a) => getStatus(todayDay, a, now) === 'live') ||
      todayDay.activities.find((a) => toMin(a.start) > now.minutes) ||
      null
    )
  }, [todayDay, now])

  /* ── Cambiar de día ── */
  const changeDay = useCallback(
    (id) => {
      const next = new URLSearchParams(searchParams)
      next.set('dia', String(id))
      setSearchParams(next, { replace: true })
      // Si el usuario está más abajo de la lista, lo llevamos al inicio de la misma
      if (listRef.current) {
        const y = listRef.current.getBoundingClientRect().top + window.scrollY - 170
        if (window.scrollY > y) window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' })
      }
    },
    [searchParams, setSearchParams, reduceMotion]
  )

  /* ── Ir a una actividad concreta ── */
  const scrollToAct = useCallback(
    (actId) => {
      const el = document.getElementById(`act-${actId}`)
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    },
    [reduceMotion]
  )

  const goTo = useCallback(
    (dayId, actId) => {
      const needsRender = dayId !== selectedId || filter !== 'todo'
      if (!needsRender) {
        scrollToAct(actId)
        return
      }
      // Se hará scroll cuando la nueva lista esté montada (ver efecto siguiente)
      pendingScrollRef.current = actId
      setFilter('todo')
      if (dayId !== selectedId) {
        const next = new URLSearchParams(searchParams)
        next.set('dia', String(dayId))
        setSearchParams(next, { replace: true })
      }
    },
    [selectedId, filter, searchParams, setSearchParams, scrollToAct]
  )

  useEffect(() => {
    if (!pendingScrollRef.current) return
    scrollToAct(pendingScrollRef.current)
    pendingScrollRef.current = null
  }, [selectedId, filter, scrollToAct])

  /* ── ¿La actividad objetivo está en pantalla? (para ocultar el botón flotante) ── */
  const visibilityKey = targetAct ? `${targetAct.id}|${selectedId}|${filter}` : null
  useEffect(() => {
    if (!visibilityKey || !isEventDay) return undefined
    const el = document.getElementById(`act-${targetAct.id}`)
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => setVisibility({ key: visibilityKey, visible: entry.isIntersecting }),
      { rootMargin: '-120px 0px -80px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visibilityKey, targetAct, isEventDay])

  // Si aún no hay medición para la clave actual (p. ej. la actividad está filtrada), se considera fuera de pantalla
  const targetVisible = visibility.key === visibilityKey && visibility.visible
  const showFloating = Boolean(todayDay && targetAct && (!isEventDay || !targetVisible))

  /* ── Construcción de la lista con separadores Mañana / Tarde ── */
  const listItems = []
  let lastPeriod = null
  visible.forEach((act, i) => {
    const period = toMin(act.start) < 12 * 60 ? 'manana' : 'tarde'
    if (period !== lastPeriod) {
      listItems.push(<PeriodDivider key={`div-${period}`} period={period} />)
      lastPeriod = period
    }
    const nextAct = visible[i + 1]
    const nextPeriod = nextAct ? (toMin(nextAct.start) < 12 * 60 ? 'manana' : 'tarde') : null
    listItems.push(
      <ActivityItem
        key={act.id}
        act={act}
        status={getStatus(day, act, now)}
        isFirst={i === 0 || period !== (toMin(visible[i - 1].start) < 12 * 60 ? 'manana' : 'tarde')}
        isLast={!nextAct || nextPeriod !== period}
        now={now}
        isEventDay={isEventDay}
      />
    )
  })

  const schemaJson = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'SAIO XV - ENTROPIX 2026',
      startDate: '2026-10-15T07:00:00-05:00',
      endDate: '2026-10-16T15:50:00-05:00',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Universidad Nacional de Colombia, Sede Medellín',
        address: { '@type': 'PostalAddress', addressLocality: 'Medellín', addressCountry: 'CO' },
      },
      subEvent: AGENDA_DAYS.flatMap((d) =>
        d.activities.map((a) => ({
          '@type': 'Event',
          name: a.title,
          startDate: `${d.date}T${a.start}:00-05:00`,
          endDate: `${d.date}T${a.end}:00-05:00`,
          ...(a.location ? { location: { '@type': 'Place', name: a.location } } : {}),
        }))
      ),
    }),
    []
  )

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#040b0f]">
      <SEO
        title="Agenda del Evento | SAIO XV Entropix"
        description="Consulta la agenda completa de SAIO XV Entropix: horarios, lugares y actividades del 15 y 16 de octubre en la UNAL Medellín. Conferencias, paneles, charlas TED y talleres de Analítica, Liderazgo e IA."
        path="/agenda"
        schemaJson={schemaJson}
      />
      <Navbar />

      {/* ── Hero compacto ── */}
      <section className="relative px-4 pb-6 pt-28 sm:px-6 sm:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 50% 0%, rgba(76,41,182,0.38) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 90% 40%, rgba(156,58,237,0.15) 0%, transparent 60%)
            `,
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading font-black leading-[0.9] tracking-tighter"
          >
            <span className="block text-[clamp(3.2rem,15vw,7.5rem)] text-white">Agenda</span>
            <span className="block text-[clamp(2.2rem,10vw,5rem)] gradient-text-bright">del evento</span>
          </motion.h1>

          {todayDay && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-8 max-w-xl empty:hidden"
            >
              <NowCard now={now} onGoTo={goTo} />
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Selector de día (fijo al hacer scroll) ── */}
      <div className="sticky top-[73px] z-30 px-4 py-2 sm:px-6 md:top-[89px]">
        <div className="mx-auto max-w-3xl">
          <DayTabs selectedId={selectedId} todayId={todayDay?.id} onChange={changeDay} />
        </div>
      </div>

      {/* ── Lista de actividades ── */}
      <section ref={listRef} aria-labelledby={`agenda-tab-dia-${day.id}`} className="relative px-4 pb-20 pt-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Resumen del día */}
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                {day.weekday} {day.dayNumber} de octubre
              </h2>
              <p className="text-sm text-purple-300/90">{day.theme}</p>
            </div>
            <p className="text-sm tabular-nums text-white/50">
              {fullTime(dayStart)} – {fullTime(dayEnd)} · {day.activities.length} actividades
            </p>
          </div>

          <div className="mb-6">
            <FilterChips value={filter} onChange={setFilter} counts={counts} />
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
              <p className="text-sm text-white/60">No hay actividades de este tipo este día.</p>
              <button
                type="button"
                onClick={() => setFilter('todo')}
                className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0b0a1a]"
              >
                Ver toda la agenda
              </button>
            </div>
          ) : (
            <motion.ol
              id="agenda-lista"
              role="tabpanel"
              key={`${day.id}-${filter}`}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="list-none p-0"
            >
              {listItems}
            </motion.ol>
          )}

          {/* CTA boletas */}
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/15 to-transparent p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-heading text-lg font-bold text-white">¿Aún no tienes tu boleta?</p>
              <p className="text-sm text-white/60">Asegura tu lugar en los dos días de SAIO XV.</p>
            </div>
            <Link
              id="agenda-cta-boletas"
              to="/boletas"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-light to-accent px-6 text-sm font-bold text-white transition-shadow hover:shadow-[0_0_24px_rgba(156,58,237,0.5)] sm:w-auto"
            >
              <Ticket size={16} />
              Comprar boleta
            </Link>
          </div>
        </div>
      </section>

      {/* ── Botón flotante "Ahora" (solo durante el evento) ── */}
      {showFloating && (
        <motion.button
          id="agenda-ir-a-ahora"
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => goTo(todayDay.id, targetAct.id)}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#0b0a1a]/95 px-5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(156,58,237,0.35)] backdrop-blur-md"
        >
          <LocateFixed size={16} className="text-emerald-300" />
          {getStatus(todayDay, targetAct, now) === 'live' ? 'Ver lo que pasa ahora' : 'Ver la siguiente actividad'}
        </motion.button>
      )}

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.3), transparent)' }} />
      <Footer />
    </main>
  )
}

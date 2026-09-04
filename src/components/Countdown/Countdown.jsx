import { useState, useEffect } from 'react'

export default function Countdown({ targetDate = "2026-10-15T08:00:00" }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const units = [
    { value: timeLeft.days, label: 'DAYS' },
    { value: timeLeft.hours, label: 'HOURS' },
    { value: timeLeft.minutes, label: 'MIN' },
    { value: timeLeft.seconds, label: 'SEC' },
  ]

  return (
    <div className="flex items-start gap-3 sm:gap-5 select-none">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-start gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <span
              className="text-white/80 text-2xl sm:text-3xl font-light tracking-tight"
              style={{ fontFamily: "'Space Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span
              className="text-[9px] sm:text-[10px] tracking-[0.2em] text-white/30 mt-1 uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className="text-white/20 text-xl sm:text-2xl font-light mt-0.5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

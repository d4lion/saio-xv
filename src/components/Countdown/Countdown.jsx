import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2.5 sm:gap-3.5 px-4 py-2 rounded-full glass border border-purple-400/30 shadow-lg shadow-purple-500/10 mb-6 backdrop-blur-md"
    >
      {/* Date badge indicator */}
      <div className="flex items-center gap-2 pr-2.5 sm:pr-3 border-r border-purple-400/25">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-200 tracking-wide font-heading">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>15 y 16 de Octubre 2026</span>
        </div>
      </div>

      {/* Compact Countdown numbers */}
      <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-bold tracking-tight">
        <div className="flex items-baseline gap-0.5">
          <span className="text-white font-extrabold text-sm sm:text-base font-mono">{timeLeft.days}</span>
          <span className="text-[10px] text-purple-300 font-sans font-semibold uppercase">d</span>
        </div>
        <span className="text-purple-400/60 font-mono text-xs">:</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-white font-extrabold text-sm sm:text-base font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-purple-300 font-sans font-semibold uppercase">h</span>
        </div>
        <span className="text-purple-400/60 font-mono text-xs">:</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-white font-extrabold text-sm sm:text-base font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-purple-300 font-sans font-semibold uppercase">m</span>
        </div>
        <span className="text-purple-400/60 font-mono text-xs">:</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-white font-extrabold text-sm sm:text-base font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-purple-300 font-sans font-semibold uppercase">s</span>
        </div>
      </div>
    </motion.div>
  )
}

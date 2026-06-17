import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Countdown({ targetDate }) {
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

  const timeUnits = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-3 sm:gap-5 justify-center mb-6">
      {timeUnits.map((unit, i) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="flex flex-col items-center"
        >
          <div 
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'rgba(30, 20, 60, 0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 58, 237, 0.3)',
              boxShadow: '0 0 20px rgba(76, 41, 182, 0.2)'
            }}
          >
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            <span 
              className="text-2xl sm:text-4xl font-black text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="mt-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-secondary-light font-medium">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

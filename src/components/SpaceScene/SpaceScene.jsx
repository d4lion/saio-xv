import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function seededRand(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function Stars() {
  // 400 stars for high density
  const stars = Array.from({ length: 400 }, (_, i) => {
    // Make every 15th star a "flashing" star that glows intensely
    const isFlashing = i % 15 === 0
    return {
      id: i,
      x: seededRand(i * 7 + 1) * 100,
      y: seededRand(i * 13 + 2) * 100,
      size: seededRand(i * 3 + 3) * (isFlashing ? 3 : 2) + 0.5,
      delay: seededRand(i * 5 + 4) * 4,
      duration: seededRand(i * 11 + 5) * 3 + 2,
      isFlashing
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full bg-white ${star.isFlashing ? 'animate-pulse-glow' : 'animate-twinkle'}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.isFlashing ? 0.8 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

function FloatingPlanet({ size, x, y, color, ringColor, delay = 0, duration = 20, depth = 1, smoothX, smoothY }) {
  const moveX = useTransform(smoothX, v => v * depth * 35)
  const moveY = useTransform(smoothY, v => v * depth * 35)

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, x: moveX, y: moveY }}
    >
      <div
        className="animate-float"
        style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
      >
        <div
          className="rounded-full relative"
          style={{
            width: size, height: size,
            background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44 60%, #040b0f00 100%)`,
            boxShadow: `0 0 ${parseInt(size) * 0.5}px ${color}77, inset 0 0 ${parseInt(size) * 0.3}px rgba(0,0,0,0.6)`,
          }}
        >
          {ringColor && (
            <div
              className="absolute"
              style={{
                width: `${parseInt(size) * 2.2}px`, height: `${parseInt(size) * 0.35}px`,
                border: `2px solid ${ringColor}88`, borderRadius: '50%',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotateX(70deg)',
                boxShadow: `0 0 16px ${ringColor}66`,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Nebula({ size, x, y, color, opacity, depth, smoothX, smoothY }) {
  const moveX = useTransform(smoothX, v => v * depth * 25)
  const moveY = useTransform(smoothY, v => v * depth * 25)
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        opacity, x: moveX, y: moveY,
      }}
    />
  )
}

function ShootingStar({ x, y, delay }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x, top: y,
        animation: `shootingStar 1.8s ease-out ${delay}s 1 forwards`, // Faster comet
        opacity: 0,
      }}
    >
      <div
        style={{
          width: '180px', // Longer comet
          height: '3px',  // Thicker comet
          background: 'linear-gradient(90deg, transparent, rgba(156,58,237,0.9), #ffffff)',
          borderRadius: '3px',
          boxShadow: '0 0 20px rgba(156,58,237,0.8)', // Brighter comet
        }}
      />
    </div>
  )
}

export default function SpaceScene({ className = '' }) {
  const [shootingStars, setShootingStars] = useState([])
  const timerRef = useRef(null)
  const countRef = useRef(0)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 150 })
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 150 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      mouseX.set(x)
      mouseY.set(y)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  useEffect(() => {
    const spawnStar = () => {
      const id = countRef.current++
      const x = `${seededRand(id * 7) * 70}%`
      const y = `${seededRand(id * 13) * 50}%`
      setShootingStars((prev) => [...prev.slice(-6), { id, x, y }])
    }
    const schedule = () => {
      // Much more frequent comets (0.4s to 1.9s)
      const next = 400 + Math.random() * 1500
      timerRef.current = setTimeout(() => {
        spawnStar()
        schedule()
      }, next)
    }
    schedule()
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <Stars />

      <Nebula size="600px" x="calc(55% - 300px)" y="-10%" color="#9c3aed55" opacity={0.3} depth={0.2} smoothX={smoothX} smoothY={smoothY} />
      <Nebula size="500px" x="-10%" y="40%" color="#4c29b655" opacity={0.2} depth={0.5} smoothX={smoothX} smoothY={smoothY} />
      <Nebula size="300px" x="40%" y="65%" color="#30227f88" opacity={0.15} depth={0.8} smoothX={smoothX} smoothY={smoothY} />

      <FloatingPlanet size="240px" x="72%" y="4%" color="#9c3aed" ringColor="#c3abdc" delay={0} duration={25} depth={0.6} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="340px" x="-5%" y="30%" color="#30227f" ringColor="#828dbc" delay={2} duration={30} depth={1.2} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="180px" x="82%" y="60%" color="#4c29b6" ringColor={null} delay={4} duration={22} depth={1.8} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="100px" x="60%" y="78%" color="#2d104a" ringColor="#9c3aed" delay={1} duration={18} depth={2.5} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="60px" x="20%" y="8%" color="#828dbc" ringColor={null} delay={3} duration={15} depth={3.2} smoothX={smoothX} smoothY={smoothY} />

      {shootingStars.map((s) => (
        <ShootingStar key={s.id} x={s.x} y={s.y} delay={0} />
      ))}
    </div>
  )
}

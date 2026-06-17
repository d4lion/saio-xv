import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

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

function Nebula({ size, x, y, color, opacity }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        opacity,
      }}
    />
  )
}

export default function SpaceScene({ className = '' }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Optimizaciones de rendimiento: menos rigidez en el resorte para suavizar los cálculos de Framer Motion
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 100 })
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 100 })

  useEffect(() => {
    let ticking = false
    const handleMouseMove = (e) => {
      // Usar requestAnimationFrame para limitar (throttle) los cálculos a la tasa de refresco del monitor (60fps)
      // Esto evita que se sature el hilo principal de JS por exceso de eventos de mousemove
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth) * 2 - 1
          const y = (e.clientY / window.innerHeight) * 2 - 1
          mouseX.set(x)
          mouseY.set(y)
          ticking = false
        })
        ticking = true
      }
    }
    
    // { passive: true } mejora el rendimiento general del navegador para eventos de scroll/move
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Nebulosas estáticas */}
      <Nebula size="600px" x="calc(55% - 300px)" y="-10%" color="#9c3aed55" opacity={0.3} />
      <Nebula size="500px" x="-10%" y="40%" color="#4c29b655" opacity={0.2} />
      <Nebula size="300px" x="40%" y="65%" color="#30227f88" opacity={0.15} />

      {/* Planetas flotantes interactivos */}
      <FloatingPlanet size="240px" x="72%" y="4%" color="#9c3aed" ringColor="#c3abdc" delay={0} duration={25} depth={0.6} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="340px" x="-5%" y="30%" color="#30227f" ringColor="#828dbc" delay={2} duration={30} depth={1.2} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="180px" x="82%" y="60%" color="#4c29b6" ringColor={null} delay={4} duration={22} depth={1.8} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="100px" x="60%" y="78%" color="#2d104a" ringColor="#9c3aed" delay={1} duration={18} depth={2.5} smoothX={smoothX} smoothY={smoothY} />
      <FloatingPlanet size="60px" x="20%" y="8%" color="#828dbc" ringColor={null} delay={3} duration={15} depth={3.2} smoothX={smoothX} smoothY={smoothY} />
    </div>
  )
}

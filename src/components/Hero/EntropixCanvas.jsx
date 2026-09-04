import { useRef, useEffect, useCallback } from 'react'

// ─── Configuration ───────────────────────────────────────────────
const CONFIG = {
  desktop: { particles: 180, connectionDistance: 120, mouseRadius: 200 },
  mobile:  { particles: 70,  connectionDistance: 90,  mouseRadius: 0 },
  colors: {
    particle: [156, 58, 237],      // accent purple
    particleAlt: [130, 141, 188],   // secondary blue
    connection: [230, 210, 255],    // almost white for visible connections
    glow: [156, 58, 237],
    fog: [76, 41, 182],
  },
  speed: 0.15,
  orbitSpeed: 0.0003,
  depthLayers: 3,
}

function isMobile() {
  return window.innerWidth < 768
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// ─── Particle class ──────────────────────────────────────────────
class Particle {
  constructor(w, h, config) {
    this.config = config
    this.reset(w, h)
  }

  reset(w, h) {
    // Distribute particles in an elliptical cloud biased to center-right
    const angle = Math.random() * Math.PI * 2
    const radiusX = (0.15 + Math.random() * 0.35) * w
    const radiusY = (0.15 + Math.random() * 0.35) * h
    
    this.x = w * 0.55 + Math.cos(angle) * radiusX * (0.3 + Math.random() * 0.7)
    this.y = h * 0.5  + Math.sin(angle) * radiusY * (0.3 + Math.random() * 0.7)
    
    this.z = Math.random() // 0 = far, 1 = near
    this.baseSize = 1 + Math.random() * 2.5
    this.size = this.baseSize * (0.3 + this.z * 0.7)
    
    // Orbital motion
    this.orbitAngle = Math.random() * Math.PI * 2
    this.orbitRadiusX = 20 + Math.random() * 80
    this.orbitRadiusY = 15 + Math.random() * 60
    this.orbitSpeed = (0.5 + Math.random() * 1.5) * CONFIG.orbitSpeed * (Math.random() > 0.5 ? 1 : -1)
    this.orbitCenterX = this.x
    this.orbitCenterY = this.y
    
    // Drift velocity (very slow)
    this.vx = (Math.random() - 0.5) * CONFIG.speed * 0.3
    this.vy = (Math.random() - 0.5) * CONFIG.speed * 0.3
    
    // Visual
    this.opacity = 0.15 + this.z * 0.55
    this.pulseOffset = Math.random() * Math.PI * 2
    this.isNode = Math.random() < 0.12 // 12% are brighter "hub" nodes
    if (this.isNode) {
      this.baseSize *= 1.8
      this.size = this.baseSize * (0.3 + this.z * 0.7)
      this.opacity = Math.min(1, this.opacity * 1.5)
    }
    
    // Color
    const useAlt = Math.random() < 0.3
    this.color = useAlt ? CONFIG.colors.particleAlt : CONFIG.colors.particle
  }

  update(w, h, dt, mouseX, mouseY, mouseRadius) {
    // Orbital motion
    this.orbitAngle += this.orbitSpeed * dt
    this.orbitCenterX += this.vx * dt * 0.016
    this.orbitCenterY += this.vy * dt * 0.016
    
    this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadiusX
    this.y = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadiusY
    
    // Cursor interaction (gravitational field)
    if (mouseRadius > 0 && mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX
      const dy = this.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < mouseRadius && dist > 1) {
        const force = (1 - dist / mouseRadius) * 0.8
        // Gentle repulsion with slight attraction at edges
        const direction = dist < mouseRadius * 0.3 ? 1 : -0.3
        this.x += (dx / dist) * force * direction * 2
        this.y += (dy / dist) * force * direction * 2
      }
    }
    
    // Soft boundary wrapping
    const margin = 100
    if (this.x < -margin) this.orbitCenterX = w + margin
    if (this.x > w + margin) this.orbitCenterX = -margin
    if (this.y < -margin) this.orbitCenterY = h + margin
    if (this.y > h + margin) this.orbitCenterY = -margin
    
    // Pulse
    this.currentOpacity = this.opacity + Math.sin(Date.now() * 0.001 + this.pulseOffset) * 0.08
  }
}

// ─── Renderer ────────────────────────────────────────────────────
function renderFrame(ctx, particles, w, h, mouseX, mouseY, config) {
  // Clear
  ctx.clearRect(0, 0, w, h)
  
  // ── Volumetric nebula glows (multi-layer for depth) ──
  // Primary glow — large, centered on particle cloud
  const g1x = w * 0.55, g1y = h * 0.45
  const g1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, w * 0.45)
  g1.addColorStop(0, 'rgba(156, 58, 237, 0.09)')
  g1.addColorStop(0.3, 'rgba(109, 40, 217, 0.06)')
  g1.addColorStop(0.6, 'rgba(76, 41, 182, 0.03)')
  g1.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, w, h)
  
  // Secondary glow — lower-left atmospheric fog
  const g2x = w * 0.25, g2y = h * 0.7
  const g2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, w * 0.35)
  g2.addColorStop(0, 'rgba(76, 41, 182, 0.07)')
  g2.addColorStop(0.5, 'rgba(48, 34, 127, 0.04)')
  g2.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, w, h)
  
  // Tertiary glow — top accent bloom
  const g3x = w * 0.7, g3y = h * 0.15
  const g3 = ctx.createRadialGradient(g3x, g3y, 0, g3x, g3y, w * 0.25)
  g3.addColorStop(0, 'rgba(156, 58, 237, 0.05)')
  g3.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g3
  ctx.fillRect(0, 0, w, h)
  
  // ── Connections (thin luminous lines) ──
  const connDist = config.connectionDistance
  const connDistSq = connDist * connDist
  
  ctx.lineWidth = 0.8
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const distSq = dx * dx + dy * dy
      
      if (distSq < connDistSq) {
        const dist = Math.sqrt(distSq)
        const alpha = (1 - dist / connDist) * 0.22 * Math.min(a.z, b.z)
        // Brighter connections between hub nodes
        const boost = (a.isNode && b.isNode) ? 2.5 : (a.isNode || b.isNode) ? 1.5 : 1
        ctx.strokeStyle = `rgba(${CONFIG.colors.connection.join(',')}, ${alpha * boost})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }
  
  // ── Particles ──
  for (const p of particles) {
    const alpha = p.currentOpacity
    
    // Bloom halo for hub nodes (larger, more vivid)
    if (p.isNode) {
      const haloSize = p.size * 10
      const haloGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloSize)
      haloGrad.addColorStop(0, `rgba(${p.color.join(',')}, ${alpha * 0.3})`)
      haloGrad.addColorStop(0.3, `rgba(${p.color.join(',')}, ${alpha * 0.1})`)
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = haloGrad
      ctx.fillRect(p.x - haloSize, p.y - haloSize, haloSize * 2, haloSize * 2)
    }
    
    // Soft glow for all particles
    if (p.z > 0.5) {
      const softSize = p.size * 4
      const softGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, softSize)
      softGrad.addColorStop(0, `rgba(${p.color.join(',')}, ${alpha * 0.12})`)
      softGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = softGrad
      ctx.fillRect(p.x - softSize, p.y - softSize, softSize * 2, softSize * 2)
    }
    
    // Particle dot
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color.join(',')}, ${alpha})`
    ctx.fill()
  }
  
  // ── Cursor glow field (more visible, warmer) ──
  if (mouseX !== null && mouseY !== null && config.mouseRadius > 0) {
    const cursorGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180)
    cursorGlow.addColorStop(0, 'rgba(156, 58, 237, 0.08)')
    cursorGlow.addColorStop(0.4, 'rgba(109, 40, 217, 0.04)')
    cursorGlow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = cursorGlow
    ctx.fillRect(mouseX - 180, mouseY - 180, 360, 360)
  }
}

// ─── React Component ─────────────────────────────────────────────
export default function EntropixCanvas({ className = '' }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: null, y: null })
  const frameRef = useRef(0)
  const configRef = useRef(CONFIG.desktop)
  
  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    
    canvas.width = w * dpr
    canvas.height = h * dpr
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    const mobile = isMobile()
    configRef.current = mobile ? CONFIG.mobile : CONFIG.desktop
    const config = configRef.current
    
    // Create particles
    particlesRef.current = []
    for (let i = 0; i < config.particles; i++) {
      particlesRef.current.push(new Particle(w, h, config))
    }
    
    return { ctx, w, h, dpr }
  }, [])
  
  useEffect(() => {
    const reduced = prefersReducedMotion()
    let setup = init()
    if (!setup) return
    
    let { ctx, w, h } = setup
    let lastTime = performance.now()
    let running = true
    
    // Mouse tracking
    const onMouseMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }
    
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    canvasRef.current?.addEventListener('mouseleave', onMouseLeave)
    
    // Resize
    const onResize = () => {
      setup = init()
      if (setup) {
        ctx = setup.ctx
        w = setup.w
        h = setup.h
      }
    }
    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(onResize, 200)
    })
    
    // Animation loop
    const animate = (now) => {
      if (!running) return
      
      const dt = Math.min(now - lastTime, 50) // cap at 50ms (20fps min)
      lastTime = now
      
      const config = configRef.current
      const { x: mx, y: my } = mouseRef.current
      
      if (!reduced) {
        for (const p of particlesRef.current) {
          p.update(w, h, dt, mx, my, config.mouseRadius)
        }
      }
      
      renderFrame(ctx, particlesRef.current, w, h, mx, my, config)
      
      frameRef.current = requestAnimationFrame(animate)
    }
    
    frameRef.current = requestAnimationFrame(animate)
    
    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }, [init])
  
  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  )
}

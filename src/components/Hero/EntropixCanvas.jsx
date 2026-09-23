import { useRef, useEffect, useCallback } from 'react'

// ─── Configuration ───────────────────────────────────────────────
const CONFIG = {
  desktop: { particles: 130, connectionDistance: 120, mouseRadius: 200 },
  mobile:  { particles: 45,  connectionDistance: 90,  mouseRadius: 0 },
  colors: {
    particle: [156, 58, 237],
    particleAlt: [130, 141, 188],
    connection: [230, 210, 255],
    glow: [156, 58, 237],
    fog: [76, 41, 182],
  },
  speed: 0.15,
  orbitSpeed: 0.0003,
  depthLayers: 3,
  // ─── Performance ───────────────────────────────────────────────
  targetFPS: 30,           // cap a 30fps — el objeto gira lento, imperceptible
  initDelayMs: 400,        // esperar 400ms para dejar que el LCP del texto pinte primero
}

const FRAME_BUDGET = 1000 / CONFIG.targetFPS // ~33ms

function isMobile() {
  return window.innerWidth < 768
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// ─── Pre-render nebula en offscreen canvas (se hace UNA vez, no por frame) ──
function buildNebulaCache(w, h) {
  const oc = document.createElement('canvas')
  oc.width = w
  oc.height = h
  const ctx = oc.getContext('2d')

  // Primary glow
  const g1x = w * 0.55, g1y = h * 0.45
  const g1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, w * 0.45)
  g1.addColorStop(0, 'rgba(156, 58, 237, 0.09)')
  g1.addColorStop(0.3, 'rgba(109, 40, 217, 0.06)')
  g1.addColorStop(0.6, 'rgba(76, 41, 182, 0.03)')
  g1.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, w, h)

  // Secondary glow
  const g2x = w * 0.25, g2y = h * 0.7
  const g2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, w * 0.35)
  g2.addColorStop(0, 'rgba(76, 41, 182, 0.07)')
  g2.addColorStop(0.5, 'rgba(48, 34, 127, 0.04)')
  g2.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, w, h)

  // Tertiary glow
  const g3x = w * 0.7, g3y = h * 0.15
  const g3 = ctx.createRadialGradient(g3x, g3y, 0, g3x, g3y, w * 0.25)
  g3.addColorStop(0, 'rgba(156, 58, 237, 0.05)')
  g3.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g3
  ctx.fillRect(0, 0, w, h)

  return oc
}

// ─── Particle class ──────────────────────────────────────────────
class Particle {
  constructor(w, h, config) {
    this.config = config
    this.reset(w, h)
  }

  reset(w, h) {
    const angle = Math.random() * Math.PI * 2
    const radiusX = (0.15 + Math.random() * 0.35) * w
    const radiusY = (0.15 + Math.random() * 0.35) * h

    this.x = w * 0.55 + Math.cos(angle) * radiusX * (0.3 + Math.random() * 0.7)
    this.y = h * 0.5  + Math.sin(angle) * radiusY * (0.3 + Math.random() * 0.7)

    this.z = Math.random()
    this.baseSize = 1 + Math.random() * 2.5
    this.size = this.baseSize * (0.3 + this.z * 0.7)

    this.orbitAngle = Math.random() * Math.PI * 2
    this.orbitRadiusX = 20 + Math.random() * 80
    this.orbitRadiusY = 15 + Math.random() * 60
    this.orbitSpeed = (0.5 + Math.random() * 1.5) * CONFIG.orbitSpeed * (Math.random() > 0.5 ? 1 : -1)
    this.orbitCenterX = this.x
    this.orbitCenterY = this.y

    this.vx = (Math.random() - 0.5) * CONFIG.speed * 0.3
    this.vy = (Math.random() - 0.5) * CONFIG.speed * 0.3

    this.opacity = 0.15 + this.z * 0.55
    this.pulseOffset = Math.random() * Math.PI * 2
    this.isNode = Math.random() < 0.12
    if (this.isNode) {
      this.baseSize *= 1.8
      this.size = this.baseSize * (0.3 + this.z * 0.7)
      this.opacity = Math.min(1, this.opacity * 1.5)
    }

    const useAlt = Math.random() < 0.3
    this.color = useAlt ? CONFIG.colors.particleAlt : CONFIG.colors.particle
  }

  update(w, h, dt, mouseX, mouseY, mouseRadius) {
    this.orbitAngle += this.orbitSpeed * dt
    this.orbitCenterX += this.vx * dt * 0.016
    this.orbitCenterY += this.vy * dt * 0.016

    this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadiusX
    this.y = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadiusY

    if (mouseRadius > 0 && mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX
      const dy = this.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < mouseRadius && dist > 1) {
        const force = (1 - dist / mouseRadius) * 0.8
        const direction = dist < mouseRadius * 0.3 ? 1 : -0.3
        this.x += (dx / dist) * force * direction * 2
        this.y += (dy / dist) * force * direction * 2
      }
    }

    const margin = 100
    if (this.x < -margin) this.orbitCenterX = w + margin
    if (this.x > w + margin) this.orbitCenterX = -margin
    if (this.y < -margin) this.orbitCenterY = h + margin
    if (this.y > h + margin) this.orbitCenterY = -margin

    this.currentOpacity = this.opacity + Math.sin(Date.now() * 0.001 + this.pulseOffset) * 0.08
  }
}

// ─── Renderer ────────────────────────────────────────────────────
function renderFrame(ctx, nebulaCache, particles, w, h, mouseX, mouseY, config) {
  ctx.clearRect(0, 0, w, h)

  // Nebula desde caché (bitmap, sin crear gradientes por frame)
  if (nebulaCache) {
    ctx.drawImage(nebulaCache, 0, 0, w, h)
  }

  // Connections
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
        const boost = (a.isNode && b.isNode) ? 2.5 : (a.isNode || b.isNode) ? 1.5 : 1
        ctx.strokeStyle = `rgba(${CONFIG.colors.connection.join(',')}, ${alpha * boost})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  // Particles
  for (const p of particles) {
    const alpha = p.currentOpacity

    if (p.isNode) {
      const haloSize = p.size * 10
      const haloGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloSize)
      haloGrad.addColorStop(0, `rgba(${p.color.join(',')}, ${alpha * 0.3})`)
      haloGrad.addColorStop(0.3, `rgba(${p.color.join(',')}, ${alpha * 0.1})`)
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = haloGrad
      ctx.fillRect(p.x - haloSize, p.y - haloSize, haloSize * 2, haloSize * 2)
    }

    if (p.z > 0.5) {
      const softSize = p.size * 4
      const softGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, softSize)
      softGrad.addColorStop(0, `rgba(${p.color.join(',')}, ${alpha * 0.12})`)
      softGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = softGrad
      ctx.fillRect(p.x - softSize, p.y - softSize, softSize * 2, softSize * 2)
    }

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color.join(',')}, ${alpha})`
    ctx.fill()
  }

  // Cursor glow
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
  const nebulaCacheRef = useRef(null)
  const lastFrameTimeRef = useRef(0)

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

    // Pre-render nebula UNA VEZ
    nebulaCacheRef.current = buildNebulaCache(w, h)

    particlesRef.current = []
    for (let i = 0; i < config.particles; i++) {
      particlesRef.current.push(new Particle(w, h, config))
    }

    return { ctx, w, h, dpr }
  }, [])

  useEffect(() => {
    const reduced = prefersReducedMotion()
    let setup
    let initTimeout
    let running = true

    // ── Retrasar inicio 400ms para dejar pintar el LCP del texto ──
    initTimeout = setTimeout(() => {
      setup = init()
      if (!setup) return

      let { ctx, w, h } = setup

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

      let resizeTimer
      const onResize = () => {
        setup = init()
        if (setup) { ctx = setup.ctx; w = setup.w; h = setup.h }
      }
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(onResize, 200)
      })

      // ── Visibility & IntersectionObserver: pausar cuando el tab o viewport no es visible ──
      let isVisible = true
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting
        if (!isVisible) {
          cancelAnimationFrame(frameRef.current)
        } else if (running && !document.hidden) {
          lastFrameTimeRef.current = performance.now()
          frameRef.current = requestAnimationFrame(animate)
        }
      }, { threshold: 0.05 })

      if (canvasRef.current) {
        observer.observe(canvasRef.current)
      }

      const onVisibilityChange = () => {
        if (document.hidden || !isVisible) {
          cancelAnimationFrame(frameRef.current)
        } else if (running) {
          lastFrameTimeRef.current = performance.now()
          frameRef.current = requestAnimationFrame(animate)
        }
      }
      document.addEventListener('visibilitychange', onVisibilityChange)

      // ── Animation loop con 30fps cap ──────────────────────────
      const animate = (now) => {
        if (!running || !isVisible || document.hidden) return

        // Skip frames para mantener ~30fps
        if (now - lastFrameTimeRef.current < FRAME_BUDGET) {
          frameRef.current = requestAnimationFrame(animate)
          return
        }

        const dt = Math.min(now - lastFrameTimeRef.current, 50)
        lastFrameTimeRef.current = now

        const config = configRef.current
        const { x: mx, y: my } = mouseRef.current

        if (!reduced) {
          for (const p of particlesRef.current) {
            p.update(w, h, dt, mx, my, config.mouseRadius)
          }
        }

        renderFrame(ctx, nebulaCacheRef.current, particlesRef.current, w, h, mx, my, config)

        frameRef.current = requestAnimationFrame(animate)
      }

      lastFrameTimeRef.current = performance.now()
      frameRef.current = requestAnimationFrame(animate)

      // Cleanup inner
      return () => {
        running = false
        cancelAnimationFrame(frameRef.current)
        observer.disconnect()
        window.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        clearTimeout(resizeTimer)
      }
    }, CONFIG.initDelayMs)

    return () => {
      running = false
      clearTimeout(initTimeout)
      cancelAnimationFrame(frameRef.current)
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

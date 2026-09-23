import { useRef, useEffect, useCallback, useState } from 'react'

// ─── 3D Math Helpers ─────────────────────────────────────────────
function rotateX(p, cos, sin) {
  return [p[0], p[1] * cos - p[2] * sin, p[1] * sin + p[2] * cos]
}
function rotateY(p, cos, sin) {
  return [p[0] * cos + p[2] * sin, p[1], -p[0] * sin + p[2] * cos]
}
function rotateZ(p, cos, sin) {
  return [p[0] * cos - p[1] * sin, p[0] * sin + p[1] * cos, p[2]]
}

function project(p, cx, cy, fov) {
  const scale = fov / (fov + p[2])
  return { x: cx + p[0] * scale, y: cy + p[1] * scale, scale, z: p[2] }
}

// ─── Shape Generators ────────────────────────────────────────────
function getSpherePoints(n, radius) {
  const points = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = phi * i
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY
    points.push([x * radius, y * radius, z * radius])
  }
  return points
}

function getCubePoints(n, radius) {
  const points = []
  const side = radius * 0.9
  const perFace = Math.floor(n / 6)
  const faces = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
  ]
  faces.forEach((normal, fIdx) => {
    const count = fIdx === 5 ? n - points.length : perFace
    for (let i = 0; i < count; i++) {
      const u = (Math.random() - 0.5) * side * 2
      const v = (Math.random() - 0.5) * side * 2
      if (normal[0] !== 0) points.push([normal[0] * side, u, v])
      else if (normal[1] !== 0) points.push([u, normal[1] * side, v])
      else points.push([u, v, normal[2] * side])
    }
  })
  return points
}

function getTorusPoints(n, radius) {
  const points = []
  const R = radius * 0.7
  const r = radius * 0.35
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const theta = i * phi * 10
    const alpha = i * phi
    const x = (R + r * Math.cos(theta)) * Math.cos(alpha)
    const y = (R + r * Math.cos(theta)) * Math.sin(alpha)
    const z = r * Math.sin(theta)
    points.push([x, y, z])
  }
  return points
}

function getDNAPoints(n, radius) {
  const points = []
  const turns = 3
  const height = radius * 2.5
  for (let i = 0; i < n; i++) {
    const t = i / n
    const y = (t - 0.5) * height
    const angle = t * Math.PI * 2 * turns
    const strand = i % 2 === 0 ? 0 : Math.PI
    const x = Math.cos(angle + strand) * radius * 0.6
    const z = Math.sin(angle + strand) * radius * 0.6
    const ox = (Math.random() - 0.5) * radius * 0.2
    const oz = (Math.random() - 0.5) * radius * 0.2
    points.push([x + ox, y, z + oz])
  }
  return points
}

// ─── Particle System ─────────────────────────────────────────────
class Particle {
  constructor(x, y, z) {
    this.pos = [x, y, z]
    this.target = [x, y, z]
    this.vel = [0, 0, 0]
    this.baseColor = Math.random() > 0.15 ? [156, 58, 237] : [200, 180, 255]
    this.size = 0.8 + Math.random() * 1.5
    this.isHub = Math.random() > 0.95
  }

  setTarget(x, y, z) {
    this.target = [x, y, z]
  }

  update() {
    const tension = 0.015
    const damp = 0.88
    for (let i = 0; i < 3; i++) {
      const force = (this.target[i] - this.pos[i]) * tension
      this.vel[i] = (this.vel[i] + force) * damp
      this.pos[i] += this.vel[i]
    }
  }
}

const SHAPES = ['SPHERE', 'CUBE', 'TORUS', 'DNA']
const NUM_PARTICLES = 450      // Reducido de 800 → misma densidad visual
const TARGET_FPS = 30
const FRAME_BUDGET = 1000 / TARGET_FPS   // ~33ms
const SORT_EVERY_N_FRAMES = 5  // Ordenar solo cada 5 frames
const INIT_DELAY_MS = 500      // Esperar 500ms para dejar pintar el texto hero

// ─── Main Component ──────────────────────────────────────────────
export default function EntropixObject({ className = '' }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const [currentShape, setCurrentShape] = useState('SPHERE')

  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const baseRadius = Math.min(w, h) * 0.28

    const initialPoints = getSpherePoints(NUM_PARTICLES, baseRadius)
    const particles = initialPoints.map(p => new Particle(p[0], p[1], p[2]))

    return { ctx, w, h, baseRadius, particles }
  }, [])

  useEffect(() => {
    let setup
    let running = true
    let initTimeout
    let morphInterval
    let resizeTimer
    let onMouseDown, onMouseUp, onMouseMove, onMouseLeave

    initTimeout = setTimeout(() => {
      setup = init()
      if (!setup) return

      let { ctx, w, h, baseRadius, particles } = setup
      let shapeIndex = 0
      let isDragging = false

      onMouseDown = (e) => {
        if (e.target === canvasRef.current) {
          isDragging = true
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
          }
        }
      }
      onMouseUp = () => { isDragging = false }
      onMouseLeave = () => { isDragging = false }
      onMouseMove = (e) => {
        if (!isDragging) return
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      }

      window.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('mousemove', onMouseMove, { passive: true })
      canvasRef.current?.addEventListener('mouseleave', onMouseLeave)

      const onResize = () => {
        setup = init()
        if (setup) {
          ctx = setup.ctx; w = setup.w; h = setup.h
          baseRadius = setup.baseRadius; particles = setup.particles
        }
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

      // ── Morphing interval ─────────────────────────────────────
      morphInterval = setInterval(() => {
        if (!isVisible || document.hidden) return
        shapeIndex = (shapeIndex + 1) % SHAPES.length
        const shape = SHAPES[shapeIndex]
        setCurrentShape(shape)

        let newPoints = []
        if (shape === 'SPHERE') newPoints = getSpherePoints(particles.length, baseRadius)
        else if (shape === 'CUBE') newPoints = getCubePoints(particles.length, baseRadius)
        else if (shape === 'TORUS') newPoints = getTorusPoints(particles.length, baseRadius)
        else if (shape === 'DNA') newPoints = getDNAPoints(particles.length, baseRadius)

        newPoints.sort(() => Math.random() - 0.5)
        particles.forEach((p, i) => p.setTarget(newPoints[i][0], newPoints[i][1], newPoints[i][2]))
      }, 4500)

      const fov = 800

      // ── Animation loop con 30fps cap ──────────────────────────
      const animate = (now) => {
        if (!running || !isVisible || document.hidden) return

        // Skip frame si no han pasado ~33ms
        if (now - lastFrameTimeRef.current < FRAME_BUDGET) {
          frameRef.current = requestAnimationFrame(animate)
          return
        }
        lastFrameTimeRef.current = now
        frameCountRef.current++

        const t = now * 0.001

        // ── Cachear sin/cos UNA vez por frame (no 450 veces) ──
        const rotY_angle = t * 0.12 + mouseRef.current.x * 0.5
        const rotX_angle = t * 0.08 + mouseRef.current.y * 0.5
        const rotZ_angle = t * 0.03

        const cosY = Math.cos(rotY_angle), sinY = Math.sin(rotY_angle)
        const cosX = Math.cos(rotX_angle), sinX = Math.sin(rotX_angle)
        const cosZ = Math.cos(rotZ_angle), sinZ = Math.sin(rotZ_angle)

        // ── Pre-calcular cx / cy ──────────────────────────────
        const cx = w / 2
        const cy = h / 2

        ctx.clearRect(0, 0, w, h)

        // Background volumetric glow
        const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5)
        bgGlow.addColorStop(0, 'rgba(156, 58, 237, 0.08)')
        bgGlow.addColorStop(0.4, 'rgba(76, 41, 182, 0.04)')
        bgGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = bgGlow
        ctx.fillRect(0, 0, w, h)

        ctx.globalCompositeOperation = 'screen'

        const projected = []

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.update()

          // Usar cos/sin precalculados
          let v = rotateZ(p.pos, cosZ, sinZ)
          v = rotateX(v, cosX, sinX)
          v = rotateY(v, cosY, sinY)
          const proj = project(v, cx, cy, fov)
          projected.push({ ...proj, particle: p })
        }

        // ── Sort solo cada SORT_EVERY_N_FRAMES frames ──────────
        if (frameCountRef.current % SORT_EVERY_N_FRAMES === 0) {
          projected.sort((a, b) => b.z - a.z)
        }

        // Draw connections
        ctx.lineWidth = 0.5
        for (let i = 0; i < projected.length - 2; i += 2) {
          const pa = projected[i]
          const pb = projected[i + 1]

          const dx = pa.x - pb.x
          const dy = pa.y - pb.y
          if (dx * dx + dy * dy < 15000) {
            const depth = 1 - (pa.z / baseRadius + 0.5)
            const alpha = Math.max(0.04, Math.min(0.3, depth * 0.4))
            ctx.strokeStyle = `rgba(230, 210, 255, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(pa.x, pa.y)
            ctx.lineTo(pb.x, pb.y)
            ctx.stroke()
          }
        }

        // Draw particles
        for (const p of projected) {
          const depth = 1 - (p.z / baseRadius + 0.5)
          if (depth < 0) continue

          const alpha = Math.max(0.1, depth * 0.8)
          const size = p.particle.size * p.scale * (depth * 0.5 + 0.5)

          const [r, g, b] = p.particle.baseColor

          if (p.particle.isHub) {
            const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 6)
            glowGrad.addColorStop(0, `rgba(${r},${g},${b}, ${alpha})`)
            glowGrad.addColorStop(0.3, `rgba(${r},${g},${b}, ${alpha * 0.3})`)
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = glowGrad
            ctx.fillRect(p.x - size * 6, p.y - size * 6, size * 12, size * 12)
          }

          ctx.beginPath()
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b}, ${alpha})`
          ctx.fill()
        }

        ctx.globalCompositeOperation = 'source-over'

        frameRef.current = requestAnimationFrame(animate)
      }

      lastFrameTimeRef.current = performance.now()
      frameRef.current = requestAnimationFrame(animate)

      return () => {
        observer.disconnect()
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    }, INIT_DELAY_MS)

    return () => {
      running = false
      clearTimeout(initTimeout)
      clearInterval(morphInterval)
      cancelAnimationFrame(frameRef.current)
      if (onMouseDown) {
        window.removeEventListener('mousedown', onMouseDown)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('mousemove', onMouseMove)
      }
      clearTimeout(resizeTimer)
    }
  }, [init])

  return (
    <div className={`w-full h-full relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
        aria-hidden="true"
      />
    </div>
  )
}

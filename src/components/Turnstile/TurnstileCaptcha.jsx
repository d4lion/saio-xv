import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

// Clave pública de pruebas por defecto de Cloudflare (Pasa siempre automáticamente)
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'

const TurnstileCaptcha = forwardRef(function TurnstileCaptcha(
  {
    onVerify,
    onExpire,
    onError,
    siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY,
    theme = 'dark',
    className = '',
  },
  ref
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  // Guardar las funciones callback en un ref para evitar que los re-renders del formulario reinicien el widget
  const callbacksRef = useRef({ onVerify, onExpire, onError })
  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError }
  })

  // Exponer método reset a componentes padres a través de ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
          if (callbacksRef.current.onExpire) callbacksRef.current.onExpire()
        } catch (e) {
          console.error('Error reseteando Turnstile widget:', e)
        }
      }
    },
  }))

  useEffect(() => {
    let isMounted = true

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return

      // Si ya está renderizado el widget, no re-crearlo
      if (widgetIdRef.current !== null) {
        return
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          callback: (token) => {
            if (!isMounted) return
            if (callbacksRef.current.onVerify) callbacksRef.current.onVerify(token)
          },
          'expired-callback': () => {
            if (!isMounted) return
            if (callbacksRef.current.onExpire) callbacksRef.current.onExpire()
          },
          'error-callback': (errCode) => {
            if (!isMounted) return
            if (callbacksRef.current.onError) callbacksRef.current.onError(errCode)
          },
        })
        widgetIdRef.current = id
      } catch (err) {
        console.error('Error al renderizar Turnstile:', err)
      }
    }

    // Verificar si el script ya existe
    const scriptId = 'cf-turnstile-script'
    let script = document.getElementById(scriptId)

    if (window.turnstile) {
      renderWidget()
    } else {
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }

      const checkTurnstileInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstileInterval)
          if (isMounted) renderWidget()
        }
      }, 100)

      return () => {
        clearInterval(checkTurnstileInterval)
        isMounted = false
      }
    }

    return () => {
      isMounted = false
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignorar
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, theme])

  return (
    <div className={`w-full flex items-center justify-center my-2 ${className}`}>
      <div ref={containerRef} />
    </div>
  )
})

export default TurnstileCaptcha

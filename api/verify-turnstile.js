// Api Route para verificación de Cloudflare Turnstile Server-Side

async function getRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body)
      } catch {
        return {}
      }
    }
    return req.body
  }
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
  })
}

export default async function handler(req, res) {
  // Configurar encabezados CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    if (res.status) res.status(200).end()
    else {
      res.statusCode = 200
      res.end()
    }
    return
  }

  if (req.method !== 'POST') {
    const errorObj = { error: { reason: 'Método no permitido. Utilice POST.' } }
    if (res.status) return res.status(405).json(errorObj)
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify(errorObj))
  }

  try {
    const body = await getRequestBody(req)
    const { token } = body || {}

    if (!token) {
      const errorObj = { success: false, error: 'Token de Turnstile no proporcionado.' }
      if (res.status) return res.status(400).json(errorObj)
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(errorObj))
    }

    // Secret Key de Cloudflare Turnstile
    // Si no se especifica en variables de entorno, usamos el Secret de prueba oficial de Cloudflare que siempre valida como correcto en dev.
    const secretKey =
      process.env.TURNSTILE_SECRET_KEY ||
      process.env.VITE_TURNSTILE_SECRET_KEY ||
      '1x0000000000000000000000000000000AA'

    // Dirección IP del cliente
    const clientIp =
      req.headers?.['x-forwarded-for'] ||
      req.headers?.['x-real-ip'] ||
      req.socket?.remoteAddress ||
      ''

    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (clientIp) {
      formData.append('remoteip', String(clientIp).split(',')[0].trim())
    }

    const cloudflareRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    )

    const outcome = await cloudflareRes.json()

    if (outcome.success) {
      const successObj = {
        success: true,
        challenge_ts: outcome.challenge_ts,
        hostname: outcome.hostname,
      }
      if (res.status) return res.status(200).json(successObj)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(successObj))
    } else {
      console.warn('Fallo en la validación de Turnstile:', outcome['error-codes'])
      const failObj = {
        success: false,
        error: 'Verificación de seguridad fallida o expirada. Por favor, completa el captcha.',
        errorCodes: outcome['error-codes'] || [],
      }
      if (res.status) return res.status(400).json(failObj)
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(failObj))
    }
  } catch (err) {
    console.error('Error al servidor durante la verificación del Captcha Turnstile:', err)
    const errObj = {
      success: false,
      error: 'Error de servidor al validar la autenticidad del captcha.',
    }
    if (res.status) return res.status(500).json(errObj)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify(errObj))
  }
}

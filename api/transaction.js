export default async function handler(req, res) {
  // Configurar encabezados CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: { reason: 'Método no permitido. Utilice GET.' } })
  }

  // Parse Query Parameters
  let id = req.query?.id
  let env = req.query?.env

  // Fallback en caso de que req.query no esté procesado por el entorno
  if (!id && req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost')
      id = urlObj.searchParams.get('id')
      env = urlObj.searchParams.get('env')
    } catch {
      // ignorar error de parseo de url
    }
  }

  if (!id) {
    return res.status(400).json({ error: { reason: 'ID de transacción no proporcionado' } })
  }

  // Determinar entorno de Wompi
  const envParam = (env || '').toLowerCase().trim()
  const defaultEnv = (process.env.VITE_WOMPI_ENV || process.env.WOMPI_ENV || 'sandbox').toLowerCase().trim()

  const isProduction =
    envParam === 'production' ||
    envParam === 'prod' ||
    (!envParam && (defaultEnv === 'production' || defaultEnv === 'prod'))

  const baseUrl = isProduction
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'

  // Determinar Llave Privada de Wompi
  let privateKey = process.env.WOMPI_PRIVATE_KEY || process.env.VITE_WOMPI_PRIVATE_KEY

  if (isProduction) {
    privateKey =
      process.env.WOMPI_PRIVATE_KEY_PROD ||
      process.env.VITE_WOMPI_PRIVATE_KEY_PROD ||
      privateKey
  } else {
    privateKey =
      process.env.WOMPI_PRIVATE_KEY_SANDBOX ||
      process.env.WOMPI_PRIVATE_KEY_TEST ||
      process.env.VITE_WOMPI_PRIVATE_KEY_SANDBOX ||
      process.env.VITE_WOMPI_PRIVATE_KEY_TEST ||
      privateKey
  }

  if (!privateKey) {
    return res.status(500).json({
      error: {
        reason:
          'Llave privada de Wompi (WOMPI_PRIVATE_KEY) no configurada en las variables de entorno del servidor.',
      },
    })
  }

  try {
    const wompiRes = await fetch(
      `${baseUrl}/transactions/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${privateKey.trim()}`,
        },
      }
    )

    const data = await wompiRes.json()

    return res.status(wompiRes.status).json(data)
  } catch (err) {
    console.error('Error al consultar transacción en Wompi:', err)
    return res.status(500).json({
      error: {
        reason: err.message || 'Error de conexión al consultar la transacción en Wompi',
      },
    })
  }
}

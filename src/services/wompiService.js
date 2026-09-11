/**
 * Servicio de integración con la API pública de Wompi Colombia
 * Permite consultar el estado de transacciones en entornos Sandbox y Producción.
 */

const WOMPI_SANDBOX_BASE_URL = 'https://sandbox.wompi.co/v1'
const WOMPI_PRODUCTION_BASE_URL = 'https://production.wompi.co/v1'

/**
 * Determina la URL base de Wompi según el parámetro recibido o la variable de entorno
 * @param {string} [envParam] Parámetro 'env' opcional proveniente de la URL
 * @returns {string} URL base del API de Wompi
 */
export function getWompiBaseUrl(envParam) {
  const normalizedParam = (envParam || '').toLowerCase().trim()
  
  if (normalizedParam === 'production' || normalizedParam === 'prod') {
    return WOMPI_PRODUCTION_BASE_URL
  }

  if (normalizedParam === 'sandbox') {
    return WOMPI_SANDBOX_BASE_URL
  }

  // Si envParam es 'undefined', nulo o vacio, usaremos la variable de entorno global
  const defaultEnv = (import.meta.env.VITE_WOMPI_ENV || 'sandbox').toLowerCase().trim()
  
  if (defaultEnv === 'production' || defaultEnv === 'prod') {
    return WOMPI_PRODUCTION_BASE_URL
  }

  return WOMPI_SANDBOX_BASE_URL
}

/**
 * Consulta los detalles de una transacción en Wompi por su ID llamando al endpoint del servidor
 * @param {string} transactionId ID de transacción de Wompi
 * @param {string} [envParam] Parámetro de entorno de la URL (opcional: 'sandbox' o 'production')
 * @returns {Promise<Object>} Datos de la transacción devueltos por Wompi
 */
export async function getTransactionStatus(transactionId, envParam) {
  if (!transactionId) {
    throw new Error('ID de transacción no proporcionado')
  }

  const params = new URLSearchParams()
  params.set('id', transactionId)
  if (envParam) {
    params.set('env', envParam)
  }

  const url = `/api/transaction?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const message = errorData?.error?.reason || errorData?.message || `Error al consultar la transacción en Wompi (HTTP ${response.status})`
    throw new Error(message)
  }

  const result = await response.json()
  return result.data
}

export const wompiService = {
  getWompiBaseUrl,
  getTransactionStatus,
}

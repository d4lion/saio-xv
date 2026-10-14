/**
 * Límites de alimentación según el tipo de boleta.
 * Fuente única de verdad para el Dashboard (FoodTab) y el perfil del asistente (MiEntrada).
 */
export function getFoodLimits(ticketType) {
  const type = (ticketType || '').toLowerCase()
  const isSupernova = type.includes('supernova')
  const isEstrellaFugaz = type.includes('estrella fugaz')

  return {
    isSupernova,
    isEstrellaFugaz,
    // Boleta Estrella Fugaz: no incluye almuerzo. Supernova: 2. Resto: 1.
    maxAlmuerzos: isEstrellaFugaz ? 0 : isSupernova ? 2 : 1,
    // Boleta Estrella Fugaz: solo 2 refrigerios. El resto de boletas: 4.
    maxRefrigerios: isEstrellaFugaz ? 2 : 4,
  }
}

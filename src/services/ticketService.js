import { adminService } from './adminService';
import { telemetryService } from './telemetryService';
import { TICKETS_DATA } from '../constants/tickets';

export const ticketService = {
  /**
   * Obtiene todos los tickets activos desde Firestore o cae en fallback estático
   */
  async getActiveTickets() {
    try {
      const tickets = await adminService.getAllTickets();
      if (!tickets || tickets.length === 0) return TICKETS_DATA;
      const activeOnly = tickets.filter(t => t.activo !== false);
      return activeOnly.length > 0 ? activeOnly : TICKETS_DATA;
    } catch (e) {
      console.warn("Fallo al obtener boletas de Firestore, usando respaldo:", e);
      return TICKETS_DATA;
    }
  },

  /**
   * Captura la trazabilidad y metadata completa del usuario cuando hace clic en "Comprar boleta"
   */
  async trackTicketCheckoutClick(ticket, user = null) {
    try {
      const screenWidth = window.innerWidth || null;
      const screenHeight = window.innerHeight || null;
      const userAgent = navigator.userAgent || 'Desconocido';
      const language = navigator.language || 'Desconocido';
      
      let deviceType = 'Desktop';
      if (/Mobi|Android/i.test(userAgent)) {
        deviceType = 'Móvil';
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'Tablet';
      }

      const metadata = {
        ticketId: ticket.id || 'N/A',
        ticketName: ticket.name || 'Boleta',
        rawPrice: ticket.rawPrice || 0,
        currency: ticket.currency || 'COP',
        checkoutUrl: ticket.checkoutUrl || '#',
        deviceType,
        screenWidth,
        screenHeight,
        userAgent,
        language,
        referrer: document.referrer || 'Directo',
        timestamp: new Date().toISOString()
      };

      const logMessage = `Intento de compra de entrada [${ticket.name || ticket.id}] (${deviceType} - ${screenWidth}x${screenHeight})`;

      await telemetryService.logEvent({
        type: 'INFO',
        category: 'TICKET_CHECKOUT_CLICK',
        message: logMessage,
        userEmail: user?.email || 'Visitante Anónimo',
        uid: user?.uid || null,
        metadata,
        collectionName: 'tickets_telemetry_logs'
      });

      console.log('[Telemetry] Clic de checkout registrado con metadata en tickets_telemetry_logs:', metadata);
    } catch (err) {
      console.error('Error registrando trazabilidad de checkout:', err);
    }
  }
};

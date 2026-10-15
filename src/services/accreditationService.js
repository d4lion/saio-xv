import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { telemetryService } from './telemetryService';

const STORAGE_ACREDITACIONES_KEY = 'mock_acreditaciones_logs';

/**
 * Normaliza y extrae las reglas de acceso según el tipo de boleta.
 */
export function parseTicketRules(ticketType) {
  const raw = (ticketType || '').toLowerCase().trim();
  const isEstrellaFugaz = raw.includes('estrella fugaz');
  const isSupernova = raw.includes('supernova');
  const isOrbita = raw.includes('orbita') || raw.includes('órbita');
  const isVIP = raw.includes('vip');
  const isCortesia = raw.includes('cortesia') || raw.includes('cortesía');

  // Boleta Estrella Fugaz solo permite 1 de los 2 días.
  // Boleta Órbita, Boleta Supernova, VIP y Cortesía pueden asistir ambos días (15/10/2025 y 16/10/2025).
  const maxDaysAllowed = isEstrellaFugaz ? 1 : 2;

  let badgeColor = '#3b82f6';
  let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
  let categoryLabel = 'Acceso 2 Días';

  if (isEstrellaFugaz) {
    badgeColor = '#f59e0b';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    categoryLabel = 'Acceso 1 Día Único';
  } else if (isSupernova) {
    badgeColor = '#8b5cf6';
    badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
    categoryLabel = 'Acceso Total 2 Días';
  } else if (isVIP) {
    badgeColor = '#ec4899';
    badgeBg = 'bg-pink-50 text-pink-700 border-pink-200';
    categoryLabel = 'Acceso VIP 2 Días';
  }

  return {
    isEstrellaFugaz,
    isSupernova,
    isOrbita,
    isVIP,
    isCortesia,
    maxDaysAllowed,
    displayName: ticketType || 'No determinado',
    badgeColor,
    badgeBg,
    categoryLabel
  };
}

/**
 * Evalúa el estado de acreditación para ambos días (15/10 y 16/10).
 */
export function evaluateAccreditationStatus(user) {
  if (!user) return null;

  const ticketRules = parseTicketRules(user.boleta);
  const acreditacion = user.acreditacion || {};

  const dia1Record = acreditacion.dia1 && acreditacion.dia1.acreditado ? acreditacion.dia1 : null;
  const dia2Record = acreditacion.dia2 && acreditacion.dia2.acreditado ? acreditacion.dia2 : null;

  const dia1Acreditado = Boolean(dia1Record);
  const dia2Acreditado = Boolean(dia2Record);

  // Evaluación Día 1 (15/10/2025)
  let dia1Status = 'PENDIENTE'; // 'PENDIENTE' | 'ACREDITADO' | 'BLOQUEADO'
  let dia1Reason = '';
  if (dia1Acreditado) {
    dia1Status = 'ACREDITADO';
  } else if (ticketRules.isEstrellaFugaz && dia2Acreditado) {
    dia1Status = 'BLOQUEADO';
    dia1Reason = 'Bloqueado por restricción de Boleta Estrella Fugaz: El asistente ya utilizó su único día de acceso el Día 2 (16/10/2025).';
  }

  // Evaluación Día 2 (16/10/2025)
  let dia2Status = 'PENDIENTE'; // 'PENDIENTE' | 'ACREDITADO' | 'BLOQUEADO'
  let dia2Reason = '';
  if (dia2Acreditado) {
    dia2Status = 'ACREDITADO';
  } else if (ticketRules.isEstrellaFugaz && dia1Acreditado) {
    dia2Status = 'BLOQUEADO';
    dia2Reason = 'Bloqueado por restricción de Boleta Estrella Fugaz: El asistente ya utilizó su único día de acceso el Día 1 (15/10/2025). Prohibido permitir la entrada.';
  }

  // Alerta visible para el operador de logística
  const hasEstrellaFugazAlert = ticketRules.isEstrellaFugaz;
  let alertMessage = '';
  let alertSeverity = 'info';

  if (hasEstrellaFugazAlert) {
    if (dia1Acreditado) {
      alertSeverity = 'error';
      alertMessage = '⚠️ ATENCIÓN: El asistente tiene "Boleta Estrella Fugaz" (1 solo día) y YA INGRESÓ EL DÍA 1 (15/10/2025). El Día 2 (16/10/2025) está TERMINANTEMENTE BLOQUEADO.';
    } else if (dia2Acreditado) {
      alertSeverity = 'error';
      alertMessage = '⚠️ ATENCIÓN: El asistente tiene "Boleta Estrella Fugaz" (1 solo día) y YA INGRESÓ EL DÍA 2 (16/10/2025). Ya no cuenta con más ingresos disponibles.';
    } else {
      alertSeverity = 'warning';
      alertMessage = '⚠️ ATENCIÓN LOGÍSTICA: Boleta Estrella Fugaz válida para UN SOLO DÍA. Solo puede autorizarse el ingreso al 15/10/2025 O al 16/10/2025. Al acreditar uno de los dos días, el otro día quedará automáticamente bloqueado.';
    }
  }

  return {
    ticketRules,
    hasEstrellaFugazAlert,
    alertMessage,
    alertSeverity,
    dia1: {
      key: 'dia1',
      dateLabel: '15/10/2025',
      fullTitle: 'Día 1: Miércoles 15 de Octubre de 2025',
      status: dia1Status,
      acreditado: dia1Acreditado,
      record: dia1Record,
      reason: dia1Reason
    },
    dia2: {
      key: 'dia2',
      dateLabel: '16/10/2025',
      fullTitle: 'Día 2: Jueves 16 de Octubre de 2025',
      status: dia2Status,
      acreditado: dia2Acreditado,
      record: dia2Record,
      reason: dia2Reason
    }
  };
}

export const accreditationService = {
  /**
   * Busca a un asistente por Cédula, Correo, UID o resultado de lectura de QR.
   */
  async findAttendee(searchQuery) {
    if (!searchQuery) return null;
    let cleanQuery = String(searchQuery).trim();

    // Si viene una URL de QR de la app (ej: /mis-puntos?code=xyz o /mi-entrada?uid=xyz)
    try {
      if (cleanQuery.includes('http://') || cleanQuery.includes('https://') || cleanQuery.includes('?')) {
        const url = new URL(cleanQuery, window.location.origin);
        cleanQuery = url.searchParams.get('code') || 
                     url.searchParams.get('uid') || 
                     url.searchParams.get('id') || 
                     url.searchParams.get('cedula') || 
                     cleanQuery;
      }
    } catch (_) {}

    cleanQuery = cleanQuery.trim();
    if (!cleanQuery) return null;

    // 1. Intentar buscar en Firestore si está conectado
    if (db) {
      try {
        const usersRef = collection(db, 'users');

        // A. Cédula exacta
        const qCedula = query(usersRef, where('cedula', '==', cleanQuery));
        let snap = await getDocs(qCedula);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { uid: docSnap.id, id: docSnap.id, ...docSnap.data() };
        }

        // B. Cédula sanitizada (sin puntos o espacios)
        const sanitizedCedula = cleanQuery.replace(/[\.\s\-]/g, '');
        if (sanitizedCedula && sanitizedCedula !== cleanQuery) {
          const qSanitized = query(usersRef, where('cedula', '==', sanitizedCedula));
          snap = await getDocs(qSanitized);
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            return { uid: docSnap.id, id: docSnap.id, ...docSnap.data() };
          }
        }

        // C. UID directo
        const userDocRef = doc(db, 'users', cleanQuery);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          return { uid: userDocSnap.id, id: userDocSnap.id, ...userDocSnap.data() };
        }

        // D. Correo exacto (minúsculas)
        const lowerEmail = cleanQuery.toLowerCase();
        const qEmail = query(usersRef, where('correo', '==', lowerEmail));
        snap = await getDocs(qEmail);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { uid: docSnap.id, id: docSnap.id, ...docSnap.data() };
        }

        const qEmailAlt = query(usersRef, where('email', '==', lowerEmail));
        snap = await getDocs(qEmailAlt);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { uid: docSnap.id, id: docSnap.id, ...docSnap.data() };
        }
      } catch (err) {
        console.warn('Fallo al buscar asistente en Firestore, consultando almacenamiento local:', err);
      }
    }

    // 2. Fallback a mock_users en localStorage
    try {
      const rawUsers = localStorage.getItem('mock_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const lowerQuery = cleanQuery.toLowerCase();
        const sanitizedQuery = cleanQuery.replace(/[\.\s\-]/g, '');

        const found = users.find(u => 
          (u.cedula && String(u.cedula).trim() === cleanQuery) ||
          (u.cedula && String(u.cedula).replace(/[\.\s\-]/g, '') === sanitizedQuery) ||
          (u.uid && String(u.uid).trim() === cleanQuery) ||
          (u.id && String(u.id).trim() === cleanQuery) ||
          (u.correo && u.correo.toLowerCase() === lowerQuery) ||
          (u.email && u.email.toLowerCase() === lowerQuery)
        );

        if (found) {
          return { uid: found.uid || found.id, ...found };
        }
      }
    } catch (e) {
      console.error('Error buscando en mock_users:', e);
    }

    return null;
  },

  /**
   * Registra la acreditación de entrada de un usuario para un día específico (dia1 o dia2).
   */
  async registerAccreditation({ attendeeUid, dayKey, staffUser }) {
    if (!attendeeUid) throw new Error('Identificador de asistente inválido.');
    if (dayKey !== 'dia1' && dayKey !== 'dia2') {
      throw new Error('Día de acreditación no válido. Debe ser dia1 (15/10/2025) o dia2 (16/10/2025).');
    }

    // Obtener datos frescos del usuario
    const user = await this.findAttendee(attendeeUid);
    if (!user) throw new Error('El asistente no fue encontrado en la base de datos.');

    const evaluation = evaluateAccreditationStatus(user);
    const dayTarget = dayKey === 'dia1' ? evaluation.dia1 : evaluation.dia2;

    if (dayTarget.status === 'ACREDITADO') {
      throw new Error(`El asistente ya se encuentra acreditado para el ${dayTarget.dateLabel}.`);
    }

    if (dayTarget.status === 'BLOQUEADO') {
      throw new Error(dayTarget.reason || 'Ingreso bloqueado para esta fecha.');
    }

    const now = new Date();
    const record = {
      acreditado: true,
      dayKey,
      fechaDia: dayKey === 'dia1' ? '15/10/2025' : '16/10/2025',
      fechaHora: now.toISOString(),
      fechaFormateada: now.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      staffUid: staffUser?.uid || 'staff',
      staffEmail: staffUser?.email || staffUser?.correo || 'Staff Logística',
      staffNombre: staffUser?.nombre || staffUser?.displayName || 'Staff Logística'
    };

    // Actualizar en Firestore
    if (db) {
      try {
        const userRef = doc(db, 'users', attendeeUid);
        const updatePayload = {};
        updatePayload[`acreditacion.${dayKey}`] = record;
        await updateDoc(userRef, updatePayload);

        // Guardar registro histórico en colección acreditaciones
        const acreditacionLog = {
          attendeeUid,
          attendeeNombre: user.nombre || 'Asistente',
          attendeeCedula: user.cedula || 'N/A',
          attendeeCorreo: user.correo || user.email || 'N/A',
          boleta: user.boleta || 'No determinado',
          dayKey,
          fechaDia: record.fechaDia,
          fechaHora: record.fechaHora,
          fechaFormateada: record.fechaFormateada,
          staffUid: record.staffUid,
          staffEmail: record.staffEmail,
          staffNombre: record.staffNombre
        };

        await addDoc(collection(db, 'acreditaciones'), acreditacionLog);
      } catch (err) {
        console.warn('Error al actualizar Firestore para acreditación:', err);
      }
    }

    // Actualizar en mock_users (localStorage) si aplica
    try {
      const rawUsers = localStorage.getItem('mock_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const idx = users.findIndex(u => (u.uid === attendeeUid || u.id === attendeeUid));
        if (idx !== -1) {
          if (!users[idx].acreditacion) users[idx].acreditacion = {};
          users[idx].acreditacion[dayKey] = record;
          localStorage.setItem('mock_users', JSON.stringify(users));
        }
      }

      // Guardar también en logs locales de acreditación
      const rawLogs = localStorage.getItem(STORAGE_ACREDITACIONES_KEY);
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      logs.unshift({
        id: `acred-${Date.now()}`,
        attendeeUid,
        attendeeNombre: user.nombre || 'Asistente',
        attendeeCedula: user.cedula || 'N/A',
        attendeeCorreo: user.correo || user.email || 'N/A',
        boleta: user.boleta || 'No determinado',
        dayKey,
        fechaDia: record.fechaDia,
        fechaHora: record.fechaHora,
        fechaFormateada: record.fechaFormateada,
        staffEmail: record.staffEmail,
        staffNombre: record.staffNombre
      });
      localStorage.setItem(STORAGE_ACREDITACIONES_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Error guardando acreditación local:', e);
    }

    // Registrar evento de telemetría y auditoría
    try {
      await telemetryService.logEvent({
        type: 'SUCCESS',
        category: 'ACREDITACION',
        message: `Entrada registrada: ${user.nombre || 'Asistente'} (${user.cedula || 'Sin cédula'}) - ${record.fechaDia} - Boleta: ${user.boleta || 'N/A'}`,
        userEmail: record.staffEmail,
        uid: attendeeUid,
        metadata: {
          attendeeUid,
          attendeeNombre: user.nombre,
          attendeeCedula: user.cedula,
          dayKey,
          fechaDia: record.fechaDia,
          boleta: user.boleta,
          staffEmail: record.staffEmail
        }
      });
    } catch (_) {}

    // Retornar usuario con estado actualizado
    const updatedUser = {
      ...user,
      acreditacion: {
        ...(user.acreditacion || {}),
        [dayKey]: record
      }
    };

    return {
      success: true,
      record,
      updatedUser,
      evaluation: evaluateAccreditationStatus(updatedUser)
    };
  },

  /**
   * Anula una acreditación previa en caso de error administrativo.
   */
  async cancelAccreditation({ attendeeUid, dayKey, staffUser, reason }) {
    if (!attendeeUid || !dayKey) throw new Error('Datos insuficientes para anular la acreditación.');

    if (db) {
      try {
        const userRef = doc(db, 'users', attendeeUid);
        const updatePayload = {};
        updatePayload[`acreditacion.${dayKey}`] = null;
        await updateDoc(userRef, updatePayload);
      } catch (err) {
        console.warn('Error anulando acreditación en Firestore:', err);
      }
    }

    // Actualizar localStorage
    try {
      const rawUsers = localStorage.getItem('mock_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const idx = users.findIndex(u => (u.uid === attendeeUid || u.id === attendeeUid));
        if (idx !== -1 && users[idx].acreditacion) {
          users[idx].acreditacion[dayKey] = null;
          localStorage.setItem('mock_users', JSON.stringify(users));
        }
      }
    } catch (_) {}

    try {
      await telemetryService.logEvent({
        type: 'WARNING',
        category: 'ACREDITACION_ANULADA',
        message: `Acreditación anulada para asistente ${attendeeUid} en ${dayKey === 'dia1' ? '15/10/2025' : '16/10/2025'}. Motivo: ${reason || 'Corrección manual'}`,
        userEmail: staffUser?.email || 'Admin',
        uid: attendeeUid
      });
    } catch (_) {}

    const updatedUser = await this.findAttendee(attendeeUid);
    return {
      success: true,
      updatedUser,
      evaluation: evaluateAccreditationStatus(updatedUser)
    };
  },

  /**
   * Obtiene la lista de acreditaciones recientes para el feed en tiempo real.
   */
  async getRecentAccreditations(limitCount = 20) {
    if (db) {
      try {
        const q = query(collection(db, 'acreditaciones'), orderBy('fechaHora', 'desc'), limit(limitCount));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        if (list.length > 0) return list;
      } catch (e) {
        console.warn('No se pudieron leer acreditaciones de Firestore, usando fallback local:', e);
      }
    }

    try {
      const rawLogs = localStorage.getItem(STORAGE_ACREDITACIONES_KEY);
      if (rawLogs) {
        return JSON.parse(rawLogs).slice(0, limitCount);
      }
    } catch (_) {}

    return [];
  },

  /**
   * Obtiene estadísticas globales de acreditación.
   */
  async getStats() {
    let usersList = [];
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        snap.forEach((d) => usersList.push({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn('Error leyendo usuarios para stats de acreditación:', e);
      }
    }

    if (usersList.length === 0) {
      try {
        const raw = localStorage.getItem('mock_users');
        if (raw) usersList = JSON.parse(raw);
      } catch (_) {}
    }

    let dia1Count = 0;
    let dia2Count = 0;
    let estrellaFugazTotal = 0;
    let estrellaFugazAccredited = 0;
    let totalAsistentes = 0;

    usersList.forEach(u => {
      if (u.rol === 'admin' || u.rol === 'vendedor') return;
      totalAsistentes++;

      const b = (u.boleta || '').toLowerCase();
      const isEF = b.includes('estrella fugaz');
      if (isEF) estrellaFugazTotal++;

      const a = u.acreditacion || {};
      const d1 = a.dia1 && a.dia1.acreditado;
      const d2 = a.dia2 && a.dia2.acreditado;

      if (d1) dia1Count++;
      if (d2) dia2Count++;
      if (isEF && (d1 || d2)) estrellaFugazAccredited++;
    });

    return {
      totalAsistentes,
      dia1Count,
      dia2Count,
      estrellaFugazTotal,
      estrellaFugazAccredited
    };
  },

  /**
   * Obtiene todos los asistentes enriquecidos con su estado de acreditación
   * y métricas consolidadas para el módulo de análisis y seguimiento.
   */
  async getAllAttendeesWithStatus() {
    let usersList = [];
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        snap.forEach((d) => usersList.push({ uid: d.id, id: d.id, ...d.data() }));
      } catch (e) {
        console.warn('Error leyendo usuarios de Firestore para seguimiento:', e);
      }
    }

    if (usersList.length === 0) {
      try {
        const raw = localStorage.getItem('mock_users');
        if (raw) usersList = JSON.parse(raw);
      } catch (_) {}
    }

    // Filtrar solo usuarios relevantes para el evento (excluyendo administradores puros si no tienen boleta)
    const filteredList = usersList.filter(u => u.rol !== 'vendedor');

    let total = 0;
    let attendedAnyCount = 0;
    let attendedDia1Count = 0;
    let attendedDia2Count = 0;
    let attendedBothCount = 0;
    let notAttendedCount = 0;
    const byTicket = {};

    const attendees = filteredList.map((user) => {
      total++;
      const evaluation = evaluateAccreditationStatus(user);
      const dia1 = evaluation.dia1;
      const dia2 = evaluation.dia2;

      const hasAttendedDia1 = Boolean(dia1.acreditado);
      const hasAttendedDia2 = Boolean(dia2.acreditado);
      const hasAttendedAny = hasAttendedDia1 || hasAttendedDia2;
      const hasAttendedBoth = hasAttendedDia1 && hasAttendedDia2;
      const hasNotAttended = !hasAttendedAny;

      if (hasAttendedDia1) attendedDia1Count++;
      if (hasAttendedDia2) attendedDia2Count++;
      if (hasAttendedAny) attendedAnyCount++;
      if (hasAttendedBoth) attendedBothCount++;
      if (hasNotAttended) notAttendedCount++;

      const ticketName = user.boleta || 'No determinado';
      if (!byTicket[ticketName]) {
        byTicket[ticketName] = { total: 0, attended: 0, notAttended: 0 };
      }
      byTicket[ticketName].total++;
      if (hasAttendedAny) {
        byTicket[ticketName].attended++;
      } else {
        byTicket[ticketName].notAttended++;
      }

      let generalStatus = 'sin_ingresar';
      let generalStatusLabel = 'Sin Ingresar';
      if (hasAttendedBoth) {
        generalStatus = 'ambos_dias';
        generalStatusLabel = 'Ingresó Ambos Días';
      } else if (hasAttendedDia1) {
        generalStatus = 'ingreso_dia1';
        generalStatusLabel = 'Ingresó Día 1 (15/10)';
      } else if (hasAttendedDia2) {
        generalStatus = 'ingreso_dia2';
        generalStatusLabel = 'Ingresó Día 2 (16/10)';
      }

      return {
        ...user,
        evaluation,
        hasAttendedDia1,
        hasAttendedDia2,
        hasAttendedAny,
        hasAttendedBoth,
        hasNotAttended,
        generalStatus,
        generalStatusLabel
      };
    });

    const attendedAnyPct = total > 0 ? Math.round((attendedAnyCount / total) * 100) : 0;
    const notAttendedPct = total > 0 ? Math.round((notAttendedCount / total) * 100) : 0;
    const dia1Pct = total > 0 ? Math.round((attendedDia1Count / total) * 100) : 0;
    const dia2Pct = total > 0 ? Math.round((attendedDia2Count / total) * 100) : 0;

    return {
      attendees,
      summary: {
        total,
        attendedAnyCount,
        attendedAnyPct,
        notAttendedCount,
        notAttendedPct,
        attendedDia1Count,
        dia1Pct,
        attendedDia2Count,
        dia2Pct,
        attendedBothCount,
        byTicket
      }
    };
  },

  /**
   * Actualiza el teléfono de un asistente directamente desde el subpanel de seguimiento.
   */
  async updateAttendeePhone({ attendeeUid, phone }) {
    if (!attendeeUid) throw new Error('Identificador de asistente inválido.');
    const cleanPhone = String(phone || '').trim();

    if (db) {
      try {
        const userRef = doc(db, 'users', attendeeUid);
        await updateDoc(userRef, { telefono: cleanPhone });
      } catch (err) {
        console.warn('Error actualizando teléfono en Firestore:', err);
      }
    }

    try {
      const rawUsers = localStorage.getItem('mock_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const idx = users.findIndex(u => (u.uid === attendeeUid || u.id === attendeeUid));
        if (idx !== -1) {
          users[idx].telefono = cleanPhone;
          localStorage.setItem('mock_users', JSON.stringify(users));
        }
      }
    } catch (_) {}

    return { success: true, phone: cleanPhone };
  }
};

/**
 * Genera el enlace de WhatsApp con mensaje personalizado de logística.
 */
export function formatWhatsAppUrl(rawPhone, attendeeName, ticketName) {
  if (!rawPhone) return null;
  let clean = String(rawPhone).replace(/\D/g, '');
  if (!clean) return null;
  
  // En Colombia si tiene 10 dígitos y empieza por 3, anteponer 57
  if (clean.length === 10 && clean.startsWith('3')) {
    clean = '57' + clean;
  }

  const text = encodeURIComponent(
    `Hola ${attendeeName || 'estimado asistente'}, te saludamos de la coordinación de logística de SAIO-XV. Te contactamos para acompañarte en tu llegada al evento (${ticketName || 'tu entrada'}). ¿Tienes alguna duda o podemos ayudarte con las indicaciones para ingresar?`
  );

  return `https://wa.me/${clean}?text=${text}`;
}

/**
 * Genera el enlace telefónico estándar para llamada directa (tel:).
 */
export function formatCallUrl(rawPhone) {
  if (!rawPhone) return null;
  const clean = String(rawPhone).replace(/[^\d+]/g, '');
  return clean ? `tel:${clean}` : null;
}


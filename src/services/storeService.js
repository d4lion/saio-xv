import { db } from '../firebase/config';
import { telemetryService } from './telemetryService';
import { ROLES } from '../constants/roles';
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction 
} from 'firebase/firestore';

const DEFAULT_STORE_RULES = [
  { id: 'rule_1', nombre: 'Compra Básica', montoMinimo: 5000, montoMaximo: 15000, puntos: 50, activo: true },
  { id: 'rule_2', nombre: 'Compra Estándar', montoMinimo: 15001, montoMaximo: 30000, puntos: 150, activo: true },
  { id: 'rule_3', nombre: 'Compra Premium', montoMinimo: 30001, montoMaximo: 50000, puntos: 350, activo: true },
  { id: 'rule_4', nombre: 'Compra VIP', montoMinimo: 50001, montoMaximo: 100000, puntos: 750, activo: true },
  { id: 'rule_5', nombre: 'Compra Épica', montoMinimo: 100001, montoMaximo: 9999999, puntos: 1500, activo: true },
];

export const storeService = {
  /**
   * Obtiene las reglas de puntos por compras de la colección 'store_rules'.
   */
  async getStoreRules() {
    if (!db) return [];

    try {
      const rulesRef = collection(db, "store_rules");
      const querySnapshot = await getDocs(rulesRef);
      const rules = [];
      querySnapshot.forEach((docSnap) => {
        rules.push({ id: docSnap.id, ...docSnap.data() });
      });

      return rules.sort((a, b) => (a.montoMinimo || 0) - (b.montoMinimo || 0));
    } catch (err) {
      console.warn("Error al cargar reglas de tiendas de Firestore:", err);
      return [];
    }
  },

  /**
   * Crea o actualiza una regla de puntos por compras.
   */
  async saveStoreRule(ruleData) {
    if (!db) throw new Error("Firestore no está configurado.");
    const id = ruleData.id || `rule_${Date.now()}`;
    const ruleRef = doc(db, "store_rules", id);

    const payload = {
      nombre: ruleData.nombre || 'Regla de Compra',
      montoMinimo: Number(ruleData.montoMinimo) || 0,
      montoMaximo: Number(ruleData.montoMaximo) || 0,
      puntos: Number(ruleData.puntos) || 0,
      activo: ruleData.activo !== undefined ? ruleData.activo : true,
      updatedAt: new Date().toISOString()
    };

    await setDoc(ruleRef, payload, { merge: true });
    return { id, ...payload };
  },

  /**
   * Elimina una regla de puntos por compra.
   */
  async deleteStoreRule(ruleId) {
    if (!db) throw new Error("Firestore no está configurado.");
    const ruleRef = doc(db, "store_rules", ruleId);
    await deleteDoc(ruleRef);
  },

  /**
   * Calcula los puntos correspondientes a un monto dado según las reglas activas.
   */
  calculatePointsForAmount(amount, rules = []) {
    const numericAmount = Number(amount) || 0;
    if (numericAmount <= 0) return 0;

    const activeRules = rules.filter(r => r.activo);
    for (const rule of activeRules) {
      const min = Number(rule.montoMinimo) || 0;
      const max = Number(rule.montoMaximo) || 99999999;
      if (numericAmount >= min && numericAmount <= max) {
        return Number(rule.puntos) || 0;
      }
    }

    return 0;
  },

  /**
   * Busca a un asistente por Cédula, Correo o UID para acreditarle una compra.
   */
  async findAttendee(searchQuery) {
    if (!db) throw new Error("Firestore no está configurado.");
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return null;

    const usersRef = collection(db, "users");

    // 1. Buscar por Cédula exacta
    const qCedula = query(usersRef, where("cedula", "==", cleanQuery));
    let snap = await getDocs(qCedula);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    }

    // 2. Buscar por UID exacto
    const userDocRef = doc(db, "users", cleanQuery);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { uid: userDocSnap.id, ...userDocSnap.data() };
    }

    // 3. Buscar por Correo exacto
    const qEmail = query(usersRef, where("correo", "==", cleanQuery.toLowerCase()));
    snap = await getDocs(qEmail);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    }

    // 4. Búsqueda secundaria en caso de email alternativo
    const qEmailAlt = query(usersRef, where("email", "==", cleanQuery.toLowerCase()));
    snap = await getDocs(qEmailAlt);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    }

    return null;
  },

  /**
   * Procesar una venta realizada por una tienda en el evento.
   */
  async processStoreSale({ vendorUid, storeName, attendee, amount, pointsCalculated, paymentMethod }) {
    if (!db) throw new Error("Firestore no está configurado.");
    if (!attendee || !attendee.uid) throw new Error("No se especificó un asistente válido.");
    if (amount <= 0) throw new Error("El monto de la venta debe ser mayor a $0.");

    const userRef = doc(db, "users", attendee.uid);
    const salesRef = collection(db, "store_sales");
    const newSaleRef = doc(salesRef);

    const txPointsRef = collection(db, "points_transactions");
    const newTxRef = doc(txPointsRef);

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("El perfil del asistente no existe.");
      }

      const userData = userSnap.data();
      const currentPoints = userData.puntos || 0;
      const newPoints = currentPoints + pointsCalculated;

      // Actualizar puntos del asistente
      transaction.update(userRef, { puntos: newPoints });

      // Registrar venta de la tienda
      transaction.set(newSaleRef, {
        vendorUid: vendorUid || 'vendedor_sistema',
        storeName: storeName || 'Tienda SAIO-XV',
        attendeeUid: attendee.uid,
        attendeeNombre: userData.nombre || attendee.nombre || 'Asistente',
        attendeeCedula: userData.cedula || attendee.cedula || 'N/A',
        attendeeCorreo: userData.correo || userData.email || attendee.correo || 'N/A',
        montoCop: Number(amount),
        puntosOtorgados: Number(pointsCalculated),
        metodoPago: paymentMethod || 'Efectivo',
        fecha: new Date().toISOString()
      });

      // Registrar transacción de auditoría de puntos
      transaction.set(newTxRef, {
        uid: attendee.uid,
        code: `COMPRA_TIENDA_${newSaleRef.id}`,
        puntos: Number(pointsCalculated),
        fecha: new Date().toISOString(),
        tienda: storeName || 'Tienda SAIO-XV',
        montoCop: Number(amount),
        metodoPago: paymentMethod || 'Efectivo',
        transactionName: 'Compra en Tienda',
        transactionDescription: `Acumulación por compra en tienda (${paymentMethod || 'Efectivo'})`
      });
    });

    telemetryService.logSuccess('STORE_SALE', `Venta de $${amount.toLocaleString()} COP registrada en ${storeName}. +${pointsCalculated} pts a ${attendee.nombre || attendee.uid}.`, {
      vendorUid,
      attendeeUid: attendee.uid
    });

    return {
      saleId: newSaleRef.id,
      puntosOtorgados: pointsCalculated
    };
  },

  /**
   * Obtiene las ventas recientes realizadas por un vendedor/tienda.
   */
  async getVendorSalesHistory(vendorUid, limitCount = 20) {
    if (!db) return [];
    console.log(`[getVendorSalesHistory] Buscando ventas para el vendedor con UID: ${vendorUid}`);

    try {
      const salesRef = collection(db, "store_sales");
      const q = query(
        salesRef, 
        where("vendorUid", "==", vendorUid), 
        orderBy("fecha", "desc"), 
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      const sales = [];
      querySnapshot.forEach((docSnap) => {
        sales.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      console.log(`[getVendorSalesHistory] Búsqueda indexada exitosa. Ventas encontradas: ${sales.length}`);
      return sales;
    } catch (err) {
      console.warn("[getVendorSalesHistory] Consulta indexada de ventas falló. Puede que falte el índice compuesto en Firestore. Mensaje de error:", err.message);
      console.log("[getVendorSalesHistory] Iniciando búsqueda de respaldo en memoria...");
      try {
        const salesRef = collection(db, "store_sales");
        const querySnapshot = await getDocs(salesRef);
        const sales = [];
        let totalDocs = 0;
        
        querySnapshot.forEach((docSnap) => {
          totalDocs++;
          const data = docSnap.data();
          if (data.vendorUid === vendorUid) {
            sales.push({ id: docSnap.id, ...data });
          }
        });
        
        console.log(`[getVendorSalesHistory] Búsqueda en memoria finalizada. Documentos totales en store_sales: ${totalDocs}. Ventas del vendedor: ${sales.length}`);
        return sales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limitCount);
      } catch (err2) {
        console.error("[getVendorSalesHistory] Error al obtener historial de ventas en el respaldo:", err2);
        return [];
      }
    }
  }
};

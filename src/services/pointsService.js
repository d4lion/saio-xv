import { db } from '../firebase/config';
import { telemetryService } from './telemetryService';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  runTransaction,
  orderBy,
  limit
} from 'firebase/firestore';

// Calcular la distancia usando la fórmula de Haversine en kilómetros
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
}

export const pointsService = {
  /**
   * Valida y canjea un código de puntos para el usuario.
   * Envía las coordenadas de ubicación junto con la petición.
   */
  async claimCode(uid, code, coords) {
    if (!db) {
      throw new Error("Firestore no está configurado. Revisa tu archivo .env");
    }

    const uppercaseCode = code.trim().toUpperCase();

    // 1. Obtener la información del código en la colección "codes" en Firestore
    const codeRef = doc(db, "codes", uppercaseCode);
    const codeSnap = await getDoc(codeRef);

    let codeData = null;
    
    if (codeSnap.exists()) {
      codeData = codeSnap.data();
    } else {
      // MOCK FALLBACK: Permite pruebas locales antes de aprovisionar Firestore
      const mockCodes = {
        'SAIO100': { puntos: 100, activo: true, inicioDelCodigo: null, finDelCodigo: null },
        'VIP500': { puntos: 500, activo: true, inicioDelCodigo: null, finDelCodigo: null },
        'ENTROPIX': { 
          puntos: 1000, 
          activo: true, 
          inicioDelCodigo: "2026-01-01T00:00:00Z", 
          finDelCodigo: "2027-12-31T23:59:59Z" 
        },
        // Código de prueba de geolocalización lejana (Nueva York), que fallará si estás en otro lugar
        'STAND_FAR': {
          puntos: 0,
          activo: true,
          latitud: 40.7128,
          longitud: -74.0060,
          inicioDelCodigo: null,
          finDelCodigo: null
        }
      };
      
      if (mockCodes[uppercaseCode]) {
        codeData = mockCodes[uppercaseCode];
      } else {
        throw new Error("Código no encontrado o inválido.");
      }
    }

    // 1.5. Validar geolocalización por la fórmula de Haversine si el código requiere coordenadas
    let targetLat = undefined;
    let targetLng = undefined;

    const extractGeo = (obj) => {
      if (!obj) return null;
      
      // Caso 1: Array [lat, lng]
      if (Array.isArray(obj) && obj.length >= 2) {
        const first = parseFloat(obj[0]);
        const second = parseFloat(obj[1]);
        if (!isNaN(first) && !isNaN(second)) {
          return { lat: first, lng: second };
        }
      }
      
      // Caso 2: Objeto/Mapa con claves comunes
      const latVal = obj.latitud !== undefined ? obj.latitud : (obj.latitude !== undefined ? obj.latitude : obj.lat);
      const lngVal = obj.longitud !== undefined ? obj.longitud : (obj.longitude !== undefined ? obj.longitude : obj.lng);
      
      const parsedLat = parseFloat(latVal);
      const parsedLng = parseFloat(lngVal);
      
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return { lat: parsedLat, lng: parsedLng };
      }
      return null;
    };

    // Buscar en sub-propiedades comunes
    const geoSources = [
      codeData.coordenadas,
      codeData.ubicacion,
      codeData.location,
      codeData.gps,
      codeData.geo_restriccion
    ];

    for (const source of geoSources) {
      const result = extractGeo(source);
      if (result) {
        targetLat = result.lat;
        targetLng = result.lng;
        break;
      }
    }

    // Buscar en la raíz si no se encontró en sub-propiedades
    if (targetLat === undefined || targetLng === undefined) {
      const result = extractGeo(codeData);
      if (result) {
        targetLat = result.lat;
        targetLng = result.lng;
      }
    }

    // Fallback a ubicación fija del recinto del evento si no se especifican coordenadas en el código
    if (targetLat === undefined || targetLng === undefined) {
      targetLat = parseFloat(import.meta.env.VITE_EVENT_LAT) || 4.60971;
      targetLng = parseFloat(import.meta.env.VITE_EVENT_LNG) || -74.08175;
    }

    let computedDistance = undefined;

    if (targetLat !== undefined && targetLng !== undefined) {
      if (!coords || coords.latitude === undefined || coords.longitude === undefined) {
        throw new Error("Este código requiere validación por ubicación. Habilita tu GPS para continuar.");
      }

      computedDistance = calculateHaversineDistance(
        coords.latitude,
        coords.longitude,
        targetLat,
        targetLng
      );

      const maxDistanceKm = 2.0; // Radio máximo permitido en kilómetros
      if (computedDistance > maxDistanceKm) {
        throw new Error(`Estás demasiado lejos del stand o actividad para reclamar este código (Distancia calculada: ${computedDistance.toFixed(2)} km, Máximo permitido: ${maxDistanceKm} km).`);
      }
    }

    // 2. Validar si el código está activo
    if (!codeData.activo) {
      throw new Error("El código ya no está activo.");
    }

    // 3. Validar rango de horas (inicioDelCodigo y finDelCodigo)
    const now = new Date();
    if (codeData.inicioDelCodigo) {
      const startDate = new Date(codeData.inicioDelCodigo);
      if (now < startDate) {
        throw new Error(`El código no está disponible aún. Abre el: ${startDate.toLocaleString()}`);
      }
    }
    if (codeData.finDelCodigo) {
      const endDate = new Date(codeData.finDelCodigo);
      if (now > endDate) {
        throw new Error("El código ha caducado.");
      }
    }

    // 4. Verificar si el usuario ya canjeó este código
    const transactionsRef = collection(db, "points_transactions");
    const q = query(
      transactionsRef, 
      where("uid", "==", uid), 
      where("code", "==", uppercaseCode)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("Ya has reclamado los puntos de este código.");
    }

    // 5. Obtener los puntos actuales del usuario
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("El perfil del usuario no existe.");
    }
    const userData = userSnap.data();
    const currentPoints = userData.puntos || 0;
    const newPoints = currentPoints + codeData.puntos;

    // 6. Actualizar los puntos del usuario en su documento Firestore
    await updateDoc(userRef, {
      puntos: newPoints
    });

    // 7. Registrar la transacción en Firestore para auditoría
    await addDoc(transactionsRef, {
      uid,
      code: uppercaseCode,
      puntos: codeData.puntos,
      fecha: new Date().toISOString(),
      coordenadas: coords ? { 
        latitud: coords.latitude, 
        longitud: coords.longitude 
      } : null
    });

    telemetryService.logSuccess('QR_CODE', `Código QR ${uppercaseCode} canjeado exitosamente (+${codeData.puntos} pts).`, { uid });

    return {
      success: true,
      puntosReclamados: codeData.puntos,
      nuevosPuntos: newPoints,
      distancia: computedDistance
    };
  },

  /**
   * Obtiene el historial de transacciones de puntos para el usuario.
   */
  async getTransactionHistory(uid) {
    if (!db) return [];
    
    try {
      const transactionsRef = collection(db, "points_transactions");
      const q = query(transactionsRef, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar por fecha de más reciente a más antiguo
      return history.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (error) {
      console.error("Error al recuperar el historial:", error);
      return [];
    }
  },

  /**
   * Obtiene la lista de premios activos de Firestore.
   */
  async getActiveRewards() {
    if (!db) {
      return [
        { id: 'vip_access', title: 'Acceso VIP SAIO-XV', cost: 8000, desc: 'Entrada prioritaria y asientos preferenciales en los workshops del auditorio principal.', stock: 10 },
        { id: 'nfc_badge', title: 'Credencial Física NFC', cost: 12000, desc: 'Identificación física del evento equipada con chip NFC para intercambiar datos de contacto.', stock: 5 },
        { id: 'dev_hoodie', title: 'Hoddie Oficial SAIO-XV', cost: 20000, desc: 'Chaqueta de algodón de edición limitada con bordado premium de constelaciones.', stock: 2 },
        { id: 'digital_nft', title: 'NFT Conmemorativo', cost: 3000, desc: 'Coleccionable digital verificado de asistencia certificado en blockchain.', stock: 99 },
        { id: 'coffee_mug', title: 'Mug Térmico Metálico', cost: 5000, desc: 'Vaso térmico con grabado láser de SAIO-XV, ideal para el café durante las conferencias.', stock: 0 },
      ];
    }

    try {
      const rewardsRef = collection(db, "rewards");
      const q = query(rewardsRef, where("activo", "==", true));
      const querySnapshot = await getDocs(q);
      
      const rewards = [];
      querySnapshot.forEach((doc) => {
        rewards.push({ id: doc.id, ...doc.data() });
      });
      
      return rewards;
    } catch (error) {
      console.error("Error al cargar los premios:", error);
      return [];
    }
  },

  /**
   * Canjea un premio descontando los puntos y registrando la transacción.
   */
  async redeemReward(uid, rewardId, cost, title) {
    if (!db) {
      throw new Error("Firestore no está configurado. Revisa tu archivo .env");
    }

    const userRef = doc(db, "users", uid);
    const rewardRef = doc(db, "rewards", rewardId);
    const transactionsRef = collection(db, "points_transactions");
    const newTxRef = doc(transactionsRef);
    
    const claimsRef = collection(db, "claims");
    const newClaimRef = doc(claimsRef);

    // 1. Verificar duplicado ANTES de la transacción (los queries no corren dentro de transacciones)
    const checkQuery = query(
      transactionsRef, 
      where("uid", "==", uid), 
      where("code", "==", `CANJE_${rewardId}`)
    );
    const checkSnapshot = await getDocs(checkQuery);
    if (!checkSnapshot.empty) {
      throw new Error("Ya has reclamado este premio anteriormente.");
    }

    // 2. Ejecutar transacción para verificar puntos y stock de forma atómica
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("El perfil del usuario no existe.");
      }

      let rewardData = null;
      const rewardSnap = await transaction.get(rewardRef);
      
      if (rewardSnap.exists()) {
        rewardData = rewardSnap.data();
      } else {
        throw new Error("El premio no existe.");
      }

      // Validar Stock
      if (rewardData.stock !== undefined && rewardData.stock <= 0) {
        throw new Error("Este premio se encuentra agotado.");
      }

      // Validar Puntos
      const userData = userSnap.data();
      const currentPoints = userData.puntos || 0;
      if (currentPoints < cost) {
        throw new Error("Puntos estelares insuficientes.");
      }

      const newPoints = currentPoints - cost;

      // Actualizar puntos del usuario
      transaction.update(userRef, { puntos: newPoints });

      // Actualizar stock del premio (solo si existe el documento en Firestore)
      if (rewardSnap.exists() && rewardData.stock !== undefined) {
        transaction.update(rewardRef, { stock: rewardData.stock - 1 });
      }

      // Guardar transacción de puntos
      transaction.set(newTxRef, {
        uid,
        code: `CANJE_${rewardId}`,
        puntos: -cost,
        fecha: new Date().toISOString(),
        premioCanjeado: title,
        coordenadas: null
      });

      // Guardar ticket de canje único
      transaction.set(newClaimRef, {
        uid,
        nombre: userData.nombre || 'Sin nombre',
        correo: userData.correo || userData.email || '',
        telefono: userData.telefono || 'Sin teléfono',
        cedula: userData.cedula || 'N/A',
        rewardId,
        premio: title,
        costo: cost,
        fecha: new Date().toISOString(),
        estado: 'pendiente'
      });
    });

    telemetryService.logSuccess('REWARDS', `Premio "${title}" reclamado exitosamente (-${cost} pts).`, { uid });

    return {
      success: true
    };
  },

  /**
   * Obtiene la lista de tickets de canje activos de un asistente.
   */
  async getUserClaims(uid) {
    if (!db) return [];
    try {
      const claimsRef = collection(db, "claims");
      const q = query(claimsRef, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (error) {
      console.error("Error al obtener los tickets de canje:", error);
      return [];
    }
  },

  /**
   * Obtiene los usuarios ordenados por puntos de mayor a menor (Top 10).
   */
  async getLeaderboard(limitCount = 10) {
    if (!db) {
      // Mock local de prueba para desarrollo
      return [
        { uid: '1', nombre: 'Andrés Mendoza', puntos: 15400, rol: 'asistente' },
        { uid: '2', nombre: 'Camila Rojas', puntos: 12800, rol: 'asistente' },
        { uid: '3', nombre: 'Santiago Delgado', puntos: 11500, rol: 'asistente' },
        { uid: '4', nombre: 'Valeria Gómez', puntos: 9500, rol: 'asistente' },
        { uid: '5', nombre: 'Daniela Castro', puntos: 8200, rol: 'asistente' },
        { uid: '6', nombre: 'Mateo Ortiz', puntos: 7600, rol: 'asistente' },
        { uid: '7', nombre: 'Sofía Herrera', puntos: 5400, rol: 'asistente' },
        { uid: '8', nombre: 'Lucas Guerrero', puntos: 4300, rol: 'asistente' },
      ];
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("puntos", "desc"), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      const leaderboard = [];
      querySnapshot.forEach((doc) => {
        leaderboard.push({ uid: doc.id, ...doc.data() });
      });

      return leaderboard;
    } catch (error) {
      console.error("Error al obtener la tabla de posiciones:", error);
      try {
        // En caso de que falte crear el índice compuesto en Firestore, 
        // ordenamos en memoria para evitar colapsar la UI
        const allUsersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = [];
        allUsersSnapshot.forEach((doc) => {
          allUsers.push({ uid: doc.id, ...doc.data() });
        });
        return allUsers
          .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
          .slice(0, limitCount);
      } catch (err2) {
        console.error("Fallback en memoria fallido:", err2);
        return [];
      }
    }
  }
};

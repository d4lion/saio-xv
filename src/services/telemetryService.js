import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';

const STORAGE_KEY = 'mock_telemetry_logs';

const defaultInitialLogs = [
  {
    id: 'log-init-1',
    fecha: new Date(Date.now() - 120000).toISOString(),
    type: 'INFO',
    category: 'SYSTEM',
    message: 'Inicializando consola de administración SAIO-XV...',
    userEmail: 'sistema'
  },
  {
    id: 'log-init-2',
    fecha: new Date(Date.now() - 60000).toISOString(),
    type: 'SUCCESS',
    category: 'SYSTEM',
    message: 'Módulos de seguridad y telemetría cargados correctamente.',
    userEmail: 'sistema'
  },
  {
    id: 'log-init-3',
    fecha: new Date().toISOString(),
    type: 'INFO',
    category: 'FIREBASE',
    message: 'Conexión con almacenamiento de telemetría lista.',
    userEmail: 'sistema'
  }
];

const getLocalStorageLogs = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialLogs));
      return defaultInitialLogs;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Error al acceder a localStorage para telemetría:", e);
    return defaultInitialLogs;
  }
};

const saveLocalStorageLog = (logItem) => {
  try {
    const logs = getLocalStorageLogs();
    logs.unshift(logItem);
    const trimmed = logs.slice(0, 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (e) {
    console.error("Error al guardar log en localStorage:", e);
  }
};

export const telemetryService = {
  /**
   * Registra un evento de telemetría en Firestore (o localStorage si falla/desconectado)
   */
  async logEvent({ type = 'INFO', category = 'SYSTEM', message, userEmail = null, uid = null, metadata = null }) {
    const logItem = {
      fecha: new Date().toISOString(),
      type: type.toUpperCase(),
      category: category.toUpperCase(),
      message: message || '',
      userEmail: userEmail || null,
      uid: uid || null,
      metadata: metadata || null
    };

    if (!db) {
      console.warn("[Telemetry] Firestore 'db' no está listo. Guardando localmente.");
      const localId = 'local-log-' + Math.random().toString(36).substring(2, 9);
      saveLocalStorageLog({ id: localId, ...logItem });
      return { id: localId, ...logItem };
    }

    try {
      const logsRef = collection(db, "telemetry_logs");
      const docRef = await addDoc(logsRef, logItem);
      console.log("[Telemetry] Evento guardado con éxito en Firestore (ID:", docRef.id, ")");
      return { id: docRef.id, ...logItem, success: true };
    } catch (error) {
      console.error("[Telemetry ERROR] Falló al guardar en colección 'telemetry_logs' de Firestore:", error);
      const localId = 'local-log-' + Math.random().toString(36).substring(2, 9);
      saveLocalStorageLog({ id: localId, ...logItem });
      return { id: localId, ...logItem, error: error.message, success: false };
    }
  },

  logInfo(category, message, extra = {}) {
    return this.logEvent({ type: 'INFO', category, message, ...extra });
  },

  logSuccess(category, message, extra = {}) {
    return this.logEvent({ type: 'SUCCESS', category, message, ...extra });
  },

  logWarning(category, message, extra = {}) {
    return this.logEvent({ type: 'WARNING', category, message, ...extra });
  },

  logError(category, message, extra = {}) {
    return this.logEvent({ type: 'ERROR', category, message, ...extra });
  },

  /**
   * Obtiene logs de Firestore con fallback en memoria y localStorage
   */
  async getTelemetryLogs(limitCount = 100) {
    if (!db) {
      return getLocalStorageLogs().slice(0, limitCount);
    }

    try {
      const logsRef = collection(db, "telemetry_logs");
      let snap;
      try {
        const q = query(logsRef, orderBy("fecha", "desc"), limit(limitCount));
        snap = await getDocs(q);
      } catch (errOrder) {
        console.warn("[Telemetry] Consulta con orderBy falló, intentando consulta simple:", errOrder);
        snap = await getDocs(logsRef);
      }
      
      const logs = [];
      snap.forEach((d) => {
        logs.push({ id: d.id, ...d.data() });
      });

      logs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      return logs.slice(0, limitCount);
    } catch (e) {
      console.error("[Telemetry ERROR] Falló al consultar colección 'telemetry_logs':", e);
      return getLocalStorageLogs().slice(0, limitCount);
    }
  },

  /**
   * Se suscribe a actualizaciones en tiempo real de Firestore.
   */
  subscribeToTelemetryLogs(callback, limitCount = 100) {
    if (!db) {
      callback(getLocalStorageLogs().slice(0, limitCount));
      return () => {};
    }

    const logsRef = collection(db, "telemetry_logs");
    let q;

    try {
      q = query(logsRef, orderBy("fecha", "desc"), limit(limitCount));
    } catch (e) {
      q = logsRef;
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = [];
      snapshot.forEach((d) => {
        logs.push({ id: d.id, ...d.data() });
      });

      logs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      callback(logs.slice(0, limitCount));
    }, (error) => {
      console.warn("[Telemetry WARNING] Suscripción 'onSnapshot' ordenada falló. Probando consulta sin orderBy:", error);
      
      // Reintentar sin orderBy por si requiere índice o falla la ordenación nativa
      const unsubFallback = onSnapshot(logsRef, (snapSimple) => {
        const logs = [];
        snapSimple.forEach((d) => {
          logs.push({ id: d.id, ...d.data() });
        });
        logs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        callback(logs.slice(0, limitCount));
      }, (errSimple) => {
        console.error("[Telemetry ERROR] Fallo definitivo en Firestore onSnapshot:", errSimple);
        callback(getLocalStorageLogs().slice(0, limitCount));
      });

      return unsubFallback;
    });

    return unsubscribe;
  },

  /**
   * Probar manualmente el guardado en Firestore y retornar el resultado exacto
   */
  async testFirestoreConnection() {
    if (!db) {
      return { success: false, message: "Firestore 'db' no está inicializado. Revisa las variables de entorno en el archivo .env" };
    }
    try {
      const testDoc = {
        fecha: new Date().toISOString(),
        type: 'SUCCESS',
        category: 'SYSTEM',
        message: 'Prueba manual de escritura en Firestore (telemetry_logs)',
        userEmail: 'admin-test'
      };
      const logsRef = collection(db, "telemetry_logs");
      const res = await addDoc(logsRef, testDoc);
      return { success: true, id: res.id, message: `Documento creado exitosamente en Firestore (ID: ${res.id})` };
    } catch (error) {
      return { success: false, error: error.code || error.message, message: `Firestore denegó o falló la escritura: ${error.message}` };
    }
  },

  /**
   * Limpia el registro de telemetría de Firestore y localStorage
   */
  async clearTelemetryLogs() {
    localStorage.removeItem(STORAGE_KEY);

    if (!db) return;

    try {
      const logsRef = collection(db, "telemetry_logs");
      const snap = await getDocs(logsRef);
      const deletePromises = [];
      snap.forEach((d) => {
        deletePromises.push(deleteDoc(doc(db, "telemetry_logs", d.id)));
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("Error al limpiar telemetría de Firestore:", e);
    }
  }
};

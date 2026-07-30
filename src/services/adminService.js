import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'tu_api_key_aqui';

// MOCK INITIAL DATA FOR STORAGE FALLBACK
const defaultMockUsers = [
  { uid: '1', nombre: 'Andrés Mendoza', correo: 'andres@saio.com', cedula: '102030', puntos: 15400, rol: 'asistente', activo: true, fechaCreacion: new Date().toISOString() },
  { uid: '2', nombre: 'Camila Rojas', correo: 'camila@saio.com', cedula: '405060', puntos: 12800, rol: 'asistente', activo: true, fechaCreacion: new Date().toISOString() },
  { uid: '3', nombre: 'Santiago Delgado', correo: 'santiago@saio.com', cedula: '708090', puntos: 11500, rol: 'coordinador', activo: true, fechaCreacion: new Date().toISOString() },
  { uid: 'admin-id', nombre: 'Admin Global', correo: 'admin@saio.com', cedula: '999999', puntos: 0, rol: 'admin', activo: true, fechaCreacion: new Date().toISOString() }
];

const defaultMockCodes = [
  { id: 'SAIO100', puntos: 100, activo: true, inicioDelCodigo: null, finDelCodigo: null, coordenadas: null },
  { id: 'VIP500', puntos: 500, activo: true, inicioDelCodigo: null, finDelCodigo: null, coordenadas: { latitud: 4.60971, longitud: -74.08175 } },
  { id: 'ENTROPIX', puntos: 1000, activo: true, inicioDelCodigo: '2026-01-01T00:00:00Z', finDelCodigo: '2027-12-31T23:59:59Z', coordenadas: null }
];

const defaultMockTxs = [
  { id: 'tx-1', uid: '1', code: 'SAIO100', puntos: 100, fecha: new Date(Date.now() - 300000).toISOString(), coordenadas: null },
  { id: 'tx-2', uid: '2', code: 'VIP500', puntos: 500, fecha: new Date(Date.now() - 600000).toISOString(), coordenadas: { latitud: 4.60971, longitud: -74.08175 } }
];

const defaultMockRewards = [
  { id: 'vip_access', title: 'Acceso VIP SAIO-XV', cost: 8000, desc: 'Entrada prioritaria y asientos preferenciales en los workshops del auditorio principal.', stock: 10, activo: true },
  { id: 'nfc_badge', title: 'Credencial Física NFC', cost: 12000, desc: 'Identificación física del evento equipada con chip NFC para intercambiar datos de contacto.', stock: 5, activo: true },
  { id: 'dev_hoodie', title: 'Hoddie Oficial SAIO-XV', cost: 20000, desc: 'Chaqueta de algodón de edición limitada con bordado premium de constelaciones.', stock: 2, activo: true },
  { id: 'digital_nft', title: 'NFT Conmemorativo', cost: 3000, desc: 'Coleccionable digital verificado de asistencia certificado en blockchain.', stock: 99, activo: true }
];

const defaultMockGeneralTransactions = [
  {
    event: "transaction.updated",
    data: {
      transaction: {
        id: "11608115-1781936165-97594",
        created_at: "2026-06-20T06:16:05.819Z",
        finalized_at: "2026-06-20T06:16:11.528Z",
        amount_in_cents: 7000000,
        reference: "test_Bj99lR_1781936141_X9yR4XERF",
        customer_email: "test@gmail.com",
        currency: "COP",
        payment_method_type: "BANCOLOMBIA_TRANSFER",
        payment_method: {
          type: "BANCOLOMBIA_TRANSFER",
          extra: {
            is_three_ds: false,
            async_payment_url: "https://public-assets.wompi.com/sandbox_bancolombia_transfer/index.html?transaction_id=11608115-1781936165-97594&public_assets_url=https://public-assets.wompi.com&external_api_url=https://api-sandbox.wompi.co/v1&url_redirect=https://api-sandbox.wompi.co/v1/payment_methods/redirect/bancolombia_transfer?transferCode=b0994d97-64d8-456a-9be2-b8d21a13f51e&code_approved=APPROVED&code_declined=DECLINED&code_error=ERROR",
            three_ds_auth_type: null,
            external_identifier: "b0994d97-64d8-456a-9be2-b8d21a13f51e"
          },
          user_type: "PERSON",
          payment_description: "Generic payment description"
        },
        status: "APPROVED",
        status_message: "",
        shipping_address: null,
        redirect_url: "https://somepage.com",
        payment_source_id: null,
        payment_link_id: "test_Bj99lR",
        customer_data: {
          legal_id: "1234567890",
          device_id: "a82946b9eb835daefe69c946787072de",
          full_name: "Jhon Doe",
          browser_info: {
            browser_tz: "300",
            browser_language: "es-CO",
            browser_user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            browser_color_depth: "32",
            browser_screen_width: "2560",
            browser_screen_height: "1440"
          },
          phone_number: "+573991111111",
          legal_id_type: "CC",
          device_data_token: "eyJhbGciOiJIUzI1NiJ9.eyJjb21wcmVzc2VkIjoiZUp6TlZtMXoyamdRL2lzYWYwcG0zTVJnWTB6NkNYQkxjZ1hDSENScGV0UEp5TkxhNkxBdFY1WjVTYWIvL1ZZMm9TUzkzTnpId0F4WXo2NTJuMzJUL0dRdHRTNXVTbEQ5QkhKdFhWZ1QrU2pTbEo1M3poeHljaWR5TGpjbG1TNUl5emx6UGhJRWZPOGoyZnJlS2VrWFJRcDNFSDBSK3J6amRzOWNuNXg4dVZ4TXhqWkp4UXJJQ05oS25wTGhVc2tNemx0ZWo4eHBUSlhZSzF2MlM5OGgxZFM2ZUxJaWhSNUJJWlZtSitydG9ZYzFxRkxJSEVWbzdjd3hYNVRLRW9FOTAzcDVyTmVvY0ZnTEJyaWVEWEZGRlZzS0RVeFh5bUFZRElLUUp5STN5eVlpUkZLYUp4Vk5EQWJsaCtFMVFxS2N5RWlrQ01VMExjRUFDeHFsb0krQUVNcVZsb1Yxb1ZVRlAyMnJTS21PcGNvYWttNTdIM2VmTVNqMCtIY2ZPVjJMaEdxcFprb1dvTFNBY2lngrU5dWdaVnNiaUVialc4QmcxVEhYR3Y0VFlWRHdTMER1RFB3c05nays3QnhKbWFSQXJuSjJSazRtZ2lsWnlsaWZIdXNlbWV0UFIrTlBSM28yT1R5U0FTMEZJNDB5Q1pYQTVKTVRaK3ZVbjJCNFNrS2hNTmR1MkdxUmRmblFlWEJJVWYvWkpEVGdDNS96SlVVek05d2dtZ3EyWGR1S0ZmeW9JR2U3Zms3VFhkMGJYb0RHYlV1TERCNWxYYlorQmtvd2VqNlFpY1JHc3EyU0tZRDhUbkM5UkRNZDMzbUdMa0VrUzB4bnkvTU9XSWkxUURXM2JWdE15aFhtL0ZOdUNzdWJNbUl6U0ViVE9WWUZpL1ZLVkVKcHVQNjdFTnNTdHNERHdTdDhTUlhmVUFWRG1iTktLUk1kRnZpNVV5ZVFTWVZBeThmK0FaV0oya001cEJna0RvbFY0R0FVcHU1SHdyb2l4YkxKQm9kY29EUE1uY3cxenNkZjFwQ21JbElDb2NtYzNGeVJrZFJMd2N5U0tteGdZMndPaVFRakc5Y0orbTViVlFsOVBzRFlWNGNHNTNJcTlVSlJmw",
          customer_references: [
            {
              label: "Customer references 1",
              value: "test@proton.me"
            },
            {
              label: "Customer references 2",
              value: "1234567890"
            }
          ]
        },
        billing_data: null,
        origin: null
      }
    },
    sent_at: "2026-06-20T06:16:11.803Z",
    timestamp: 1781936171,
    signature: {
      checksum: "c0fdeefe5aeda016dc520d9c53248781fd5b44671b0f9a1ee2a30eb2881058f0",
      properties: [
        "transaction.id",
        "transaction.status",
        "transaction.amount_in_cents"
      ]
    },
    environment: "test"
  },
  {
    event: "transaction.updated",
    data: {
      transaction: {
        id: "11608115-1781936165-97595",
        created_at: "2026-06-21T10:15:30.000Z",
        finalized_at: "2026-06-21T10:15:35.000Z",
        amount_in_cents: 12000000,
        reference: "test_Ab44kL_1781936080_ghj2840",
        customer_email: "jane@gmail.com",
        currency: "COP",
        payment_method_type: "CREDIT_CARD",
        payment_method: {
          type: "CREDIT_CARD",
          extra: {
            is_three_ds: false,
            three_ds_auth_type: null,
            external_identifier: "CC-99881122"
          }
        },
        status: "APPROVED",
        customer_data: {
          legal_id: "987654321",
          full_name: "Jane Smith",
          phone_number: "",
          legal_id_type: "CC",
          browser_info: {
            browser_color_depth: "24",
            browser_language: "es-ES",
            browser_screen_height: "1080",
            browser_screen_width: "1920",
            browser_tz: "360",
            browser_user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
          }
        }
      }
    }
  },
  {
    event: "transaction.updated",
    data: {
      transaction: {
        id: "11608115-1781936165-97596",
        created_at: "2026-06-22T14:20:00.000Z",
        finalized_at: "2026-06-22T14:20:05.000Z",
        amount_in_cents: 5000000,
        reference: "test_Gz11tY_1781936090_plj44512",
        customer_email: "carlos@gmail.com",
        currency: "COP",
        payment_method_type: "NEQUI",
        payment_method: {
          type: "NEQUI",
          phone_number: "3113333333",
          extra: {
            external_identifier: "17819361021yVc45"
          }
        },
        status: "DECLINED",
        status_message: "Saldo insuficiente",
        customer_data: {
          legal_id: "11223344",
          full_name: "Carlos Gómez",
          phone_number: "+573113333333",
          legal_id_type: "CC"
        }
      }
    }
  }
];

// Helper functions for LocalStorage
const getLocalStorage = (key, defaultValue) => {
  const value = localStorage.getItem(key);
  if (!value) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(value);
};

const setLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const adminService = {
  // --- USERS MANAGEMENT ---
  async getAllUsers() {
    if (!db || !isConfigValid) {
      return getLocalStorage('mock_users', defaultMockUsers);
    }
    try {
      const usersRef = collection(db, "users");
      const snap = await getDocs(usersRef);
      const users = [];
      snap.forEach((d) => {
        users.push({ id: d.id, ...d.data() });
      });
      return users;
    } catch (e) {
      console.warn("Firestore error, falling back to mock users:", e);
      return getLocalStorage('mock_users', defaultMockUsers);
    }
  },

  async createUser(email, password, nombre, cedula, rol) {
    if (!db || !isConfigValid) {
      // Local implementation
      const users = getLocalStorage('mock_users', defaultMockUsers);
      const userExists = users.some(u => u.correo === email);
      if (userExists) throw new Error("El correo ya está registrado.");
      
      const newUid = 'local-uid-' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        uid: newUid,
        nombre,
        correo: email,
        cedula,
        puntos: 0,
        rol,
        activo: true,
        fechaCreacion: new Date().toISOString()
      };
      users.push(newUser);
      setLocalStorage('mock_users', users);
      return newUser;
    }

    // 1. Create credential user in Firebase Auth using a separate named app instance
    let tempApp;
    let tempAuth;
    let uid;
    try {
      // Avoid initializing if already exists
      const existingApps = getApps();
      const tempAppName = "TempAdminApp";
      tempApp = existingApps.find(app => app.name === tempAppName);
      if (!tempApp) {
        tempApp = initializeApp(firebaseConfig, tempAppName);
      }
      tempAuth = getAuth(tempApp);
      const userCred = await createUserWithEmailAndPassword(tempAuth, email, password);
      uid = userCred.user.uid;
      // Logout tempAuth to avoid keeping its session active
      await tempAuth.signOut();
    } catch (error) {
      throw new Error(`Error de autenticación Firebase: ${error.message}`);
    }

    // 2. Create the Firestore record for the user profile
    const userRef = doc(db, "users", uid);
    const newUserData = {
      uid,
      nombre,
      correo: email,
      cedula,
      puntos: 0,
      rol,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
    await setDoc(userRef, newUserData);
    return newUserData;
  },

  async updateUser(uid, data) {
    if (!db || !isConfigValid) {
      const users = getLocalStorage('mock_users', defaultMockUsers);
      const idx = users.findIndex(u => u.uid === uid);
      if (idx === -1) throw new Error("Usuario no encontrado.");
      users[idx] = { ...users[idx], ...data };
      setLocalStorage('mock_users', users);
      return;
    }
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
  },

  async deleteUser(uid) {
    if (!db || !isConfigValid) {
      const users = getLocalStorage('mock_users', defaultMockUsers);
      const filtered = users.filter(u => u.uid !== uid);
      setLocalStorage('mock_users', filtered);
      return;
    }
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  },

  // --- CODES MANAGEMENT ---
  async getAllCodes() {
    if (!db || !isConfigValid) {
      return getLocalStorage('mock_codes', defaultMockCodes);
    }
    try {
      const codesRef = collection(db, "codes");
      const snap = await getDocs(codesRef);
      const codes = [];
      snap.forEach((d) => {
        codes.push({ id: d.id, ...d.data() });
      });
      return codes;
    } catch (e) {
      console.warn("Firestore error, falling back to mock codes:", e);
      return getLocalStorage('mock_codes', defaultMockCodes);
    }
  },

  async createCode(codeId, data) {
    const uppercaseCode = codeId.trim().toUpperCase();
    if (!db || !isConfigValid) {
      const codes = getLocalStorage('mock_codes', defaultMockCodes);
      const exists = codes.some(c => c.id === uppercaseCode);
      if (exists) throw new Error("El código ya existe.");
      
      const newCode = {
        id: uppercaseCode,
        puntos: Number(data.puntos) || 0,
        activo: data.activo !== undefined ? data.activo : true,
        inicioDelCodigo: data.inicioDelCodigo || null,
        finDelCodigo: data.finDelCodigo || null,
        coordenadas: data.coordenadas || null
      };
      codes.push(newCode);
      setLocalStorage('mock_codes', codes);
      return newCode;
    }

    const codeRef = doc(db, "codes", uppercaseCode);
    const codeSnap = await getDoc(codeRef);
    if (codeSnap.exists()) {
      throw new Error("El código ya existe en Firestore.");
    }
    await setDoc(codeRef, {
      ...data,
      id: uppercaseCode,
      puntos: Number(data.puntos) || 0
    });
  },

  async updateCode(codeId, data) {
    if (!db || !isConfigValid) {
      const codes = getLocalStorage('mock_codes', defaultMockCodes);
      const idx = codes.findIndex(c => c.id === codeId);
      if (idx === -1) throw new Error("Código no encontrado.");
      codes[idx] = { ...codes[idx], ...data, puntos: Number(data.puntos) || 0 };
      setLocalStorage('mock_codes', codes);
      return;
    }
    const codeRef = doc(db, "codes", codeId);
    await updateDoc(codeRef, {
      ...data,
      puntos: Number(data.puntos) || 0
    });
  },

  async deleteCode(codeId) {
    if (!db || !isConfigValid) {
      const codes = getLocalStorage('mock_codes', defaultMockCodes);
      const filtered = codes.filter(c => c.id !== codeId);
      setLocalStorage('mock_codes', filtered);
      return;
    }
    const codeRef = doc(db, "codes", codeId);
    await deleteDoc(codeRef);
  },

  // --- TRANSACTIONS LOGS ---
  async getPointsTransactions() {
    if (!db || !isConfigValid) {
      return getLocalStorage('mock_pts_txs', defaultMockTxs);
    }
    try {
      const txRef = collection(db, "points_transactions");
      const snap = await getDocs(txRef);
      const txs = [];
      snap.forEach((d) => {
        txs.push({ id: d.id, ...d.data() });
      });
      return txs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (e) {
      console.warn("Firestore error, falling back to mock points transactions:", e);
      return getLocalStorage('mock_pts_txs', defaultMockTxs);
    }
  },

  async getGeneralTransactions() {
    if (!db || !isConfigValid) {
      return getLocalStorage('mock_general_transactions', defaultMockGeneralTransactions);
    }
    try {
      const txRef = collection(db, "transactions");
      const snap = await getDocs(txRef);
      const txs = [];
      snap.forEach((d) => {
        txs.push({ id: d.id, ...d.data() });
      });
      return txs.sort((a, b) => new Date(b.created_at || b.fecha || b.timestamp) - new Date(a.created_at || a.fecha || a.timestamp));
    } catch (e) {
      console.warn("Firestore error reading general transactions, falling back to mocks:", e);
      return getLocalStorage('mock_general_transactions', defaultMockGeneralTransactions);
    }
  },

  // --- REWARDS MANAGEMENT ---
  async getAllRewards() {
    if (!db || !isConfigValid) {
      return getLocalStorage('mock_rewards', defaultMockRewards);
    }
    try {
      const rewardsRef = collection(db, "rewards");
      const snap = await getDocs(rewardsRef);
      const rewards = [];
      snap.forEach((d) => {
        rewards.push({ id: d.id, ...d.data() });
      });
      return rewards;
    } catch (e) {
      console.warn("Firestore error, falling back to mock rewards:", e);
      return getLocalStorage('mock_rewards', defaultMockRewards);
    }
  },

  async createReward(rewardId, data) {
    const lowercaseId = rewardId.trim().toLowerCase();
    if (!db || !isConfigValid) {
      const rewards = getLocalStorage('mock_rewards', defaultMockRewards);
      const exists = rewards.some(r => r.id === lowercaseId);
      if (exists) throw new Error("El premio ya existe.");
      
      const newReward = {
        id: lowercaseId,
        title: data.title,
        cost: Number(data.cost) || 0,
        desc: data.desc || '',
        stock: Number(data.stock) || 0,
        activo: data.activo !== undefined ? data.activo : true
      };
      rewards.push(newReward);
      setLocalStorage('mock_rewards', rewards);
      return newReward;
    }

    const rewardRef = doc(db, "rewards", lowercaseId);
    const snap = await getDoc(rewardRef);
    if (snap.exists()) {
      throw new Error("El premio ya existe en Firestore.");
    }
    await setDoc(rewardRef, {
      title: data.title,
      cost: Number(data.cost) || 0,
      desc: data.desc || '',
      stock: Number(data.stock) || 0,
      activo: data.activo !== undefined ? data.activo : true
    });
  },

  async updateReward(rewardId, data) {
    if (!db || !isConfigValid) {
      const rewards = getLocalStorage('mock_rewards', defaultMockRewards);
      const idx = rewards.findIndex(r => r.id === rewardId);
      if (idx === -1) throw new Error("Premio no encontrado.");
      rewards[idx] = { 
        ...rewards[idx], 
        title: data.title,
        cost: Number(data.cost) || 0,
        desc: data.desc || '',
        stock: Number(data.stock) || 0,
        activo: data.activo !== undefined ? data.activo : true
      };
      setLocalStorage('mock_rewards', rewards);
      return;
    }
    const rewardRef = doc(db, "rewards", rewardId);
    await updateDoc(rewardRef, {
      title: data.title,
      cost: Number(data.cost) || 0,
      desc: data.desc || '',
      stock: Number(data.stock) || 0,
      activo: data.activo !== undefined ? data.activo : true
    });
  },

  async deleteReward(rewardId) {
    if (!db || !isConfigValid) {
      const rewards = getLocalStorage('mock_rewards', defaultMockRewards);
      const filtered = rewards.filter(r => r.id !== rewardId);
      setLocalStorage('mock_rewards', filtered);
      return;
    }
    const rewardRef = doc(db, "rewards", rewardId);
    await deleteDoc(rewardRef);
  },

  // --- CLAIMS MANAGEMENT ---
  async getAllClaims() {
    if (!db || !isConfigValid) {
      return getLocalStorage('mock_claims', []);
    }
    try {
      const claimsRef = collection(db, "claims");
      const snap = await getDocs(claimsRef);
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (e) {
      console.error("Error al obtener tickets de canje:", e);
      return [];
    }
  },

  async deliverClaim(claimId) {
    if (!db || !isConfigValid) {
      const claims = getLocalStorage('mock_claims', []);
      const idx = claims.findIndex(c => c.id === claimId);
      if (idx !== -1) {
        claims[idx].estado = 'entregado';
        setLocalStorage('mock_claims', claims);
      }
      return;
    }
    const claimRef = doc(db, "claims", claimId);
    await updateDoc(claimRef, { estado: 'entregado' });
  }
};

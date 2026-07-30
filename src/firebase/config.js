import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;

// Verificar que al menos la API Key esté presente y no sea la cadena de ejemplo
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'tu_api_key_aqui';

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    auth = null;
    db = null;
  }
} else {
  console.warn(
    "Firebase: Faltan las variables de entorno en el archivo .env. " +
    "Por favor configura tus claves de Firebase. El sistema de inicio de sesión no funcionará hasta entonces."
  );
  auth = null;
  db = null;
}

export { auth, db };
export default app;


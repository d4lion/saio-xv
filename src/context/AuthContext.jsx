/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { ROLES } from '../constants/roles';
import { telemetryService } from '../services/telemetryService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(!auth);
  const [loading, setLoading] = useState(!!auth);
  const isFirebaseConfigured = !!auth;

  // Registrar usuario (Autenticación + Creación en Firestore)
  async function register(email, password, additionalData) {
    if (!auth || !db) {
      throw new Error("Firebase o Firestore no están configurados. Por favor completa las variables de entorno en el archivo .env");
    }
    
    // 1. Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Crear el documento correspondiente en Firestore (sin guardar contraseña)
    const newProfile = {
      uid: user.uid,
      nombre: additionalData.nombre,
      correo: email,
      cedula: additionalData.cedula,
      telefono: additionalData.telefono || '',
      puntos: 0,
      rol: ROLES.ASISTENTE,
      fechaCreacion: new Date().toISOString()
    };

    await setDoc(doc(db, "users", user.uid), newProfile);
    setUserData(newProfile);
    setIsProfileLoaded(true);

    telemetryService.logSuccess('AUTH', `Nuevo usuario registrado: ${email}`, { userEmail: email, uid: user.uid });

    return userCredential;
  }

  // Iniciar sesión
  async function login(email, password) {
    if (!auth) {
      throw new Error("Firebase no está configurado. Por favor completa las variables de entorno en el archivo .env");
    }
    setLoading(true);
    setIsProfileLoaded(false);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      telemetryService.logInfo('AUTH', `Inicio de sesión exitoso: ${email}`, { userEmail: email });
      
      // Obtener el perfil directamente para tenerlo disponible de inmediato
      let profile = null;
      if (db) {
        try {
          const docSnap = await getDoc(doc(db, "users", res.user.uid));
          if (docSnap.exists()) {
            profile = docSnap.data();
            setUserData(profile);
          } else {
            profile = {};
            setUserData(profile);
          }
        } catch (dbErr) {
          console.error("Error al obtener perfil del usuario en Firestore:", dbErr);
          profile = {};
          setUserData(profile);
        }
      }
      setIsProfileLoaded(true);
      setLoading(false);
      return { user: res.user, userData: profile };
    } catch (err) {
      setLoading(false);
      setIsProfileLoaded(false);
      telemetryService.logError('AUTH', `Fallo al iniciar sesión (${email}): ${err.message}`, { userEmail: email });
      throw err;
    }
  }

  // Cerrar sesión
  async function logout() {
    if (!auth) {
      throw new Error("Firebase no está configurado. Por favor completa las variables de entorno en el archivo .env");
    }
    const email = currentUser?.email || 'usuario';
    const res = await signOut(auth);
    setCurrentUser(null);
    setUserData(null);
    setIsProfileLoaded(false);
    setLoading(false);
    telemetryService.logInfo('AUTH', `Cierre de sesión: ${email}`, { userEmail: email });
    return res;
  }

  useEffect(() => {
    if (!auth) {
      return;
    }

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        setLoading(true);
        if (db) {
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
          }
          // Escuchar cambios en tiempo real del perfil del usuario en Firestore
          unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              setUserData({});
            }
            setIsProfileLoaded(true);
            setLoading(false);
          }, (error) => {
            console.error("Error al escuchar cambios en el perfil del usuario:", error);
            setUserData({});
            setIsProfileLoaded(true);
            setLoading(false);
          });
        } else {
          setIsProfileLoaded(true);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setIsProfileLoaded(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Estado consolidado de carga: cargando auth o perfil pendiente por resolverse
  const isAuthLoading = loading || (!!currentUser && !isProfileLoaded);

  // Combinamos los datos de Auth y Firestore para exponer un único objeto de usuario
  const user = currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    ...userData,
    isProfileLoaded,
    rol: userData?.rol ? String(userData.rol).toLowerCase() : ROLES.ASISTENTE
  } : null;

  const value = {
    user,
    loading: isAuthLoading,
    isProfileLoaded,
    register,
    login,
    logout,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


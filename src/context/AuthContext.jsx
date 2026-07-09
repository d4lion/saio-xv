import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

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
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!!auth);

  // Registrar usuario (Autenticación + Creación en Firestore)
  async function register(email, password, additionalData) {
    if (!auth || !db) {
      throw new Error("Firebase o Firestore no están configurados. Por favor completa las variables de entorno en el archivo .env");
    }
    
    // 1. Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Crear el documento correspondiente en Firestore (sin guardar contraseña)
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      nombre: additionalData.nombre,
      correo: email,
      cedula: additionalData.cedula,
      puntos: 0,
      rol: "asistente",
      fechaCreacion: new Date().toISOString()
    });

    return userCredential;
  }

  // Iniciar sesión
  function login(email, password) {
    if (!auth) {
      return Promise.reject(new Error("Firebase no está configurado. Por favor completa las variables de entorno en el archivo .env"));
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Cerrar sesión
  function logout() {
    if (!auth) {
      return Promise.reject(new Error("Firebase no está configurado. Por favor completa las variables de entorno en el archivo .env"));
    }
    return signOut(auth);
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        if (db) {
          // Escuchar cambios en tiempo real del perfil del usuario en Firestore
          unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
            setLoading(false);
          }, (error) => {
            console.error("Error al escuchar cambios en el perfil del usuario:", error);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } else {
        setUserData(null);
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

  // Combinamos los datos de Auth y Firestore para exponer un único objeto de usuario
  const user = currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    ...userData
  } : null;

  const value = {
    user,
    loading,
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


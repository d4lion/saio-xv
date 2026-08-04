import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Shield, Mail, Calendar, Award, LogOut, CheckCircle, AlertCircle, Phone, LayoutDashboard } from 'lucide-react';
import UserNav from '../components/UserNav/UserNav';
import { ROLES } from '../constants/roles';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

// Configuración de SweetAlert2 con temática espacial
const themedSwal = Swal.mixin({
  background: '#0e0a34',
  color: '#e2e8f0',
  confirmButtonColor: '#9c3aed',
  cancelButtonColor: '#30227f',
  customClass: {
    popup: 'border border-purple-500/25 rounded-2xl shadow-2xl backdrop-blur-xl',
    title: 'font-heading font-bold text-white text-md tracking-wide',
    htmlContainer: 'text-secondary font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:opacity-90 transition-opacity outline-none ring-0',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/5 transition-colors outline-none ring-0'
  }
});

export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Local form states
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync state when user context changes
  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setCedula(user.cedula || '');
      setTelefono(user.telefono || '');
    }
  }, [user]);

  async function handleLogout() {
    const confirmResult = await themedSwal.fire({
      title: '¿Cerrar Sesión?',
      text: 'Saldrás del portal seguro del asistente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Salir',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newNombre = nombre.trim();
    const newTelefono = telefono.trim();

    if (!newNombre || !newTelefono) {
      return setError('Los campos Nombre y Teléfono no pueden estar vacíos.');
    }

    const updates = {};
    
    // Validar si el nombre cambia y no ha sido actualizado antes
    if (!user?.nombreActualizado && newNombre !== user?.nombre) {
      updates.nombre = newNombre;
      updates.nombreActualizado = true;
    }

    // Validar si el teléfono cambia y no ha sido actualizado antes
    if (!user?.telefonoActualizado && newTelefono !== user?.telefono) {
      updates.telefono = newTelefono;
      updates.telefonoActualizado = true;
    }

    if (Object.keys(updates).length === 0) {
      toast.info('Sin cambios: No has modificado ningún campo o ya los has actualizado anteriormente.');
      return;
    }

    const confirmResult = await themedSwal.fire({
      title: '¿Guardar Cambios?',
      text: 'Recuerda que el nombre y el teléfono solo pueden ser actualizados una vez.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setIsUpdating(true);
      if (db && user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, updates);
        
        toast.success('¡Perfil Actualizado! Tus datos se guardaron con éxito en Firestore.');
      } else {
        throw new Error("Base de datos no disponible.");
      }
    } catch (err) {
      console.error(err);
      toast.error('Error: Ocurrió un error al intentar guardar los datos en Firestore.');
    } finally {
      setIsUpdating(false);
    }
  }

  let parsedDate = null;
  if (user?.fechaCreacion) {
    if (typeof user.fechaCreacion.toDate === 'function') {
      parsedDate = user.fechaCreacion.toDate();
    } else {
      parsedDate = new Date(user.fechaCreacion);
    }
  }

  const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No registrada';

  const bothFieldsUpdated = user?.nombreActualizado && user?.telefonoActualizado;

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Nebulosas y efectos */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">Tu Perfil</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">SAIO-XV Asistente</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user?.rol === ROLES.ADMIN || user?.rol === ROLES.COORDINADOR) && (
              <Link
                to="/dashboard"
                className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-400/30 text-purple-200 hover:text-white font-heading text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-300 shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span>Ir al Dashboard</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-200 hover:text-white font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <UserNav />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6 z-20">
        {/* Banner con Puntos */}
        <section className="glass rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6" style={{ boxShadow: '0 0 30px rgba(156,58,237,0.1)' }}>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-heading font-extrabold text-white">
              {user?.nombre || 'Explorador Espacial'}
            </h2>
            <p className="text-secondary text-sm">
              Rol del Evento: <span className="text-accent font-semibold uppercase">{user?.rol || 'Asistente'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-primary/20 border border-muted/10 py-3 px-5 rounded-2xl glow-purple">
            <Award className="w-6 h-6 text-accent" />
            <div>
              <p className="text-[10px] text-secondary tracking-wider uppercase font-semibold">Puntos Acumulados</p>
              <p className="text-2xl font-heading font-extrabold text-white">{(user?.puntos || 0).toLocaleString()} PTS</p>
            </div>
          </div>
        </section>

        {/* Panel de Datos y Formulario */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ficha Informativa (Col 1) */}
          <div className="glass rounded-2xl p-6 border border-muted/15 space-y-6">
            <div className="border-b border-muted/10 pb-3">
              <h3 className="font-heading font-bold text-sm uppercase text-secondary tracking-wider">Credencial Estelar</h3>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 text-secondary-light">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] text-secondary uppercase font-semibold">Correo de Registro</p>
                  <p className="text-white font-mono break-all">{user?.correo || user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-secondary-light">
                <Calendar className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] text-secondary uppercase font-semibold">Miembro Desde</p>
                  <p className="text-white">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-secondary-light">
                <Shield className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] text-secondary uppercase font-semibold">UID de Identidad</p>
                  <p className="text-white font-mono">{user?.uid}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Edición (Col 2 y 3) */}
          <div className="glass rounded-2xl p-6 border border-muted/15 md:col-span-2 space-y-4">
            <div className="border-b border-muted/10 pb-3">
              <h3 className="font-heading font-bold text-sm uppercase text-secondary tracking-wider">Actualizar Datos</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Nombre Completo */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-primary-light/5 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-accent/30 font-sans ${user?.nombreActualizado ? 'cursor-not-allowed text-secondary/50 bg-black/20' : ''}`}
                    disabled={isUpdating || user?.nombreActualizado}
                  />
                </div>
                {user?.nombreActualizado && (
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    * El nombre ya ha sido actualizado anteriormente y no puede modificarse de nuevo.
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">
                  Teléfono / Móvil
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: +57 300 123 4567"
                    className={`w-full pl-10 pr-4 py-2.5 bg-primary-light/5 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-accent/30 font-sans ${user?.telefonoActualizado ? 'cursor-not-allowed text-secondary/50 bg-black/20' : ''}`}
                    disabled={isUpdating || user?.telefonoActualizado}
                  />
                </div>
                {user?.telefonoActualizado && (
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    * El teléfono ya ha sido actualizado anteriormente y no puede modificarse de nuevo.
                  </p>
                )}
              </div>

              {/* Cédula */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">
                  Cédula / Identificación (No Modificable)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <input
                    type="text"
                    value={cedula}
                    disabled={true}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/35 border border-muted/15 rounded-xl text-sm text-secondary/50 font-sans outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white text-xs font-semibold font-heading tracking-wider uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isUpdating || bothFieldsUpdated}
              >
                {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV. Creado por{' '}
        <a 
          href="https://www.adamind.cloud" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-secondary hover:text-white underline transition-colors duration-200"
        >
          Adamind Technologies
        </a>
      </footer>
    </div>
  );
}

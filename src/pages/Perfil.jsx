import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Shield, Mail, Calendar, Award, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

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
  const { user } = useAuth();
  
  // Local form states
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync state when user context changes
  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setCedula(user.cedula || '');
      setTelefono(user.telefono || '');
    }
  }, [user]);

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
        
        toast.success('¡Perfil Actualizado! Tus datos se guardaron con éxito.');
      } else {
        throw new Error("Base de datos no disponible.");
      }
    } catch (err) {
      console.error(err);
      toast.error('Error: Ocurrió un error al intentar guardar los datos.');
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
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-black text-white">Tu Perfil</h1>
          <p className="text-secondary text-sm">Gestiona tu información personal y credencial.</p>
        </div>
      </div>

      {/* Banner con Puntos */}
      <section className="glass rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10 shadow-[0_0_30px_rgba(156,58,237,0.1)] relative overflow-hidden bg-gradient-to-br from-purple-900/10 to-transparent">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
        <div className="space-y-1 text-center md:text-left relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tight">
            {user?.nombre || 'Explorador Espacial'}
          </h2>
          <p className="text-secondary text-sm tracking-wide">
            Rol del Evento: <span className="text-accent font-bold uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20 ml-2 inline-block mt-2 md:mt-0">{user?.rol || 'Asistente'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 border border-white/10 py-4 px-6 rounded-2xl glow-purple relative z-10 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-[10px] text-secondary tracking-[0.2em] uppercase font-bold mb-1">Puntos Acumulados</p>
            <p className="text-3xl font-heading font-black text-white leading-none">{(user?.puntos || 0).toLocaleString()} <span className="text-base text-accent">PTS</span></p>
          </div>
        </div>
      </section>

      {/* Panel de Datos y Formulario */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ficha Informativa (Col 1) */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/10 space-y-8 bg-black/20">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-heading font-black text-sm uppercase text-secondary tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Credencial Estelar
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent" /> Correo de Registro
              </p>
              <p className="text-white font-mono break-all bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:border-accent/30 transition-colors">
                {user?.correo || user?.email}
              </p>
            </div>

            <div className="group">
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Miembro Desde
              </p>
              <p className="text-white font-sans bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:border-accent/30 transition-colors">
                {formattedDate}
              </p>
            </div>

            <div className="group">
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent" /> UID de Identidad
              </p>
              <p className="text-white font-mono text-xs break-all bg-white/5 px-4 py-3 rounded-xl border border-white/5 group-hover:border-accent/30 transition-colors opacity-70">
                {user?.uid}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de Edición (Col 2 y 3) */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/10 lg:col-span-2 bg-black/20 flex flex-col">
          <div className="border-b border-white/5 pb-4 mb-8">
            <h3 className="font-heading font-black text-sm uppercase text-secondary tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              Actualizar Datos
            </h3>
            <p className="text-xs text-secondary mt-2">Puedes actualizar tu nombre y teléfono una única vez para el evento.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6 flex-1 flex flex-col">
            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-center gap-3 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm flex items-center gap-3 backdrop-blur-md">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block">
                  Nombre Completo
                </label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60 group-focus-within/input:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500/30 font-sans ${user?.nombreActualizado ? 'cursor-not-allowed text-secondary/50 bg-black/40' : ''}`}
                    disabled={isUpdating || user?.nombreActualizado}
                  />
                </div>
                {user?.nombreActualizado && (
                  <p className="text-[10px] text-amber-500/90 mt-2 font-medium">
                    * El nombre ya ha sido actualizado.
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block">
                  Teléfono / Móvil
                </label>
                <div className="relative group/input">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60 group-focus-within/input:text-purple-400 transition-colors" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: +57 300 123 4567"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500/30 font-sans ${user?.telefonoActualizado ? 'cursor-not-allowed text-secondary/50 bg-black/40' : ''}`}
                    disabled={isUpdating || user?.telefonoActualizado}
                  />
                </div>
                {user?.telefonoActualizado && (
                  <p className="text-[10px] text-amber-500/90 mt-2 font-medium">
                    * El teléfono ya ha sido actualizado.
                  </p>
                )}
              </div>
            </div>

            {/* Cédula */}
            <div className="space-y-2 max-w-md">
              <label className="text-xs font-heading font-bold text-secondary uppercase tracking-widest block">
                Identificación (Cédula)
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
                <input
                  type="text"
                  value={cedula}
                  disabled={true}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm text-secondary/40 font-sans outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <button
                type="submit"
                className="w-full md:w-auto py-3.5 px-8 rounded-full bg-white text-black hover:scale-[1.02] active:scale-[0.98] text-xs font-bold font-heading tracking-[0.2em] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                disabled={isUpdating || bothFieldsUpdated}
              >
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

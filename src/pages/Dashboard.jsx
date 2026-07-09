import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { ROLES } from '../constants/roles';
import Swal from 'sweetalert2';
import { 
  LogOut, Shield, Database, Cpu, User, Terminal, Settings, RefreshCw, 
  UserPlus, Plus, Edit, Trash2, Search, Clock, ShieldAlert, Key, 
  MapPin, Calendar, ToggleLeft, ToggleRight, X, Gift, Award, QrCode,
  CreditCard, Eye, Copy, ExternalLink
} from 'lucide-react';

const themedSwal = Swal.mixin({
  background: '#0e0a34',
  color: '#e2e8f0',
  confirmButtonColor: '#9c3aed',
  cancelButtonColor: '#30227f',
  customClass: {
    popup: 'border border-purple-500/25 rounded-2xl shadow-2xl backdrop-blur-xl',
    title: 'font-heading font-bold text-white text-md tracking-wide',
    htmlContainer: 'text-secondary font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:opacity-90 transition-opacity outline-none ring-0 mx-1',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer hover:bg-white/5 transition-colors outline-none ring-0 mx-1'
  }
});

// Helper to extract fields from flat or nested Wompi webhook structures
const extractTxFields = (p) => {
  if (!p) return {};
  
  // Wompi payloads wrap everything in data.transaction
  const t = p.data?.transaction || p;
  
  // customer_data might also be nested
  const cData = t.customer_data || {};
  
  return {
    id: t.id || p.id || 'N/A',
    created_at: t.created_at || t.fecha || t.timestamp || p.created_at || p.fecha || p.timestamp || null,
    finalized_at: t.finalized_at || p.finalized_at || null,
    amount_in_cents: t.amount_in_cents !== undefined ? t.amount_in_cents : p.amount_in_cents,
    currency: t.currency || p.currency || 'COP',
    reference: t.reference || p.reference || 'N/A',
    customer_email: t.customer_email || cData.customer_email || p.customer_email || 'N/A',
    payment_method_type: t.payment_method_type || t.payment_method?.type || p.payment_method_type || p.payment_method?.type || 'N/A',
    status: t.status || p.status || 'PENDING',
    status_message: t.status_message || p.status_message || '',
    payment_link_id: t.payment_link_id || p.payment_link_id || 'N/A',
    
    // Customer Details
    full_name: cData.full_name || t.full_name || p.full_name || 'N/A',
    legal_id: cData.legal_id || t.legal_id || p.legal_id || 'N/A',
    legal_id_type: cData.legal_id_type || t.legal_id_type || p.legal_id_type || 'CC',
    phone_number: cData.phone_number || t.phone_number || p.phone_number || 'N/A',
    
    // References
    customer_references: cData.customer_references || t.customer_references || p.customer_references || [],
    device_id: cData.device_id || t.device_id || p.device_id || 'N/A',
    device_data_token: cData.device_data_token || t.device_data_token || p.device_data_token || '',
    
    // Browser
    browser_info: cData.browser_info || t.browser_info || p.browser_info || {},
    
    // Payment Method
    payment_method: t.payment_method || p.payment_method || {}
  };
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.rol === ROLES.COORDINADOR ? 'codes' : 'telemetry'); // 'telemetry', 'users', 'codes', 'rewards', 'payments', 'logs'
  
  // Data lists
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Loaders
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Terminal activity logs
  const [terminalEvents, setTerminalEvents] = useState([
    `[${new Date().toLocaleTimeString()}] Inicializando consola de administración SAIO-XV...`,
    `[${new Date().toLocaleTimeString()}] Cargando módulos de seguridad y telemetría...`,
    `[${new Date().toLocaleTimeString()}] Conexión con base de datos establecida.`
  ]);

  // Search and filters
  const [userSearch, setUserSearch] = useState('');
  const [codeSearch, codeSearchSet] = useState('');
  const [rewardSearch, setRewardSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all'); // 'all', 'claim', 'redeem'

  // Modals state
  // Users
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create'); // 'create', 'edit'
  const [selectedUserUid, setSelectedUserUid] = useState(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    correo: '',
    cedula: '',
    puntos: 0,
    rol: ROLES.ASISTENTE,
    password: ''
  });

  // Codes
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeModalMode, setCodeModalMode] = useState('create'); // 'create', 'edit'
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [codeForm, setCodeForm] = useState({
    id: '',
    puntos: 100,
    activo: true,
    inicioDelCodigo: '',
    finDelCodigo: '',
    latitud: '',
    longitud: ''
  });

  // QR Preview Modal
  const [showQrPreviewModal, setShowQrPreviewModal] = useState(false);
  const [previewCode, setPreviewCode] = useState(null);

  // Rewards
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardModalMode, setRewardModalMode] = useState('create'); // 'create', 'edit'
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    id: '',
    title: '',
    cost: 1000,
    desc: '',
    stock: 10,
    activo: true
  });

  // Payments Detailed modal
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch all data
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudieron cargar los usuarios: ${e.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCodes = async () => {
    setLoadingCodes(true);
    try {
      const data = await adminService.getAllCodes();
      setCodes(data);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudieron cargar los códigos: ${e.message}`);
    } finally {
      setLoadingCodes(false);
    }
  };

  const fetchRewards = async () => {
    setLoadingRewards(true);
    try {
      const data = await adminService.getAllRewards();
      setRewards(data);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudieron cargar los premios: ${e.message}`);
    } finally {
      setLoadingRewards(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await adminService.getGeneralTransactions();
      setPayments(data);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudieron cargar los pagos: ${e.message}`);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const ptsTxs = await adminService.getPointsTransactions();
      setLogs(ptsTxs);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudo recuperar el historial de transacciones: ${e.message}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const addTerminalEvent = (text) => {
    const time = new Date().toLocaleTimeString();
    setTerminalEvents(prev => [...prev, `[${time}] ${text}`]);
  };

  // Refresh all data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    addTerminalEvent("Iniciando sincronización completa con Firestore...");
    const promises = [fetchCodes(), fetchRewards()];
    if (user?.rol === ROLES.ADMIN) {
      promises.push(fetchUsers(), fetchPayments(), fetchLogs());
    }
    await Promise.all(promises);
    addTerminalEvent("Sincronización finalizada exitosamente.");
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      if (user.rol === ROLES.ADMIN) {
        fetchUsers();
        fetchPayments();
        fetchLogs();
      }
      fetchCodes();
      fetchRewards();
      if (user.rol === ROLES.COORDINADOR) {
        setActiveTab('codes');
      }
    }
  }, [user]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  }

  // --- USER HANDLERS ---
  const handleOpenCreateUser = () => {
    setUserForm({
      nombre: '',
      correo: '',
      cedula: '',
      puntos: 0,
      rol: ROLES.ASISTENTE,
      password: ''
    });
    setUserModalMode('create');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u) => {
    setUserForm({
      nombre: u.nombre || '',
      correo: u.correo || '',
      cedula: u.cedula || '',
      puntos: u.puntos || 0,
      rol: u.rol || ROLES.ASISTENTE,
      password: ''
    });
    setSelectedUserUid(u.uid);
    setUserModalMode('edit');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (Number(userForm.puntos) < 0) {
        throw new Error("Los puntos no pueden ser negativos.");
      }

      if (userModalMode === 'create') {
        if (!userForm.password || userForm.password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
        addTerminalEvent(`Creando usuario en Firebase Auth y Firestore: ${userForm.correo}...`);
        await adminService.createUser(
          userForm.correo,
          userForm.password,
          userForm.nombre,
          userForm.cedula,
          userForm.rol
        );
        addTerminalEvent(`Usuario creado exitosamente: ${userForm.correo}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Usuario Creado',
          text: `El usuario ${userForm.nombre} ha sido registrado.`
        });
      } else {
        addTerminalEvent(`Actualizando datos del usuario: ${userForm.nombre} (UID: ${selectedUserUid})...`);
        await adminService.updateUser(selectedUserUid, {
          nombre: userForm.nombre,
          cedula: userForm.cedula,
          puntos: Number(userForm.puntos),
          rol: userForm.rol
        });
        addTerminalEvent(`Usuario actualizado exitosamente: ${userForm.nombre}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Usuario Actualizado',
          text: `Se actualizaron los datos de ${userForm.nombre}.`
        });
      }
      setShowUserModal(false);
      fetchUsers();
      fetchLogs();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error de Guardado',
        text: err.message || 'Ocurrió un error al procesar el usuario.'
      });
    }
  };

  const handleToggleUserStatus = async (u) => {
    const newStatus = !u.activo;
    try {
      addTerminalEvent(`Cambiando estado de actividad del usuario: ${u.nombre} a ${newStatus ? 'ACTIVO' : 'INACTIVO'}...`);
      await adminService.updateUser(u.uid, { activo: newStatus });
      addTerminalEvent(`Estado de ${u.nombre} actualizado a ${newStatus ? 'ACTIVO' : 'INACTIVO'}.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado de actividad.'
      });
    }
  };

  const handleDeleteUser = async (u) => {
    const confirm = await themedSwal.fire({
      icon: 'warning',
      title: '¿Eliminar Usuario?',
      text: `¿Estás seguro de que deseas eliminar permanentemente a ${u.nombre}? Esta acción solo eliminará el perfil de Firestore.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      addTerminalEvent(`Eliminando perfil del usuario: ${u.nombre} (UID: ${u.uid})...`);
      await adminService.deleteUser(u.uid);
      addTerminalEvent(`Perfil eliminado de Firestore: ${u.nombre}`);
      themedSwal.fire({
        icon: 'success',
        title: 'Usuario Eliminado',
        text: 'El perfil de Firestore ha sido removido con éxito.'
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo eliminar el usuario.'
      });
    }
  };

  // --- CODE HANDLERS ---
  const handleOpenCreateCode = () => {
    setCodeForm({
      id: '',
      puntos: 100,
      activo: true,
      inicioDelCodigo: '',
      finDelCodigo: '',
      latitud: '',
      longitud: ''
    });
    setCodeModalMode('create');
    setShowCodeModal(true);
  };

  const handleOpenEditCode = (c) => {
    let latVal = '';
    let lngVal = '';
    if (c.coordenadas) {
      latVal = c.coordenadas.latitud !== undefined ? c.coordenadas.latitud : (c.coordenadas.latitude || '');
      lngVal = c.coordenadas.longitud !== undefined ? c.coordenadas.longitud : (c.coordenadas.longitude || '');
    }
    
    setCodeForm({
      id: c.id,
      puntos: c.puntos || 0,
      activo: c.activo !== undefined ? c.activo : true,
      inicioDelCodigo: c.inicioDelCodigo || '',
      finDelCodigo: c.finDelCodigo || '',
      latitud: latVal,
      longitud: lngVal
    });
    setSelectedCodeId(c.id);
    setCodeModalMode('edit');
    setShowCodeModal(true);
  };

  const handleCaptureGps = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      themedSwal.fire({
        icon: 'error',
        title: 'GPS No Soportado',
        text: 'La geolocalización no está disponible en este navegador.'
      });
      setGpsLoading(false);
      return;
    }
    addTerminalEvent("Solicitando ubicación actual al GPS del navegador...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setCodeForm(prev => ({
          ...prev,
          latitud: lat,
          longitud: lng
        }));
        setGpsLoading(false);
        addTerminalEvent(`Coordenadas de GPS capturadas con éxito: Lat ${lat}, Lng ${lng}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Ubicación Capturada',
          text: `Coordenadas: Lat ${lat}, Lng ${lng}`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        addTerminalEvent(`[ERROR] Error al capturar GPS: ${error.message}`);
        themedSwal.fire({
          icon: 'error',
          title: 'Fallo al Capturar GPS',
          text: 'No se pudo obtener la ubicación. Por favor concede los permisos e inténtalo de nuevo.'
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveCode = async (e) => {
    e.preventDefault();

    try {
      if (Number(codeForm.puntos) < 0) {
        throw new Error("Los puntos asignados no pueden ser negativos.");
      }

      let coordData = null;
      if (codeForm.latitud && codeForm.longitud) {
        coordData = {
          latitud: Number(codeForm.latitud),
          longitud: Number(codeForm.longitud)
        };
      }

      const payload = {
        puntos: Number(codeForm.puntos),
        activo: codeForm.activo,
        inicioDelCodigo: codeForm.inicioDelCodigo || null,
        finDelCodigo: codeForm.finDelCodigo || null,
        coordenadas: coordData
      };

      if (codeModalMode === 'create') {
        if (!codeForm.id.trim()) throw new Error("Debes especificar un ID/Nombre para el código.");
        const uppercaseId = codeForm.id.trim().toUpperCase();
        addTerminalEvent(`Registrando código de puntos: ${uppercaseId}...`);
        await adminService.createCode(uppercaseId, payload);
        addTerminalEvent(`Código de puntos creado: ${uppercaseId}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Código Creado',
          text: `El código ${uppercaseId} ha sido creado con éxito.`
        });
      } else {
        addTerminalEvent(`Actualizando parámetros del código: ${selectedCodeId}...`);
        await adminService.updateCode(selectedCodeId, payload);
        addTerminalEvent(`Código actualizado: ${selectedCodeId}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Código Modificado',
          text: `Los parámetros de ${selectedCodeId} fueron actualizados.`
        });
      }
      setShowCodeModal(false);
      fetchCodes();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error al Guardar Código',
        text: err.message || 'No se pudo guardar la información del código.'
      });
    }
  };

  const handleToggleCodeStatus = async (c) => {
    const newStatus = !c.activo;
    try {
      addTerminalEvent(`Modificando estado de vigencia del código ${c.id} a ${newStatus ? 'ACTIVO' : 'INACTIVO'}...`);
      await adminService.updateCode(c.id, { activo: newStatus });
      addTerminalEvent(`Estado de ${c.id} cambiado a ${newStatus ? 'ACTIVO' : 'INACTIVO'}.`);
      fetchCodes();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Fallo al actualizar el estado del código.'
      });
    }
  };

  const handleDeleteCode = async (c) => {
    const confirm = await themedSwal.fire({
      icon: 'warning',
      title: '¿Eliminar Código?',
      text: `¿Estás seguro de que deseas eliminar permanentemente el código ${c.id}? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      addTerminalEvent(`Eliminando código: ${c.id} de Firestore...`);
      await adminService.deleteCode(c.id);
      addTerminalEvent(`Código eliminado: ${c.id}`);
      themedSwal.fire({
        icon: 'success',
        title: 'Código Eliminado',
        text: `El código ${c.id} ha sido borrado del sistema.`
      });
      fetchCodes();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo eliminar el código.'
      });
    }
  };

  // --- QR HELPER HANDLERS ---
  const handleCopyLink = (codeId) => {
    const url = `${window.location.origin}/mis-puntos?code=${codeId}`;
    navigator.clipboard.writeText(url);
    themedSwal.fire({
      icon: 'success',
      title: 'Enlace Copiado',
      text: 'El enlace de reclamo se copió al portapapeles.',
      timer: 1500,
      showConfirmButton: false
    });
    addTerminalEvent(`Enlace de reclamo copiado: ${codeId}`);
  };

  const handleDownloadQr = async (codeId) => {
    const url = `${window.location.origin}/mis-puntos?code=${codeId}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
    try {
      addTerminalEvent(`Generando archivo PNG para el código QR: ${codeId}...`);
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `QR_${codeId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      addTerminalEvent(`[SUCCESS] QR descargado para el código: ${codeId}`);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudo descargar el QR: ${e.message}`);
      window.open(qrApiUrl, '_blank');
    }
  };

  // --- REWARDS HANDLERS ---
  const handleOpenCreateReward = () => {
    setRewardForm({
      id: '',
      title: '',
      cost: 1000,
      desc: '',
      stock: 10,
      activo: true
    });
    setRewardModalMode('create');
    setShowRewardModal(true);
  };

  const handleOpenEditReward = (r) => {
    setRewardForm({
      id: r.id,
      title: r.title || '',
      cost: r.cost || 0,
      desc: r.desc || '',
      stock: r.stock || 0,
      activo: r.activo !== undefined ? r.activo : true
    });
    setSelectedRewardId(r.id);
    setRewardModalMode('edit');
    setShowRewardModal(true);
  };

  const handleSaveReward = async (e) => {
    e.preventDefault();
    try {
      if (Number(rewardForm.cost) < 0) {
        throw new Error("El costo en puntos no puede ser negativo.");
      }
      if (Number(rewardForm.stock) < 0) {
        throw new Error("El stock disponible no puede ser negativo.");
      }
      if (!rewardForm.title.trim()) {
        throw new Error("El título del premio es requerido.");
      }

      const payload = {
        title: rewardForm.title.trim(),
        cost: Number(rewardForm.cost),
        desc: rewardForm.desc.trim(),
        stock: Number(rewardForm.stock),
        activo: rewardForm.activo
      };

      if (rewardModalMode === 'create') {
        if (!rewardForm.id.trim()) throw new Error("Debes especificar un ID único para el premio.");
        const lowercaseId = rewardForm.id.trim().toLowerCase();
        addTerminalEvent(`Registrando nuevo premio: ${lowercaseId}...`);
        await adminService.createReward(lowercaseId, payload);
        addTerminalEvent(`Premio registrado con éxito: ${lowercaseId}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Premio Creado',
          text: `El premio ${rewardForm.title} ha sido registrado.`
        });
      } else {
        addTerminalEvent(`Actualizando parámetros del premio: ${selectedRewardId}...`);
        await adminService.updateReward(selectedRewardId, payload);
        addTerminalEvent(`Premio actualizado con éxito: ${selectedRewardId}`);
        themedSwal.fire({
          icon: 'success',
          title: 'Premio Modificado',
          text: `Se actualizaron los datos del premio ${rewardForm.title}.`
        });
      }
      setShowRewardModal(false);
      fetchRewards();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error de Premios',
        text: err.message || 'Ocurrió un error al guardar el premio.'
      });
    }
  };

  const handleToggleRewardStatus = async (r) => {
    const newStatus = !r.activo;
    try {
      addTerminalEvent(`Modificando estado del premio ${r.id} a ${newStatus ? 'ACTIVO' : 'INACTIVO'}...`);
      await adminService.updateReward(r.id, { activo: newStatus });
      addTerminalEvent(`Estado del premio ${r.id} cambiado a ${newStatus ? 'ACTIVO' : 'INACTIVO'}.`);
      fetchRewards();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Fallo al actualizar el estado del premio.'
      });
    }
  };

  const handleDeleteReward = async (r) => {
    const confirm = await themedSwal.fire({
      icon: 'warning',
      title: '¿Eliminar Premio?',
      text: `¿Estás seguro de que deseas eliminar permanentemente el premio "${r.title}"? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      addTerminalEvent(`Eliminando premio ${r.id} de Firestore...`);
      await adminService.deleteReward(r.id);
      addTerminalEvent(`Premio eliminado: ${r.id}`);
      themedSwal.fire({
        icon: 'success',
        title: 'Premio Eliminado',
        text: `El premio ha sido removido de la base de datos.`
      });
      fetchRewards();
    } catch (err) {
      console.error(err);
      themedSwal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo eliminar el premio.'
      });
    }
  };

  // --- FILTERS LOGIC ---
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.correo || '').toLowerCase().includes(q) ||
      (u.cedula || '').toLowerCase().includes(q) ||
      (u.rol || '').toLowerCase().includes(q)
    );
  });

  const filteredCodes = codes.filter(c => {
    const q = codeSearch.toLowerCase();
    return (
      (c.id || '').toLowerCase().includes(q) ||
      String(c.puntos).includes(q)
    );
  });

  const filteredRewards = rewards.filter(r => {
    const q = rewardSearch.toLowerCase();
    return (
      (r.title || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.desc || '').toLowerCase().includes(q)
    );
  });

  const filteredPayments = payments.filter(rawP => {
    const p = extractTxFields(rawP);
    const q = paymentSearch.toLowerCase();
    return (
      (p.id || '').toLowerCase().includes(q) ||
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.customer_email || '').toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q) ||
      (p.legal_id || '').toLowerCase().includes(q) ||
      (p.payment_method_type || '').toLowerCase().includes(q)
    );
  });

  const filteredLogs = logs.filter(l => {
    const q = logSearch.toLowerCase();
    const matchesQuery = (
      (l.code || '').toLowerCase().includes(q) ||
      (l.uid || '').toLowerCase().includes(q) ||
      (l.premioCanjeado || '').toLowerCase().includes(q) ||
      (l.id || '').toLowerCase().includes(q)
    );

    if (!matchesQuery) return false;

    if (logTypeFilter === 'all') return true;
    const isRedemption = (l.code || '').startsWith('CANJE_') || l.puntos < 0;
    if (logTypeFilter === 'redeem') return isRedemption;
    if (logTypeFilter === 'claim') return !isRedemption;

    return true;
  });

  // Utility to format cents to COP currency
  const formatCentsToCop = (cents, currency = 'COP') => {
    const amount = (Number(cents) || 0) / 100;
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Helper to copy text to clipboard with feedback
  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    themedSwal.fire({
      icon: 'success',
      title: 'Copiado',
      text: `${label} copiado al portapapeles.`,
      timer: 1000,
      showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-[#040b0f] text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Background Nebulas */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[170px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-accent/5 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Header */}
      <header className="glass-light border-b border-muted/20 px-6 py-4 sticky top-0 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-purple">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-white text-md tracking-tight block">SAIO-XV Console</span>
              <span className="text-[10px] text-accent tracking-widest uppercase">Admin Database System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/20 border border-muted/10 text-xs">
              <User className="w-3.5 h-3.5 text-secondary-light" />
              <span className="text-secondary max-w-[150px] truncate">{user?.email}</span>
            </div>

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

      {/* Main Layout - max-w-7xl standard container with scaled controls */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 z-20">
        
        {/* Navigation Tabs and Refresh Button */}
        <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-muted/10 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'telemetry', label: 'Telemetría', icon: Cpu, roles: [ROLES.ADMIN] },
              { id: 'users', label: 'Usuarios', icon: User, roles: [ROLES.ADMIN] },
              { id: 'codes', label: 'Códigos QR', icon: Key, roles: [ROLES.ADMIN, ROLES.COORDINADOR] },
              { id: 'rewards', label: 'Premios', icon: Gift, roles: [ROLES.ADMIN, ROLES.COORDINADOR] },
              { id: 'payments', label: 'Pagos', icon: CreditCard, roles: [ROLES.ADMIN] },
              { id: 'logs', label: 'Historial', icon: Clock, roles: [ROLES.ADMIN] }
            ].filter(t => t.roles.includes(user?.rol)).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-5.5 rounded-xl font-heading text-sm font-semibold flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-primary border border-primary-light/45 text-white glow-purple' 
                      : 'bg-primary-light/5 hover:bg-primary-light/15 border border-muted/10 text-secondary hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefreshAll}
            className="px-5.5 py-3 rounded-xl bg-primary-light/10 hover:bg-primary-light/20 border border-primary-light/25 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Firestore</span>
          </button>
        </section>

        {/* Tab contents */}
        <div className="flex-1 flex flex-col">
          
          {/* TAB 1: TELEMETRY */}
          {activeTab === 'telemetry' && user?.rol === ROLES.ADMIN && (
            <div className="space-y-6 animate-fadeIn">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
                  <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">Usuarios del Sistema</span>
                  <div className="flex items-baseline justify-between">
                    <p className="text-4xl font-heading font-extrabold text-white">{users.length}</p>
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-xs text-secondary">Registrados en colección Firestore</p>
                </div>

                <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
                  <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">Códigos QR Activos</span>
                  <div className="flex items-baseline justify-between">
                    <p className="text-4xl font-heading font-extrabold text-white">
                      {codes.filter(c => c.activo).length} / {codes.length}
                    </p>
                    <Key className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-secondary">Códigos habilitados para canje</p>
                </div>

                <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
                  <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">Catálogo de Premios</span>
                  <div className="flex items-baseline justify-between">
                    <p className="text-4xl font-heading font-extrabold text-white">{rewards.length}</p>
                    <Gift className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-xs text-secondary">Premios vigentes en inventario</p>
                </div>

                <div className="glass-light p-5 rounded-2xl border border-muted/15 space-y-3">
                  <span className="text-xs font-heading font-semibold text-secondary uppercase tracking-wider block">Transacciones de Pago</span>
                  <div className="flex items-baseline justify-between">
                    <p className="text-4xl font-heading font-extrabold text-white">{payments.length}</p>
                    <CreditCard className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-secondary">Trazabilidad de pagos Firestore</p>
                </div>
              </div>

              {/* Console log */}
              <div className="glass rounded-2xl p-6 border border-muted/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-muted/10 pb-3">
                  <Terminal className="w-5 h-5 text-accent animate-pulse" />
                  <h3 className="font-heading font-bold text-lg">Terminal de Eventos y Registro de Telemetría</h3>
                </div>
                <div className="bg-black/60 p-4 rounded-xl font-mono text-sm text-emerald-400 space-y-2 overflow-y-auto max-h-[300px] shadow-inner">
                  {terminalEvents.map((ev, index) => (
                    <p key={index} className={ev.includes('[ERROR]') ? 'text-red-400' : ev.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-secondary'}>
                      {ev}
                    </p>
                  ))}
                  <div className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse"></div>
                </div>
              </div>

              {/* General Actions */}
              <div className="glass rounded-2xl p-6 border border-muted/20 space-y-4">
                <h3 className="font-heading font-bold text-lg border-b border-muted/10 pb-3">Accesos Directos</h3>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => navigate('/mis-puntos')} className="py-2.5 px-4 rounded-xl bg-primary-light/10 hover:bg-primary-light/25 border border-primary-light/25 text-white text-xs font-semibold transition-all duration-200 cursor-pointer">
                    Ir a Reclamar Puntos
                  </button>
                  <button onClick={() => navigate('/')} className="py-2.5 px-4 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/25 text-accent hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer">
                    Volver a Página Principal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeTab === 'users' && user?.rol === ROLES.ADMIN && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-primary-light/5 p-4 rounded-2xl border border-muted/15">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar por nombre, correo, cédula o rol..."
                    className="w-full pl-11 pr-5 py-3 bg-black/30 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleOpenCreateUser}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-lg shadow-accent/10"
                >
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Agregar Usuario</span>
                </button>
              </div>

              <div className="glass rounded-2xl border border-muted/25 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary/25 border-b border-muted/20 text-secondary uppercase font-heading font-bold tracking-wider text-xs">
                        <th className="px-6 py-4.5">Usuario</th>
                        <th className="px-6 py-4.5">Cédula</th>
                        <th className="px-6 py-4.5">Rol</th>
                        <th className="px-6 py-4.5">Puntos</th>
                        <th className="px-6 py-4.5">Estado</th>
                        <th className="px-6 py-4.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10 font-sans text-sm">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-secondary font-medium animate-pulse">Cargando perfiles de usuario...</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-secondary font-medium">No se encontraron usuarios.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="px-6 py-4.5">
                              <div className="font-semibold text-white">{u.nombre || 'Sin nombre'}</div>
                              <div className="text-xs text-secondary mt-0.5">{u.correo}</div>
                            </td>
                            <td className="px-6 py-4.5 text-secondary font-mono text-[13px]">{u.cedula || 'N/A'}</td>
                            <td className="px-6 py-4.5">
                              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                u.rol === ROLES.ADMIN ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                                u.rol === ROLES.COORDINADOR ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' :
                                'bg-primary-light/20 border border-primary-light/30 text-primary-light'
                              }`}>
                                {u.rol}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 font-bold text-accent font-mono">{u.puntos || 0} PTS</td>
                            <td className="px-6 py-4.5">
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                                  u.activo !== false
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                              >
                                {u.activo !== false ? <ToggleRight className="w-4.5 h-4.5 text-emerald-400" /> : <ToggleLeft className="w-4.5 h-4.5 text-red-400" />}
                                <span>{u.activo !== false ? 'Activo' : 'Suspendido'}</span>
                              </button>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white cursor-pointer transition-colors border border-muted/10"
                                  title="Editar perfil"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-300 hover:text-red-400 cursor-pointer transition-colors border border-red-500/10"
                                  title="Eliminar perfil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODES MANAGEMENT */}
          {activeTab === 'codes' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-primary-light/5 p-4 rounded-2xl border border-muted/15">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                  <input
                    type="text"
                    value={codeSearch}
                    onChange={(e) => codeSearchSet(e.target.value)}
                    placeholder="Buscar por ID de código o valor de puntos..."
                    className="w-full pl-11 pr-5 py-3 bg-black/30 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleOpenCreateCode}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-lg shadow-accent/10"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Crear Código QR</span>
                </button>
              </div>

              <div className="glass rounded-2xl border border-muted/25 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary/25 border-b border-muted/20 text-secondary uppercase font-heading font-bold tracking-wider text-xs">
                        <th className="px-6 py-4.5">ID Código</th>
                        <th className="px-6 py-4.5">Puntos</th>
                        <th className="px-6 py-4.5">Geolocalización</th>
                        <th className="px-6 py-4.5">Rango Vigencia</th>
                        <th className="px-6 py-4.5">Estado</th>
                        <th className="px-6 py-4.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10 font-sans text-sm">
                      {loadingCodes ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-secondary font-medium animate-pulse">Cargando códigos de base de datos...</td>
                        </tr>
                      ) : filteredCodes.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-secondary font-medium">No se encontraron códigos QR.</td>
                        </tr>
                      ) : (
                        filteredCodes.map((c) => {
                          const hasGeo = c.coordenadas && (c.coordenadas.latitud !== undefined || c.coordenadas.latitude !== undefined);
                          const latVal = c.coordenadas ? (c.coordenadas.latitud !== undefined ? c.coordenadas.latitud : c.coordenadas.latitude) : null;
                          const lngVal = c.coordenadas ? (c.coordenadas.longitud !== undefined ? c.coordenadas.longitud : c.coordenadas.longitude) : null;

                          return (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors duration-150">
                              <td className="px-6 py-4.5 font-mono font-bold text-white tracking-widest uppercase text-[15px]">{c.id}</td>
                              <td className="px-6 py-4.5 font-bold text-accent font-mono">+{c.puntos} PTS</td>
                              <td className="px-6 py-4.5">
                                {hasGeo ? (
                                  <div className="flex items-center gap-1.5 text-secondary text-xs font-mono">
                                    <MapPin className="w-3.5 h-3.5 text-accent" />
                                    <span>{latVal?.toFixed(4)}, {lngVal?.toFixed(4)}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-secondary italic">Sin restricción</span>
                                )}
                              </td>
                              <td className="px-6 py-4.5 text-secondary leading-relaxed">
                                {c.inicioDelCodigo || c.finDelCodigo ? (
                                  <div className="space-y-1 text-xs">
                                    {c.inicioDelCodigo && <div>Inicia: {new Date(c.inicioDelCodigo).toLocaleString()}</div>}
                                    {c.finDelCodigo && <div>Expira: {new Date(c.finDelCodigo).toLocaleString()}</div>}
                                  </div>
                                ) : (
                                  <span className="text-xs text-secondary italic">Siempre activo</span>
                                )}
                              </td>
                              <td className="px-6 py-4.5">
                                <button
                                  onClick={() => handleToggleCodeStatus(c)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                                    c.activo
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                                  }`}
                                >
                                  {c.activo ? <ToggleRight className="w-4.5 h-4.5 text-emerald-400" /> : <ToggleLeft className="w-4.5 h-4.5 text-red-400" />}
                                  <span>{c.activo ? 'Activo' : 'Desactivado'}</span>
                                </button>
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => { setPreviewCode(c); setShowQrPreviewModal(true); }}
                                    className="p-2 rounded-lg bg-primary-light/10 hover:bg-primary-light/20 text-accent hover:text-accent-light cursor-pointer transition-colors border border-primary-light/10"
                                    title="Proyectar / Descargar QR"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditCode(c)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white cursor-pointer transition-colors border border-muted/10"
                                    title="Editar parámetros"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCode(c)}
                                    className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-300 hover:text-red-400 cursor-pointer transition-colors border border-red-500/10"
                                    title="Eliminar código"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REWARDS MANAGEMENT */}
          {activeTab === 'rewards' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-primary-light/5 p-4 rounded-2xl border border-muted/15">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                  <input
                    type="text"
                    value={rewardSearch}
                    onChange={(e) => setRewardSearch(e.target.value)}
                    placeholder="Buscar por título, ID o descripción de premio..."
                    className="w-full pl-11 pr-5 py-3 bg-black/30 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleOpenCreateReward}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-lg shadow-accent/10"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Crear Premio</span>
                </button>
              </div>

              <div className="glass rounded-2xl border border-muted/25 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary/25 border-b border-muted/20 text-secondary uppercase font-heading font-bold tracking-wider text-xs">
                        <th className="px-6 py-4.5">Premio</th>
                        <th className="px-6 py-4.5">ID / Clave</th>
                        <th className="px-6 py-4.5">Costo</th>
                        <th className="px-6 py-4.5">Stock</th>
                        <th className="px-6 py-4.5">Estado</th>
                        <th className="px-6 py-4.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10 font-sans text-sm">
                      {loadingRewards ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-secondary font-medium animate-pulse">Cargando catálogo de premios...</td>
                        </tr>
                      ) : filteredRewards.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-secondary font-medium">No se encontraron premios definidos.</td>
                        </tr>
                      ) : (
                        filteredRewards.map((r) => (
                          <tr key={r.id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="px-6 py-4.5">
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-accent" />
                                <span>{r.title}</span>
                              </div>
                              <div className="text-xs text-secondary mt-0.5 max-w-sm truncate" title={r.desc}>
                                {r.desc || 'Sin descripción'}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 font-mono font-semibold text-secondary">{r.id}</td>
                            <td className="px-6 py-4.5 font-bold text-accent font-mono">{r.cost.toLocaleString()} PTS</td>
                            <td className="px-6 py-4.5 font-mono">
                              <span className={r.stock <= 0 ? 'text-red-400 font-bold' : 'text-white'}>
                                {r.stock} u.
                              </span>
                            </td>
                            <td className="px-6 py-4.5">
                              <button
                                onClick={() => handleToggleRewardStatus(r)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                                  r.activo
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                              >
                                {r.activo ? <ToggleRight className="w-4.5 h-4.5 text-emerald-400" /> : <ToggleLeft className="w-4.5 h-4.5 text-red-400" />}
                                <span>{r.activo ? 'Activo' : 'Desactivado'}</span>
                              </button>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditReward(r)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white cursor-pointer transition-colors border border-muted/10"
                                  title="Editar parámetros"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReward(r)}
                                  className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-300 hover:text-red-400 cursor-pointer transition-colors border border-red-500/10"
                                  title="Eliminar premio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS ACCESSIBILITY */}
          {activeTab === 'payments' && user?.rol === ROLES.ADMIN && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex bg-primary-light/5 p-4 rounded-2xl border border-muted/15">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Buscar pagos por ID, cliente, correo, documento o referencia..."
                    className="w-full pl-11 pr-5 py-3 bg-black/30 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="glass rounded-2xl border border-muted/25 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary/25 border-b border-muted/20 text-secondary uppercase font-heading font-bold tracking-wider text-xs">
                        <th className="px-6 py-4.5">ID Transacción</th>
                        <th className="px-6 py-4.5">Fecha</th>
                        <th className="px-6 py-4.5">Cliente</th>
                        <th className="px-6 py-4.5">Monto</th>
                        <th className="px-6 py-4.5">Método</th>
                        <th className="px-6 py-4.5">Estado</th>
                        <th className="px-6 py-4.5 text-right">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10 font-sans text-sm">
                      {loadingPayments ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8 text-secondary font-medium animate-pulse">Cargando transacciones de pago...</td>
                        </tr>
                      ) : filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8 text-secondary font-medium">No se encontraron pagos registrados.</td>
                        </tr>
                      ) : (
                        filteredPayments.map((rawP) => {
                          const p = extractTxFields(rawP);
                          const isApproved = p.status === 'APPROVED';
                          const isDeclined = p.status === 'DECLINED';
                          return (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                              <td className="px-6 py-4.5 font-mono text-xs text-white max-w-[130px] truncate" title={p.id}>{p.id}</td>
                              <td className="px-6 py-4.5 text-secondary text-xs">
                                {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="font-semibold text-white">{p.full_name || 'Sin nombre'}</div>
                                <div className="text-xs text-secondary mt-0.5">{p.customer_email}</div>
                              </td>
                              <td className="px-6 py-4.5 font-mono font-bold text-white">
                                {formatCentsToCop(p.amount_in_cents, p.currency)}
                              </td>
                              <td className="px-6 py-4.5 font-mono text-xs text-secondary-light">
                                {p.payment_method_type || 'N/A'}
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                  isApproved ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
                                  isDeclined ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                                  'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <button
                                  onClick={() => { setSelectedPayment(rawP); setShowPaymentDetailModal(true); }}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white cursor-pointer transition-colors border border-muted/10"
                                  title="Ver detalle de trazabilidad"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRANSACTION LOGS */}
          {activeTab === 'logs' && user?.rol === ROLES.ADMIN && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-primary-light/5 p-4 rounded-2xl border border-muted/15">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary/60" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Buscar por código, ID de transacción, UID de usuario..."
                    className="w-full pl-11 pr-5 py-3 bg-black/30 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-xl text-sm text-white placeholder-secondary/40 outline-none transition-all duration-300"
                  />
                </div>

                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'claim', label: 'Reclamaciones (QR)' },
                    { id: 'redeem', label: 'Canjes (Premios)' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setLogTypeFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 cursor-pointer ${
                        logTypeFilter === filter.id
                          ? 'bg-accent/25 border-accent text-white glow-purple'
                          : 'bg-black/30 border-muted/20 text-secondary hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-muted/25 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary/25 border-b border-muted/20 text-secondary uppercase font-heading font-bold tracking-wider text-xs">
                        <th className="px-6 py-4.5">Fecha y Hora</th>
                        <th className="px-6 py-4.5">UID Usuario</th>
                        <th className="px-6 py-4.5">Código / Acción</th>
                        <th className="px-6 py-4.5">Puntos</th>
                        <th className="px-6 py-4.5">Ubicación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10 font-sans text-sm">
                      {loadingLogs ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-secondary font-medium animate-pulse">Cargando logs de auditoría...</td>
                        </tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-secondary font-medium">No se encontraron registros de transacciones.</td>
                        </tr>
                      ) : (
                        filteredLogs.map((l) => {
                          const isClaim = l.puntos > 0;
                          const hasGeo = l.coordenadas && (l.coordenadas.latitud !== undefined || l.coordenadas.latitude !== undefined);
                          const latVal = l.coordenadas ? (l.coordenadas.latitud !== undefined ? l.coordenadas.latitud : l.coordenadas.latitude) : null;
                          const lngVal = l.coordenadas ? (l.coordenadas.longitud !== undefined ? l.coordenadas.longitud : l.coordenadas.longitude) : null;

                          return (
                            <tr key={l.id} className="hover:bg-white/5 transition-colors duration-150">
                              <td className="px-6 py-4.5 text-secondary font-mono text-xs">
                                {new Date(l.fecha || l.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4.5 text-secondary font-mono text-xs truncate max-w-[130px]" title={l.uid}>
                                {l.uid}
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="font-bold text-white font-mono">{l.code}</div>
                                {l.premioCanjeado && (
                                  <div className="text-xs text-accent mt-0.5">{l.premioCanjeado}</div>
                                )}
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`font-bold font-mono text-[14px] ${isClaim ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {isClaim ? `+${l.puntos}` : l.puntos} PTS
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                {hasGeo ? (
                                  <span className="text-xs font-mono text-secondary">
                                    📍 {latVal?.toFixed(4)}, {lngVal?.toFixed(4)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-secondary italic">Sin coordenadas</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MODAL 1: USER EDIT / CREATE --- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass rounded-2xl border border-muted/20 overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-muted/10 p-5">
              <h3 className="font-heading font-extrabold text-md text-white flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                <span>{userModalMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Perfil de Usuario'}</span>
              </h3>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={userForm.nombre}
                  onChange={(e) => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  disabled={userModalMode === 'edit'}
                  value={userForm.correo}
                  onChange={(e) => setUserForm(prev => ({ ...prev, correo: e.target.value }))}
                  placeholder="ejemplo@saio.com"
                  className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 disabled:opacity-55"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Cédula</label>
                  <input
                    type="text"
                    required
                    value={userForm.cedula}
                    onChange={(e) => setUserForm(prev => ({ ...prev, cedula: e.target.value }))}
                    placeholder="Documento"
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Rol asignado</label>
                  <select
                    value={userForm.rol}
                    onChange={(e) => setUserForm(prev => ({ ...prev, rol: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0c0d12] border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300"
                  >
                    <option value={ROLES.ASISTENTE}>Asistente</option>
                    <option value={ROLES.COORDINADOR}>Coordinador</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {userModalMode === 'create' ? (
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Contraseña (Mínimo 6 char)</label>
                    <input
                      type="password"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Puntos de Saldo (Mínimo 0)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={userForm.puntos}
                      onChange={(e) => setUserForm(prev => ({ ...prev, puntos: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-muted/10 pt-4 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-muted/10 text-secondary hover:text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary border border-primary-light/45 text-white glow-purple font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  {userModalMode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CODE EDIT / CREATE --- */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass rounded-2xl border border-muted/20 overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowCodeModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-muted/10 p-5">
              <h3 className="font-heading font-extrabold text-md text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" />
                <span>{codeModalMode === 'create' ? 'Crear Nuevo Código QR' : 'Editar Código QR'}</span>
              </h3>
            </div>

            <form onSubmit={handleSaveCode} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Código (ID)</label>
                  <input
                    type="text"
                    required
                    disabled={codeModalMode === 'edit'}
                    value={codeForm.id}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Ej: STAND_VIP"
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 font-mono tracking-wider uppercase disabled:opacity-55"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Puntos de Valor (Mínimo 0)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={codeForm.puntos}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, puntos: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              {/* Geolocation Section */}
              <div className="p-3 bg-white/5 rounded-xl border border-muted/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    Restricción por Ubicación
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    className="px-2.5 py-1 rounded-lg bg-accent/20 hover:bg-accent/35 text-accent-light border border-accent/20 text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-200"
                    disabled={gpsLoading}
                  >
                    <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>Usar Ubicación Actual</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-heading font-semibold uppercase text-secondary">Latitud (GPS)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={codeForm.latitud}
                      onChange={(e) => setCodeForm(prev => ({ ...prev, latitud: e.target.value }))}
                      placeholder="Ej: 4.609710"
                      className="w-full px-2.5 py-1.5 bg-black/35 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-lg text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-heading font-semibold uppercase text-secondary">Longitud (GPS)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={codeForm.longitud}
                      onChange={(e) => setCodeForm(prev => ({ ...prev, longitud: e.target.value }))}
                      placeholder="Ej: -74.081750"
                      className="w-full px-2.5 py-1.5 bg-black/35 border border-muted/20 hover:border-primary-light/50 focus:border-accent rounded-lg text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-secondary leading-relaxed">
                  * Deja estos campos vacíos si no quieres restringir la reclamación por distancia.
                </p>
              </div>

              {/* Time Restriction Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                    Fecha Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={codeForm.inicioDelCodigo}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, inicioDelCodigo: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0c0d12] border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none font-sans cursor-pointer scheme-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                    Fecha Expiración
                  </label>
                  <input
                    type="datetime-local"
                    value={codeForm.finDelCodigo}
                    onChange={(e) => setCodeForm(prev => ({ ...prev, finDelCodigo: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0c0d12] border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none font-sans cursor-pointer scheme-dark"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="code_activo"
                  checked={codeForm.activo}
                  onChange={(e) => setCodeForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="rounded bg-black border-muted/30 text-accent focus:ring-accent"
                />
                <label htmlFor="code_activo" className="text-xs font-heading font-semibold text-white cursor-pointer select-none">
                  Código Habilitado Inmediatamente
                </label>
              </div>

              <div className="border-t border-muted/10 pt-4 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-muted/10 text-secondary hover:text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary border border-primary-light/45 text-white glow-purple font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  {codeModalMode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: REWARD EDIT / CREATE --- */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass rounded-2xl border border-muted/20 overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowRewardModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-muted/10 p-5">
              <h3 className="font-heading font-extrabold text-md text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                <span>{rewardModalMode === 'create' ? 'Crear Nuevo Premio' : 'Editar Premio'}</span>
              </h3>
            </div>

            <form onSubmit={handleSaveReward} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">ID / Clave única</label>
                  <input
                    type="text"
                    required
                    disabled={rewardModalMode === 'edit'}
                    value={rewardForm.id}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Ej: vaso_termico"
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Nombre de Premio</label>
                  <input
                    type="text"
                    required
                    value={rewardForm.title}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Mug SAIO-XV"
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Costo en Puntos (Mínimo 0)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rewardForm.cost}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Stock Disponible (Mínimo 0)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rewardForm.stock}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary">Descripción</label>
                <textarea
                  value={rewardForm.desc}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Detalles sobre el premio y cómo se reclama..."
                  rows="3"
                  className="w-full px-3 py-2 bg-black/40 border border-muted/25 hover:border-primary-light/50 focus:border-accent rounded-xl text-xs text-white outline-none transition-all duration-300 resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reward_activo"
                  checked={rewardForm.activo}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="rounded bg-black border-muted/30 text-accent focus:ring-accent"
                />
                <label htmlFor="reward_activo" className="text-xs font-heading font-semibold text-white cursor-pointer select-none">
                  Premio Activo (Habilitado para Canje)
                </label>
              </div>

              <div className="border-t border-muted/10 pt-4 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-muted/10 text-secondary hover:text-white font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary border border-primary-light/45 text-white glow-purple font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  {rewardModalMode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: QR CODE PREVIEW & DOWNLOAD --- */}
      {showQrPreviewModal && previewCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass rounded-3xl border border-muted/20 overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowQrPreviewModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-muted/10 p-6 text-center">
              <h3 className="font-heading font-extrabold text-lg text-white">
                Proyección de Código QR
              </h3>
              <span className="text-xs text-accent font-mono font-bold tracking-widest uppercase block mt-1">
                {previewCode.id}
              </span>
            </div>

            <div className="p-6 flex flex-col items-center space-y-6">
              {/* QR Frame with cosmic glow */}
              <div className="p-4 bg-white rounded-2xl shadow-2xl border border-purple-500/20 relative group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/mis-puntos?code=${previewCode.id}`)}`}
                  alt={`QR Code for ${previewCode.id}`}
                  className="w-64 h-64 select-none object-contain"
                />
                <div className="absolute inset-0 rounded-2xl border border-primary/20 pointer-events-none"></div>
              </div>

              <div className="text-center space-y-2 w-full">
                <p className="text-sm font-semibold text-white">
                  Valor: <span className="text-accent font-mono">+{previewCode.puntos} Puntos Estelares</span>
                </p>
                <div className="bg-black/40 p-3 rounded-xl border border-muted/10 text-center select-all">
                  <code className="text-xs text-secondary-light font-mono break-all font-medium">
                    {window.location.origin}/mis-puntos?code={previewCode.id}
                  </code>
                </div>
              </div>

              <div className="w-full border-t border-muted/10 pt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleDownloadQr(previewCode.id)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-light to-accent hover:opacity-95 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-lg shadow-accent/15"
                >
                  Descargar Código QR (PNG)
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLink(previewCode.id)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-muted/10 text-white text-xs font-semibold font-heading cursor-pointer transition-all duration-200"
                  >
                    Copiar Enlace
                  </button>
                  <button
                    onClick={() => setShowQrPreviewModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-muted/10 text-secondary hover:text-white text-xs font-semibold font-heading cursor-pointer transition-all duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: PAYMENT TRANSACTION DETAIL VIEW --- */}
      {showPaymentDetailModal && selectedPayment && (() => {
        const p = extractTxFields(selectedPayment);
        const asyncUrl = p.payment_method?.extra?.async_payment_url;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-4xl glass rounded-3xl border border-muted/20 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setShowPaymentDetailModal(false)}
                className="absolute top-4 right-4 text-secondary hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="border-b border-muted/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 bg-primary/10">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent animate-pulse" />
                    <span>Detalle de Transacción de Pago</span>
                  </h3>
                  <span className="text-xs text-secondary font-mono mt-0.5 block break-all select-all">
                    ID: {p.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    p.status === 'APPROVED' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
                    p.status === 'DECLINED' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                    'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                  }`}>
                    {p.status}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(p.id, "ID de Pago")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white cursor-pointer border border-muted/10"
                    title="Copiar ID"
                  >
                    <Copy className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans text-sm leading-relaxed scrollbar-thin">
                
                {/* Decline message bar */}
                {p.status_message && (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-start gap-2 animate-pulse">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Mensaje de Rechazo Pasarela:</span>
                      <span>{p.status_message}</span>
                    </div>
                  </div>
                )}

                {/* Two Column Grid: Client Info & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Column 1: Client Data */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-muted/10 space-y-4">
                    <h4 className="font-heading font-bold text-sm text-accent uppercase tracking-wider border-b border-muted/10 pb-2">
                      Información del Cliente
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                      <div>
                        <span className="text-secondary block">Nombre Completo</span>
                        <span className="text-white font-medium">{p.full_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary block">Documento Legal</span>
                        <span className="text-white font-medium font-mono">
                          {p.legal_id_type || 'CC'} {p.legal_id || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-secondary block">Correo Electrónico</span>
                        <span className="text-white font-medium break-all select-all">{p.customer_email || 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-secondary block">Teléfono Móvil</span>
                        <span className="text-white font-medium font-mono">{p.phone_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Payment Data */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-muted/10 space-y-4">
                    <h4 className="font-heading font-bold text-sm text-accent uppercase tracking-wider border-b border-muted/10 pb-2">
                      Detalles Financieros
                    </h4>

                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                      <div>
                        <span className="text-secondary block">Monto en Céntimos</span>
                        <span className="text-white font-semibold font-mono">{p.amount_in_cents?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-secondary block">Monto Formateado</span>
                        <span className="text-white font-bold font-mono text-[14px]">
                          {formatCentsToCop(p.amount_in_cents, p.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary block">Método de Pago</span>
                        <span className="text-white font-medium font-mono bg-white/5 px-2 py-0.5 rounded border border-muted/10 uppercase">
                          {p.payment_method_type || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary block">Moneda</span>
                        <span className="text-white font-medium">{p.currency || 'COP'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-secondary block">Referencia de Pago</span>
                        <span className="text-white font-medium font-mono break-all block select-all">{p.reference || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Customer References Substructures */}
                {p.customer_references && p.customer_references.length > 0 && (
                  <div className="p-5 bg-white/5 rounded-2xl border border-muted/10 space-y-3">
                    <h4 className="font-heading font-bold text-sm text-accent uppercase tracking-wider border-b border-muted/10 pb-2">
                      Referencias de Retorno (Customer References)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {p.customer_references.map((ref, idx) => (
                        <div key={idx} className="p-3 bg-black/30 rounded-xl border border-muted/5 flex flex-col">
                          <span className="text-[10px] text-secondary font-heading uppercase">{ref.label || `Referencia ${idx + 1}`}</span>
                          <span className="text-xs text-white font-mono font-medium mt-0.5 select-all">{ref.value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Method Details (Tokens & Identifiers) */}
                <div className="p-5 bg-white/5 rounded-2xl border border-muted/10 space-y-4">
                  <h4 className="font-heading font-bold text-sm text-accent uppercase tracking-wider border-b border-muted/10 pb-2">
                    Metadatos de la Pasarela de Pago
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-secondary font-sans block text-[10px] uppercase">ID Transacción Pasarela</span>
                      <span className="text-white block select-all mt-0.5">{p.payment_method?.extra?.transaction_id || p.payment_method?.transaction_id || p.id}</span>
                    </div>
                    <div>
                      <span className="text-secondary font-sans block text-[10px] uppercase">Identificador Externo</span>
                      <span className="text-white block select-all mt-0.5">{p.payment_method?.extra?.external_identifier || p.payment_method?.external_identifier || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-secondary font-sans block text-[10px] uppercase">ID Link de Pago (Payment Link ID)</span>
                      <span className="text-white block select-all mt-0.5">{p.payment_link_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-secondary font-sans block text-[10px] uppercase">Teléfono de Pago</span>
                      <span className="text-white block select-all mt-0.5">{p.payment_method?.phone_number || p.phone_number || 'N/A'}</span>
                    </div>
                    {asyncUrl && (
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-secondary font-sans block text-[10px] uppercase">Enlace de Pago Asíncrono</span>
                        <a 
                          href={asyncUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:text-accent-light flex items-center gap-1 mt-0.5 underline break-all font-medium text-[11px]"
                        >
                          <span>{asyncUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Browser Info & Device Info */}
                <div className="p-5 bg-white/5 rounded-2xl border border-muted/10 space-y-4">
                  <h4 className="font-heading font-bold text-sm text-accent uppercase tracking-wider border-b border-muted/10 pb-2">
                    Huella Digital del Dispositivo e Información del Navegador
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-secondary block">Idioma</span>
                      <span className="text-white font-medium">{p.browser_info?.browser_language || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Zona Horaria (Offset)</span>
                      <span className="text-white font-medium">{p.browser_info?.browser_tz || 'N/A'} min</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Resolución de Pantalla</span>
                      <span className="text-white font-medium">
                        {p.browser_info?.browser_screen_width && p.browser_info?.browser_screen_height 
                          ? `${p.browser_info.browser_screen_width} x ${p.browser_info.browser_screen_height}` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary block">Profundidad de Color</span>
                      <span className="text-white font-medium">{p.browser_info?.browser_color_depth || 'N/A'} bits</span>
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                      <span className="text-secondary block">Identificador del Dispositivo (Device ID)</span>
                      <span className="text-white font-mono text-[11px] select-all break-all block mt-0.5">{p.device_id || 'N/A'}</span>
                    </div>
                  </div>

                  {p.browser_info?.browser_user_agent && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-secondary font-heading uppercase">Browser User Agent</span>
                      <pre className="bg-black/40 p-3 rounded-xl border border-muted/10 text-[11px] font-mono text-secondary-light leading-normal select-all overflow-x-auto">
                        {p.browser_info.browser_user_agent}
                      </pre>
                    </div>
                  )}

                  {p.device_data_token && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-secondary font-heading uppercase">Token de Datos de Seguridad del Dispositivo</span>
                      <div className="relative">
                        <pre className="bg-black/40 p-3 pr-10 rounded-xl border border-muted/10 text-[10px] font-mono text-secondary/70 leading-normal select-all max-h-[80px] overflow-y-auto break-all">
                          {p.device_data_token}
                        </pre>
                        <button 
                          onClick={() => handleCopyToClipboard(p.device_data_token, "Token del Dispositivo")}
                          className="absolute right-3 top-3 p-1 rounded hover:bg-white/5 text-secondary hover:text-white cursor-pointer"
                          title="Copiar token completo"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audit Timestamps */}
                <div className="p-4 bg-black/25 rounded-xl border border-muted/5 text-center text-xs text-secondary font-mono grid grid-cols-2 gap-2">
                  <div>Creado el: {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}</div>
                  <div>Finalizado el: {p.finalized_at ? new Date(p.finalized_at).toLocaleString() : 'N/A'}</div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-muted/10 p-5 flex justify-end shrink-0 bg-primary/5">
                <button
                  onClick={() => setShowPaymentDetailModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-primary border border-primary-light/45 text-white glow-purple font-heading text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  Cerrar Detalles
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-secondary mt-auto border-t border-muted/10 bg-black/20">
        © 2026 SAIO-XV Admin Portal. Desarrollado con Firebase y React.
      </footer>
    </div>
  );
}

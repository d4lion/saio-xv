import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { ROLES } from '../../constants/roles';
import Swal from 'sweetalert2';
import { 
  LogOut, Cpu, User, RefreshCw, Key, Clock, Gift, CreditCard
} from 'lucide-react';

// Subcomponents
import TelemetryTab from './TelemetryTab';
import UsersTab from './UsersTab';
import CodesTab from './CodesTab';
import RewardsTab from './RewardsTab';
import PaymentsTab from './PaymentsTab';
import LogsTab from './LogsTab';

// Modals
import UserModal from './UserModal';
import CodeModal from './CodeModal';
import RewardModal from './RewardModal';
import QrPreviewModal from './QrPreviewModal';
import PaymentDetailModal from './PaymentDetailModal';

const themedSwal = Swal.mixin({
  background: '#ffffff',
  color: '#1f2937',
  confirmButtonColor: '#1a73e8',
  cancelButtonColor: '#f1f3f4',
  customClass: {
    popup: 'border border-gray-200 rounded-2xl shadow-2xl bg-white text-gray-900',
    title: 'font-heading font-bold text-gray-900 text-md tracking-wide',
    htmlContainer: 'text-gray-600 font-sans text-xs leading-relaxed',
    confirmButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors outline-none ring-0 mx-1',
    cancelButton: 'rounded-xl font-heading px-5 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors outline-none ring-0 mx-1'
  }
});

// Helper to extract fields from Wompi structures
const extractTxFields = (p) => {
  if (!p) return {};
  const t = p.data?.transaction || p;
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
    full_name: cData.full_name || t.full_name || p.full_name || 'N/A',
    legal_id: cData.legal_id || t.legal_id || p.legal_id || 'N/A',
    legal_id_type: cData.legal_id_type || t.legal_id_type || p.legal_id_type || 'CC',
    phone_number: cData.phone_number || t.phone_number || p.phone_number || 'N/A',
    customer_references: cData.customer_references || t.customer_references || p.customer_references || [],
    device_id: cData.device_id || t.device_id || p.device_id || 'N/A',
    device_data_token: cData.device_data_token || t.device_data_token || p.device_data_token || '',
    browser_info: cData.browser_info || t.browser_info || p.browser_info || {},
    payment_method: t.payment_method || p.payment_method || {}
  };
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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

  // Search states (passed to subtabs)
  const [userSearch, setUserSearch] = useState('');
  const [codeSearch, codeSearchSet] = useState('');
  const [rewardSearch, setRewardSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all');

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create');
  const [selectedUserUid, setSelectedUserUid] = useState(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    correo: '',
    cedula: '',
    puntos: 0,
    rol: ROLES.ASISTENTE,
    password: ''
  });

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeModalMode, setCodeModalMode] = useState('create');
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

  const [showQrPreviewModal, setShowQrPreviewModal] = useState(false);
  const [previewCode, setPreviewCode] = useState(null);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardModalMode, setRewardModalMode] = useState('create');
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    id: '',
    title: '',
    cost: 1000,
    desc: '',
    stock: 10,
    activo: true
  });

  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch functions
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

  // User Handlers
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
        toast.success(`Usuario Creado: El usuario ${userForm.nombre} ha sido registrado.`);
      } else {
        addTerminalEvent(`Actualizando datos del usuario: ${userForm.nombre} (UID: ${selectedUserUid})...`);
        await adminService.updateUser(selectedUserUid, {
          nombre: userForm.nombre,
          cedula: userForm.cedula,
          puntos: Number(userForm.puntos),
          rol: userForm.rol
        });
        addTerminalEvent(`Usuario actualizado exitosamente: ${userForm.nombre}`);
        toast.success(`Usuario Actualizado: Se actualizaron los datos de ${userForm.nombre}.`);
      }
      setShowUserModal(false);
      fetchUsers();
      fetchLogs();
    } catch (err) {
      console.error(err);
      toast.error(`Error de Guardado: ${err.message || 'Ocurrió un error al procesar el usuario.'}`);
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
      toast.error('Error: No se pudo cambiar el estado de actividad.');
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
      toast.success('Usuario Eliminado: El perfil de Firestore ha sido removido con éxito.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message || 'No se pudo eliminar el usuario.'}`);
    }
  };

  // Code Handlers
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
      toast.error('GPS No Soportado: La geolocalización no está disponible en este navegador.');
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
        toast.success(`Ubicación Capturada: Lat ${lat}, Lng ${lng}`);
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        addTerminalEvent(`[ERROR] Error al capturar GPS: ${error.message}`);
        toast.error('Fallo al Capturar GPS: No se pudo obtener la ubicación. Por favor concede los permisos.');
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
        toast.success(`Código Creado: El código ${uppercaseId} ha sido creado con éxito.`);
      } else {
        addTerminalEvent(`Actualizando parámetros del código: ${selectedCodeId}...`);
        await adminService.updateCode(selectedCodeId, payload);
        addTerminalEvent(`Código actualizado: ${selectedCodeId}`);
        toast.success(`Código Modificado: Los parámetros de ${selectedCodeId} fueron actualizados.`);
      }
      setShowCodeModal(false);
      fetchCodes();
    } catch (err) {
      console.error(err);
      toast.error(`Error al Guardar Código: ${err.message || 'No se pudo guardar la información del código.'}`);
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
      toast.error('Error: Fallo al actualizar el estado del código.');
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
      toast.success(`Código Eliminado: El código ${c.id} ha sido borrado del sistema.`);
      fetchCodes();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message || 'No se pudo eliminar el código.'}`);
    }
  };

  // QR Helpers
  const handleCopyLink = (codeId) => {
    const url = `${window.location.origin}/mis-puntos?code=${codeId}`;
    navigator.clipboard.writeText(url);
    toast.success('Enlace Copiado: El enlace de reclamo se copió al portapapeles.');
    addTerminalEvent(`Enlace de reclamo copiado: ${codeId}`);
  };

  const handleDownloadQr = async (codeId) => {
    const url = `${window.location.origin}/mis-puntos?code=${codeId}`;
    try {
      addTerminalEvent(`Generando archivo PNG nativo para el código QR: ${codeId}...`);
      const dataUrl = await QRCode.toDataURL(url, { width: 500, margin: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR_${codeId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addTerminalEvent(`[SUCCESS] QR descargado para el código: ${codeId}`);
    } catch (e) {
      console.error(e);
      addTerminalEvent(`[ERROR] No se pudo generar/descargar el QR: ${e.message}`);
    }
  };

  // Reward Handlers
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
        toast.success(`Premio Creado: El premio ${rewardForm.title} ha sido registrado.`);
      } else {
        addTerminalEvent(`Actualizando parámetros del premio: ${selectedRewardId}...`);
        await adminService.updateReward(selectedRewardId, payload);
        addTerminalEvent(`Premio actualizado con éxito: ${selectedRewardId}`);
        toast.success(`Premio Modificado: Se actualizaron los datos del premio ${rewardForm.title}.`);
      }
      setShowRewardModal(false);
      fetchRewards();
    } catch (err) {
      console.error(err);
      toast.error(`Error de Premios: ${err.message || 'Ocurrió un error al guardar el premio.'}`);
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
      toast.error('Error: Fallo al actualizar el estado del premio.');
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
      toast.success('Premio Eliminado: El premio ha sido removido de la base de datos.');
      fetchRewards();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message || 'No se pudo eliminar el premio.'}`);
    }
  };

  // Clipboard handler
  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles.`);
  };

  const formatCentsToCop = (cents, currency = 'COP') => {
    const amount = (Number(cents) || 0) / 100;
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Default path for routing redirect
  const defaultPath = user?.rol === ROLES.COORDINADOR ? '/dashboard/codigos' : '/dashboard/telemetria';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 shadow-sm z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-heading font-extrabold text-sm">S</span>
            </div>
            <div>
              <span className="font-heading font-bold text-gray-900 text-md tracking-tight block">SAIO-XV Console</span>
              <span className="text-[10px] text-blue-600 tracking-widest uppercase font-semibold">Admin Database System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 max-w-[150px] truncate font-medium">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 font-heading text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 z-20">
        
        {/* Navigation Tabs and Refresh Button */}
        <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { path: '/dashboard/telemetria', label: 'Telemetría', icon: Cpu, roles: [ROLES.ADMIN] },
              { path: '/dashboard/usuarios', label: 'Usuarios', icon: User, roles: [ROLES.ADMIN] },
              { path: '/dashboard/codigos', label: 'Códigos QR', icon: Key, roles: [ROLES.ADMIN, ROLES.COORDINADOR] },
              { path: '/dashboard/premios', label: 'Premios', icon: Gift, roles: [ROLES.ADMIN, ROLES.COORDINADOR] },
              { path: '/dashboard/pagos', label: 'Pagos', icon: CreditCard, roles: [ROLES.ADMIN] },
              { path: '/dashboard/historial', label: 'Historial', icon: Clock, roles: [ROLES.ADMIN] }
            ].filter(t => t.roles.includes(user?.rol)).map(tab => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) => 
                    `py-2.5 px-5 rounded-xl font-heading text-sm font-semibold flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-[#e8f0fe] text-[#1a73e8] border border-blue-200 shadow-sm' 
                        : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>

          <button
            onClick={handleRefreshAll}
            className="px-5.5 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-sm disabled:opacity-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Firestore</span>
          </button>
        </section>

        {/* Tab contents routed via React Router */}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="" element={<Navigate to={defaultPath} replace />} />
            
            <Route 
              path="telemetria" 
              element={
                user?.rol === ROLES.ADMIN ? (
                  <TelemetryTab 
                    users={users} 
                    codes={codes} 
                    rewards={rewards} 
                    payments={payments} 
                    terminalEvents={terminalEvents} 
                    navigate={navigate} 
                  />
                ) : (
                  <Navigate to="/dashboard/codigos" replace />
                )
              } 
            />
            
            <Route 
              path="usuarios" 
              element={
                user?.rol === ROLES.ADMIN ? (
                  <UsersTab 
                    users={users} 
                    loadingUsers={loadingUsers} 
                    userSearch={userSearch} 
                    setUserSearch={setUserSearch} 
                    handleOpenCreateUser={handleOpenCreateUser} 
                    handleOpenEditUser={handleOpenEditUser} 
                    handleToggleUserStatus={handleToggleUserStatus} 
                    handleDeleteUser={handleDeleteUser} 
                  />
                ) : (
                  <Navigate to="/dashboard/codigos" replace />
                )
              } 
            />

            <Route 
              path="codigos" 
              element={
                <CodesTab 
                  codes={codes} 
                  loadingCodes={loadingCodes} 
                  codeSearch={codeSearch} 
                  codeSearchSet={codeSearchSet} 
                  handleOpenCreateCode={handleOpenCreateCode} 
                  handleOpenEditCode={handleOpenEditCode} 
                  handleToggleCodeStatus={handleToggleCodeStatus} 
                  handleDeleteCode={handleDeleteCode} 
                  setPreviewCode={setPreviewCode} 
                  setShowQrPreviewModal={setShowQrPreviewModal} 
                />
              } 
            />

            <Route 
              path="premios" 
              element={
                <RewardsTab 
                  rewards={rewards} 
                  loadingRewards={loadingRewards} 
                  rewardSearch={rewardSearch} 
                  setRewardSearch={setRewardSearch} 
                  handleOpenCreateReward={handleOpenCreateReward} 
                  handleOpenEditReward={handleOpenEditReward} 
                  handleToggleRewardStatus={handleToggleRewardStatus} 
                  handleDeleteReward={handleDeleteReward} 
                />
              } 
            />

            <Route 
              path="pagos" 
              element={
                user?.rol === ROLES.ADMIN ? (
                  <PaymentsTab 
                    payments={payments} 
                    loadingPayments={loadingPayments} 
                    paymentSearch={paymentSearch} 
                    setPaymentSearch={setPaymentSearch} 
                    formatCentsToCop={formatCentsToCop} 
                    extractTxFields={extractTxFields} 
                    setSelectedPayment={setSelectedPayment} 
                    setShowPaymentDetailModal={setShowPaymentDetailModal} 
                  />
                ) : (
                  <Navigate to="/dashboard/codigos" replace />
                )
              } 
            />

            <Route 
              path="historial" 
              element={
                user?.rol === ROLES.ADMIN ? (
                  <LogsTab 
                    logs={logs} 
                    loadingLogs={loadingLogs} 
                    logSearch={logSearch} 
                    setLogSearch={setLogSearch} 
                    logTypeFilter={logTypeFilter} 
                    setLogTypeFilter={setLogTypeFilter} 
                  />
                ) : (
                  <Navigate to="/dashboard/codigos" replace />
                )
              } 
            />
            
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </div>
      </div>

      {/* Modals */}
      <UserModal 
        isOpen={showUserModal} 
        onClose={() => setShowUserModal(false)} 
        mode={userModalMode} 
        form={userForm} 
        setForm={setUserForm} 
        onSave={handleSaveUser} 
        selectedUserUid={selectedUserUid} 
      />

      <CodeModal 
        isOpen={showCodeModal} 
        onClose={() => setShowCodeModal(false)} 
        mode={codeModalMode} 
        form={codeForm} 
        setForm={setCodeForm} 
        onSave={handleSaveCode} 
        onCaptureGps={handleCaptureGps} 
        gpsLoading={gpsLoading} 
      />

      <RewardModal 
        isOpen={showRewardModal} 
        onClose={() => setShowRewardModal(false)} 
        mode={rewardModalMode} 
        form={rewardForm} 
        setForm={setRewardForm} 
        onSave={handleSaveReward} 
      />

      <QrPreviewModal 
        isOpen={showQrPreviewModal} 
        onClose={() => setShowQrPreviewModal(false)} 
        previewCode={previewCode} 
        onDownloadQr={handleDownloadQr} 
        onCopyLink={handleCopyLink} 
      />

      <PaymentDetailModal 
        isOpen={showPaymentDetailModal} 
        onClose={() => setShowPaymentDetailModal(false)} 
        selectedPayment={selectedPayment} 
        extractTxFields={extractTxFields} 
        formatCentsToCop={formatCentsToCop} 
        onCopyToClipboard={handleCopyToClipboard} 
      />

      <footer className="py-4 px-6 text-center text-xs text-gray-500 mt-auto border-t border-gray-200 bg-white shadow-inner">
        © 2026 SAIO-XV Admin Portal. Creado por{' '}
        <a 
          href="https://www.adamind.cloud" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors duration-200"
        >
          Adamind Technologies
        </a>
      </footer>
    </div>
  );
}

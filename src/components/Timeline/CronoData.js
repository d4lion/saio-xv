import { 
  Sun, 
  Sunset, 
  Award, 
  Coffee, 
  Code, 
  Sparkles, 
  UserCheck, 
  Users, 
  Trophy 
} from "lucide-react";

// ==============================================================================
// 1. CONFIGURACIÓN DE PESTAÑAS (TABS)
// ==============================================================================
export const scheduleTabs = [
  { 
    id: 'manana', 
    label: 'Jornada Mañana', 
    icon: Sun,
    desc: 'Apertura, acreditaciones y talleres matutinos'
  },
  { 
    id: 'tarde', 
    label: 'Jornada Tarde', 
    icon: Sunset,
    desc: 'Receso comercial, paneles de industria y empleo'
  },
  { 
    id: 'cierre', 
    label: 'Cierre & Premiación', 
    icon: Award,
    desc: 'Premios del ranking, sorteos VIP y clausura'
  },
];

// ==============================================================================
// 2. ACTIVIDADES DE LA JORNADA MAÑANA
// ==============================================================================
export const eventosManana = [
  {
    id: 1,
    time: '08:00 AM - 09:00 AM',
    title: 'Registro & Acreditaciones',
    subtitle: 'Recepción y credenciales NFC',
    location: 'Lobby Principal',
    category: 'Acreditación',
    icon: UserCheck,
    color: '#9c3aed',
    tags: ['Acreditación', 'Welcome Kit'],
    description: 'Apertura de puertas, verificación QR de boletas y entrega del kit oficial de bienvenida SAIO XV.'
  },
  {
    id: 2,
    time: '09:00 AM - 10:15 AM',
    title: 'Keynote Inaugural: El Futuro de la IA',
    subtitle: 'Conferencia magistral con líderes tech',
    location: 'Auditorio Entropix',
    category: 'Conferencia',
    icon: Sparkles,
    color: '#9c3aed',
    tags: ['Keynote', 'IA Emergente', 'Big Data'],
    description: 'Inauguración oficial. Análisis de macrotendencias en inteligencia artificial y ciencia de datos.'
  },
  {
    id: 3,
    time: '10:30 AM - 12:30 PM',
    title: 'Talleres Prácticos & Data Labs',
    subtitle: 'Sesiones guiadas por mentores',
    location: 'Salas de Innovación 1 & 2',
    category: 'Talleres',
    icon: Code,
    color: '#4c29b6',
    tags: ['Hands-on', 'Python', 'LLMs'],
    description: 'Workshops en paralelo: desarrollo de modelos con PyTorch y canalizaciones de IA generativa.'
  }
];

// ==============================================================================
// 3. ACTIVIDADES DE LA JORNADA TARDE
// ==============================================================================
export const eventosTarde = [
  {
    id: 4,
    time: '12:30 PM - 02:00 PM',
    title: 'Receso & Experiencia Comercial',
    subtitle: 'Almuerzo, networking y stands',
    location: 'Plaza Central & Food Area',
    category: 'Networking',
    icon: Coffee,
    color: '#828dbc',
    tags: ['Break', 'Stands', 'Puntos SAIO'],
    description: 'Recorrido por comercios aliados, interacción con patrocinadores y escaneo de códigos de puntos.'
  },
  {
    id: 5,
    time: '02:00 PM - 03:45 PM',
    title: 'Panel de Industria: Empleabilidad',
    subtitle: 'Conexión con empresas y reclutadores',
    location: 'Auditorio Entropix',
    category: 'Panel',
    icon: Users,
    color: '#c3abdc',
    tags: ['Empleabilidad', 'Talent Connect'],
    description: 'Descubre qué competencias buscan las grandes empresas tecnológicas y cómo acelerar tu carrera.'
  }
];

// ==============================================================================
// 4. ACTIVIDADES DE CIERRE & PREMIACIÓN
// ==============================================================================
export const eventosCierre = [
  {
    id: 6,
    time: '04:00 PM - 05:30 PM',
    title: 'Premiación & Cierre Oficial',
    subtitle: 'Sorteos VIP y entrega de premios',
    location: 'Escenario Principal',
    category: 'Clausura',
    icon: Trophy,
    color: '#30227f',
    tags: ['Premios VIP', 'Ranking Top', 'Clausura'],
    description: 'Reconocimiento a los líderes del Ranking SAIO XV, entrega de recompensas exclusivas y cierre del evento.'
  }
  

];

// ==============================================================================
// 5. OBJETO CONSOLIDADO PARA EL COMPONENTE TIMELINE
// ==============================================================================
export const scheduleData = {
  manana: eventosManana,
  tarde: eventosTarde,
  cierre: eventosCierre,
};
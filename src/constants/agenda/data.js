import {
  UserCheck,
  Sparkles,
  Mic,
  Wrench,
  MessageCircleQuestionMark,
  Gift,
  Coffee,
  UtensilsCrossed,
  Flag,
} from 'lucide-react'

// ==============================================================================
// 1. CATEGORÍAS (icono, color y etiqueta visible)
// ==============================================================================
export const AGENDA_CATEGORIES = {
  registro:  { label: 'Registro',    icon: UserCheck,                 color: '#828dbc' },
  ceremonia: { label: 'Ceremonia',   icon: Sparkles,                  color: '#c3abdc' },
  charla:    { label: 'Charla',      icon: Mic,                       color: '#a855f7' },
  panel:     { label: 'Panel',       icon: Mic,                       color: '#8b5cf6' },
  taller:    { label: 'Taller',      icon: Wrench,                    color: '#22d3ee' },
  preguntas: { label: 'Preguntas',   icon: MessageCircleQuestionMark, color: '#94a3b8' },
  marca:     { label: 'Activación',  icon: Gift,                      color: '#f472b6' },
  refrigerio:{ label: 'Refrigerio',  icon: Coffee,                    color: '#fbbf24' },
  almuerzo:  { label: 'Almuerzo',    icon: UtensilsCrossed,           color: '#fb923c' },
  cierre:    { label: 'Cierre',      icon: Flag,                      color: '#c3abdc' },
}

// Categorías que se muestran como "pausa" (tarjeta compacta, menos protagonismo)
export const COMPACT_CATEGORIES = ['preguntas', 'refrigerio', 'almuerzo']

// ==============================================================================
// 2. FILTROS RÁPIDOS (chips)
// ==============================================================================
export const AGENDA_FILTERS = [
  { id: 'todo',     label: 'Todo',               categories: null },
  { id: 'charlas',  label: 'Charlas y paneles',  categories: ['charla', 'panel'] },
  { id: 'talleres', label: 'Talleres',           categories: ['taller'] },
  { id: 'comida',   label: 'Comida',             categories: ['refrigerio', 'almuerzo'] },
  { id: 'marcas',   label: 'Activaciones',       categories: ['marca'] },
]

// ==============================================================================
// 3. CRONOGRAMA POR DÍA
//    · start / end en formato 24h 'HH:MM' (hora Colombia, UTC-5)
//    · location: null => "Lugar por confirmar"
//    · note: detalle adicional opcional
//    · badge: etiqueta destacada opcional (p. ej. certificado)
// ==============================================================================
export const AGENDA_DAYS = [
  {
    id: 1,
    date: '2026-10-15',
    weekday: 'Jueves',
    shortWeekday: 'Jue',
    dayNumber: '15',
    month: 'Oct',
    theme: 'Analítica & Liderazgo',
    activities: [
      { id: 'd1-01', start: '07:00', end: '07:30', title: 'Acreditación y Registro', category: 'registro', location: 'Lobby / Entrada Principal' },
      {
        id: 'd1-02', start: '07:30', end: '08:10', title: 'Bienvenida e Inauguración', category: 'ceremonia', location: 'Auditorio Principal',
        note: 'Palabras del Vicedecano Académico, Samuel, Majo y Vale Correa, con la Banda de Minas.',
      },
      { id: 'd1-03', start: '08:10', end: '09:00', title: 'Conferencia de Analítica', category: 'charla', location: 'Auditorio Principal' },
      { id: 'd1-04', start: '09:00', end: '09:10', title: 'Espacio de Preguntas', category: 'preguntas', location: 'Zona de Networking / Hall' },
      { id: 'd1-05', start: '09:10', end: '09:25', title: 'Activación de Marca #1', category: 'marca', location: 'Auditorio Principal' },
      { id: 'd1-06', start: '09:25', end: '09:45', title: 'Refrigerio #1', category: 'refrigerio', location: 'Zona de Networking / Hall' },
      { id: 'd1-07', start: '09:45', end: '10:45', title: 'Panel de Expertos: Liderazgo', category: 'panel', location: 'Salones de Taller' },
      { id: 'd1-08', start: '10:45', end: '11:00', title: 'Activación de Marca #2', category: 'marca', location: 'Auditorio Principal', note: 'Con Cabaña del Coco.' },
      { id: 'd1-09', start: '11:00', end: '11:40', title: 'Charla TED: Liderazgo', category: 'charla', location: 'Auditorio Principal' },
      { id: 'd1-10', start: '11:40', end: '11:50', title: 'Espacio de Preguntas', category: 'preguntas', location: 'Zona de Networking / Hall' },
      { id: 'd1-11', start: '11:50', end: '13:00', title: 'Pausa para Almuerzo', category: 'almuerzo', location: 'Libre / Plazoleta de Comidas' },
      { id: 'd1-12', start: '13:00', end: '14:00', title: 'Taller Práctico #1: Liderazgo & Networking', category: 'taller', location: 'Salones de Taller (2)' },
      { id: 'd1-13', start: '14:00', end: '14:30', title: 'Refrigerio #2', category: 'refrigerio', location: null },
      { id: 'd1-14', start: '14:30', end: '15:40', title: 'Taller Práctico #2: Analítica', category: 'taller', location: 'Salones de Taller (3)', badge: 'Con certificado' },
      { id: 'd1-15', start: '15:40', end: '16:00', title: 'Cierre General', category: 'cierre', location: 'Salones de Taller' },
    ],
  },
  {
    id: 2,
    date: '2026-10-16',
    weekday: 'Viernes',
    shortWeekday: 'Vie',
    dayNumber: '16',
    month: 'Oct',
    theme: 'IA & Impacto Social',
    activities: [
      { id: 'd2-01', start: '08:00', end: '08:30', title: 'Acreditación y Registro', category: 'registro', location: 'Lobby / Entrada' },
      { id: 'd2-02', start: '08:30', end: '08:40', title: 'Bienvenida e Inauguración Día 2', category: 'ceremonia', location: 'Salones de Taller' },
      { id: 'd2-03', start: '08:40', end: '09:40', title: 'Talleres Simultáneos: IA', category: 'taller', location: 'Salones de Taller' },
      { id: 'd2-04', start: '09:40', end: '10:10', title: 'Refrigerio #3', category: 'refrigerio', location: 'Hall de la Biblioteca' },
      { id: 'd2-05', start: '10:10', end: '11:10', title: 'Panel de Impacto Social', category: 'panel', location: 'Auditorio Principal' },
      { id: 'd2-06', start: '11:10', end: '11:20', title: 'Espacio de Preguntas', category: 'preguntas', location: 'Libre / Plazoleta' },
      { id: 'd2-07', start: '11:20', end: '11:35', title: 'Activación de Marca #3', category: 'marca', location: 'Zona de Hall / Networking' },
      { id: 'd2-08', start: '11:35', end: '12:20', title: 'Charla TED: IA', category: 'charla', location: 'Auditorio Principal' },
      { id: 'd2-09', start: '12:20', end: '12:30', title: 'Espacio de Preguntas', category: 'preguntas', location: 'Zona de Hall / Networking' },
      { id: 'd2-10', start: '12:30', end: '12:45', title: 'Activación de Marca #4', category: 'marca', location: null },
      { id: 'd2-11', start: '12:45', end: '14:15', title: 'Pausa para Almuerzo', category: 'almuerzo', location: 'Libre / Plazoleta' },
      { id: 'd2-12', start: '14:15', end: '15:20', title: 'Conferencia de Impacto Social', category: 'charla', location: 'Auditorio Principal' },
      { id: 'd2-13', start: '15:20', end: '15:35', title: 'Activación de Marca #5', category: 'marca', location: 'Auditorio Principal' },
      { id: 'd2-14', start: '15:35', end: '15:50', title: 'Cierre General', category: 'cierre', location: null },
      { id: 'd2-15', start: '15:50', end: '15:50', title: 'Refrigerio #4', category: 'refrigerio', location: null, note: 'Se entrega al finalizar el evento.' },
    ],
  },
]

// src/theme/tokens.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARCHIVO SAGRADO — CHAMA DESIGN SYSTEM
// Todos los valores visuales de la app viven aquí.
// Ningún componente define colores, espaciados ni
// tipografías fuera de este archivo.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── COLORES ──────────────────────────────────────────
export const colors = {
  // Fondos (de más oscuro a más claro)
  ink:       '#0A0F1E',   // Fondo principal
  ink2:      '#131929',   // Superficies / cards
  ink3:      '#1C2640',   // Bordes / inputs activos

  // Marca principal
  teal:      '#0EC4A0',   // Acción primaria
  tealDark:  '#0A9678',   // Hover / pressed
  tealLight: 'rgba(14, 196, 160, 0.12)',  // Fondos teal suaves

  // Semánticos
  gold:      '#F5A623',   // Advertencia / pendiente
  goldLight: 'rgba(245, 166, 35, 0.12)',
  coral:     '#E85A4F',   // Error / fallido
  coralLight:'rgba(232, 90, 79, 0.12)',
  success:   '#0EC4A0',   // Confirmado (alias de teal)

  // Texto
  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textTertiary:  'rgba(255, 255, 255, 0.30)',
  textDisabled:  'rgba(255, 255, 255, 0.20)',

  // Bordes
  borderSubtle:  'rgba(255, 255, 255, 0.06)',
  borderDefault: 'rgba(255, 255, 255, 0.10)',
  borderStrong:  'rgba(255, 255, 255, 0.20)',

  // Utilidades
  white:       '#FFFFFF',
  transparent: 'transparent',
} as const

// ── TIPOGRAFÍA ────────────────────────────────────────
export const typography = {
  // Familias
  families: {
    sans: undefined,        // Sistema (SF Pro en iOS, Roboto en Android)
    mono: 'SpaceMono',      // Para @usernames, hashes, montos exactos
  },

  // Tamaños
  sizes: {
    xs:    11,
    sm:    13,
    base:  15,
    md:    17,
    lg:    20,
    xl:    24,
    '2xl': 30,
    '3xl': 38,
    '4xl': 48,
  },

  // Pesos
  weights: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
  },

  // Altura de línea
  lineHeights: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },

  // Espaciado de letras
  letterSpacings: {
    tight:  -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1.5,
    widest:  3,
  },
} as const

// ── ESPACIADO ─────────────────────────────────────────
// Escala de 4pt. Todos los márgenes y paddings usan estos valores.
export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
} as const

// ── RADIOS DE BORDE ───────────────────────────────────
export const radii = {
  none:   0,
  sm:     6,
  md:     10,
  lg:     14,
  xl:     20,
  '2xl':  28,
  full:   9999,
} as const

// ── SOMBRAS ───────────────────────────────────────────
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  teal: {
    shadowColor: '#0EC4A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const

// ── DURACIONES DE ANIMACIÓN ───────────────────────────
export const durations = {
  instant: 0,
  fast:    150,
  normal:  250,
  slow:    400,
  slower:  600,
} as const

// ── TAMAÑOS DE ICONOS ─────────────────────────────────
export const iconSizes = {
  xs:  14,
  sm:  16,
  md:  20,
  lg:  24,
  xl:  32,
  '2xl': 40,
} as const

// ── Z-INDEX ───────────────────────────────────────────
export const zIndex = {
  base:    0,
  raised:  10,
  modal:   100,
  toast:   200,
  overlay: 300,
} as const

// ── CONSTANTES DE LAYOUT ──────────────────────────────
export const layout = {
  screenPaddingH:  spacing[5],   // 20px padding horizontal de pantallas
  screenPaddingV:  spacing[6],   // 24px padding vertical de pantallas
  tabBarHeight:    64,
  headerHeight:    56,
  inputHeight:     52,
  buttonHeight:    52,
  buttonHeightSm:  40,
  cardPadding:     spacing[5],
  sectionGap:      spacing[8],
} as const

// ── EXPORTACIÓN UNIFICADA ─────────────────────────────
const tokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  durations,
  iconSizes,
  zIndex,
  layout,
} as const

export default tokens
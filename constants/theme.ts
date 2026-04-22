/**
 * twae — Design System Tokens
 * 
 * Primary: Blue gradient (dark navy → royal blue → bright blue)
 * Accents: Red, Dark Yellow/Gold, Light Green, Dark Sky Blue, Dull White
 * Typography: Bricolage Grotesque (headings) + Inter (body)
 */

export const Colors = {
  // ── Primary Blue Gradient ──
  g1: '#1a3575',
  g2: '#3264d1',
  g3: '#4a7aff',
  gsheen: '#7aa2ff',

  // ── Gold / Dark Yellow Accent ──
  gold1: '#b8860b',
  gold2: '#d4a017',
  gold3: '#f0c040',
  goldsheen: '#ffd700',

  // ── Surface & Background (Dull White) ──
  bg: '#ffffff',
  surface: '#f4f7f4',
  card: '#ffffff',
  cardHighlight: '#e8ece8',

  // ── Text ──
  text: '#000c26',
  muted: '#5c6b8a',
  dim: '#a3b0c7',

  // ── Semantic Accents ──
  red: '#ef4444',
  green: '#22c55e',
  greenBright: '#4ade80',
  blue: '#3b82f6',
  skyDark: '#1e5fa8',

  // ── Auth Orb Colors ──
  orbGreen: 'rgba(0,90,46,.5)',
  orbGold: 'rgba(180,130,0,.3)',

  // ── Transparent Variants ──
  whiteAlpha08: 'rgba(255,255,255,.08)',
  whiteAlpha10: 'rgba(255,255,255,.1)',
  whiteAlpha15: 'rgba(255,255,255,.15)',
  whiteAlpha45: 'rgba(255,255,255,.45)',
  whiteAlpha55: 'rgba(255,255,255,.55)',
  whiteAlpha65: 'rgba(255,255,255,.65)',
  whiteAlpha75: 'rgba(255,255,255,.75)',
  blackAlpha04: 'rgba(0,0,0,.04)',
  blackAlpha05: 'rgba(0,0,0,.05)',
  blackAlpha15: 'rgba(0,0,0,.15)',
  blackAlpha25: 'rgba(0,0,0,.25)',
  blackAlpha40: 'rgba(0,0,0,.4)',
} as const;

// ── LIGHT PALETTE ──────────────────────────────────
export const LightColors = { ...Colors };

// ── DARK PALETTE ───────────────────────────────────
export const DarkColors = {
  ...Colors,

  // ── Surface & Background ──
  bg: '#0d1117',
  surface: '#161b22',
  card: '#1c2128',
  cardHighlight: '#2d333b',

  // ── Text ──
  text: '#e6edf3',
  muted: '#8b949e',
  dim: '#484f58',

  // ── Auth Orb Colors ──
  orbGreen: 'rgba(0,180,92,.4)',
  orbGold: 'rgba(220,160,0,.25)',

  // ── Transparent Variants (inverted) ──
  blackAlpha04: 'rgba(255,255,255,.04)',
  blackAlpha05: 'rgba(255,255,255,.06)',
  blackAlpha15: 'rgba(255,255,255,.12)',
  blackAlpha25: 'rgba(255,255,255,.2)',
  blackAlpha40: 'rgba(255,255,255,.35)',
} as const;

export const Gradients = {
  primary: ['#3264d1', '#4a7aff'],
  primaryFull: ['#1a3575', '#3264d1', '#4a7aff'],
  dashTop: ['#1a3575', '#3264d1', '#000c26'],
  gold: ['#b8860b', '#d4a017'],
  goldFull: ['#b8860b', '#8a6508'],
  ngnCard: ['#1a3575', '#4a7aff', '#3264d1'],
  usdCard: ['#122452', '#3264d1', '#1a3575'],
  savingsCard: ['#1a3575', '#1a3575', '#122452'],
} as const;

export const Radii = {
  pill: 999,
  card: 24,
  cardSm: 20,
  md: 16,
  sm: 14,
  xs: 12,
  xxs: 8,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 52,
} as const;

export const Fonts = {
  heading: 'BricolageGrotesque',
  headingLight: 'BricolageGrotesque_300',
  headingRegular: 'BricolageGrotesque_400',
  headingMedium: 'BricolageGrotesque_500',
  headingSemiBold: 'BricolageGrotesque_600',
  body: 'Inter',
  bodyLight: 'Inter_300',
  bodyRegular: 'Inter_400',
  bodyMedium: 'Inter_500',
  bodySemiBold: 'Inter_600',
} as const;

export const FontSizes = {
  xxxs: 9,
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 18,
  '3xl': 20,
  '4xl': 24,
  '5xl': 28,
  '6xl': 30,
  '7xl': 34,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  cardMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 4,
  },
  cardLg: {
    shadowColor: '#3264d1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 36,
    elevation: 8,
  },
  nav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 10,
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const Timing = {
  fast: 200,
  normal: 280,
  slow: 400,
  verySlow: 600,
} as const;

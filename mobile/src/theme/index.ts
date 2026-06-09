const BASE = 4;

export const spacing = {
  xs: BASE,
  sm: BASE * 2,
  md: BASE * 4,
  lg: BASE * 6,
  xl: BASE * 8,
  xxl: BASE * 12,
  xxxl: BASE * 16,
} as const;

// Dark navy + blue palette
export const colors = {
  primary: {
    50: 'rgba(59,130,246,0.10)',
    100: 'rgba(59,130,246,0.18)',
    200: 'rgba(59,130,246,0.28)',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  neutral: {
    0: '#FFFFFF',       // primary text
    50: '#F1F5F9',      // near-white text
    100: '#CBD5E1',     // light muted text
    200: '#94A3B8',     // muted text / labels
    300: '#64748B',     // very muted
    400: '#475569',     // placeholder / subtle text
    500: '#334155',     // borders / dividers
    600: '#293548',     // elevated surface
    700: '#1E293B',     // card / surface
    800: '#162032',     // slightly darker surface
    900: '#0F172A',     // main background
  },
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  transparent: 'transparent',
} as const;

export const gradients = {
  brand: ['#2563EB', '#1E3A8A'] as [string, string],
  brandSubtle: ['#1E3A8A', '#0F172A'] as [string, string],
  surface: ['#1E293B', '#162032'] as [string, string],
};

export const typography = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 38,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  brand: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
} as const;

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const theme = { spacing, colors, gradients, typography, shadows, borderRadius } as const;
export type Theme = typeof theme;

export const useTheme = (): Theme => theme;

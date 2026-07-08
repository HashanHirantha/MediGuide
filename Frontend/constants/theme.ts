// ─── Color Palette ──────────────────────────────────────────
export const colors = {
  primary: '#4A90D9',
  primaryDark: '#2E6DB4',
  secondary: '#34C759',
  accent: '#FF6B6B',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  authCardBg: '#CDE7FA',
  black: '#1A1A1A',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  
  // App-Specific Global Theme Colors
  cardLight: '#C8E8FE', // Light blue used for settings cards and banners
  buttonDark: '#111827', // Dark black/blue for primary buttons
  textTertiary: '#4A5B69', // Muted text for subtitles and descriptions
  iconDark: '#2E4A62', // Darker blue used for primary icons
  iconLight: '#88B0C8', // Lighter blue used for secondary icons (e.g. chevrons)

  // Opacity / Glass Helpers
  overlay: 'rgba(0,0,0,0.5)',               // Modal overlays
  glassWhite: 'rgba(255,255,255,0.6)',       // Glass-like white overlay
  glassWhiteLight: 'rgba(255,255,255,0.5)',  // Lighter glass effect
  glassWhiteBright: 'rgba(255,255,255,0.8)', // Brighter glass effect
  subtleBorder: 'rgba(0,0,0,0.05)',          // Very subtle borders/dividers
  subtleBorderMed: 'rgba(0,0,0,0.1)',        // Slightly visible borders
  chipBorder: 'rgba(0,0,0,0.15)',            // Chip borders

  // Semantic / Status Colors
  searchBg: '#E6F4FE',                       // Search input background
  successBg: '#E8F9EE',                      // Success state background
  successText: '#34C759',                     // Success green
  errorBg: '#FFF0F0',                         // Error card background
  errorText: '#CC0000',                       // Error text
  warningText: '#7A5F00',                     // Warning/disclaimer text
  dangerText: '#D32F2F',                      // Danger/destructive text

  // Star / Rating
  starColor: '#F5A623',                       // Star rating gold
  starColorAlt: '#FF9500',                    // Alt star/pending color

  // FAB / Avatar
  fabBg: '#385F85',                           // FAB button background
  avatarPlaceholderBg: '#E1E8ED',             // Avatar placeholder background

  // Summary / Confirmation
  summaryBg: '#E8F5E9',                       // Summary card background
  summaryText: '#2E7D32',                     // Summary label text
} as const;

// ─── Spacing ─────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Typography ───────────────────────────────────────────────
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h1Serif: {
    fontSize: 36,
    fontFamily: 'serif',
    fontWeight: '700' as const,
    lineHeight: 42,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

// ─── Border Radius ────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Shadow Presets ───────────────────────────────────────────
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

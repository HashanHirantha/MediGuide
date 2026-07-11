/**
 * -------------------------------------------------------------
 * MediGuide Admin Dashboard Theme
 * -------------------------------------------------------------
 * Shared design tokens for colors, typography, spacing,
 * border radius, shadows and status colors.
 * -------------------------------------------------------------
 */

import { StyleSheet } from "react-native";

export const Colors = {
  // Brand Colors
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  secondary: "#14B8A6",
  secondaryLight: "#CCFBF1",

  accent: "#8B5CF6",
  accentLight: "#F3E8FF",

  // Backgrounds
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  // Borders
  border: "#E2E8F0",
  divider: "#F1F5F9",

  // Status Colors
  success: "#22C55E",
  successBackground: "#ECFDF5",

  warning: "#F59E0B",
  warningBackground: "#FEF3C7",

  danger: "#EF4444",
  dangerBackground: "#FEE2E2",

  info: "#3B82F6",
  infoBackground: "#DBEAFE",

  pending: "#F97316",
  pendingBackground: "#FFEDD5",

  verified: "#10B981",
  verifiedBackground: "#D1FAE5",

  inactive: "#64748B",
  inactiveBackground: "#F1F5F9",

  // Analytics
  chartBlue: "#2563EB",
  chartGreen: "#22C55E",
  chartPurple: "#8B5CF6",
  chartOrange: "#F59E0B",
  chartRed: "#EF4444",
  chartTeal: "#14B8A6",

  // Drawer
  drawerBackground: "#FFFFFF",
  drawerActive: "#2563EB",
  drawerInactive: "#64748B",

  // Overlay
  overlay: "rgba(15,23,42,0.45)",
};

export const Typography = {
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,

  body: 15,
  bodySmall: 13,

  caption: 12,

  button: 15,
};

export const FontWeight = {
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  small: 8,
  medium: 14,
  large: 20,
  xLarge: 28,
  circle: 999,
};

export const Shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
};

export const Layout = {
  screenPadding: 20,
  cardPadding: 18,
  headerHeight: 72,
  drawerWidth: 300,
};

export const AppStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  container: {
    paddingHorizontal: Layout.screenPadding,
  },

  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.large,
    padding: Layout.cardPadding,
    ...Shadow.card,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});

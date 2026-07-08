import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, radius, shadows } from './theme';

export const globalStyles = StyleSheet.create({
  // ─── Layout ────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  
  // ─── Typography ────────────────────────────────────────────
  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pageDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 10,
    lineHeight: 45,
  },

  // ─── Greeting ──────────────────────────────────────────────
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
    color: colors.black,
    marginBottom: 6,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 30,
  },

  // ─── Cards ─────────────────────────────────────────────────
  card: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  cardPadded: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  
  // ─── Rows ──────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  rowTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowTitle: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  
  // ─── Elements ──────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.subtleBorder,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.glassWhiteLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  // ─── Buttons ───────────────────────────────────────────────
  buttonPrimary: {
    backgroundColor: colors.buttonDark,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonPrimaryText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginRight: 10,
  },
  signOutButton: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: {
    fontSize: 16,
    color: colors.dangerText,
  },
  resetButton: {
    backgroundColor: colors.buttonDark,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  resetButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // ─── Forms ─────────────────────────────────────────────────
  inputGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },

  // ─── Avatars and Profile Cards ─────────────────────────────
  profileCard: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.cardLight,
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.buttonDark,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardLight,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  profileTier: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },

  // ─── Filters and Chips ─────────────────────────────────────
  filterList: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.buttonDark,
  },
  filterChipInactive: {
    backgroundColor: colors.authCardBg,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.surface,
  },
  filterTextInactive: {
    color: colors.textTertiary,
  },

  // ─── Selection Chips (symptom/duration/date/time) ──────────
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.chipBorder,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.glassWhiteLight,
  },
  chipSelected: {
    backgroundColor: colors.buttonDark,
    borderColor: colors.buttonDark,
  },
  chipText: {
    fontSize: 14,
    color: colors.black,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  chipIcon: {
    marginLeft: 5,
  },
  selectionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: colors.subtleBorderMed,
  },
  selectionChipActive: {
    backgroundColor: colors.buttonDark,
    borderColor: colors.buttonDark,
  },
  selectionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  selectionChipTextActive: {
    color: colors.surface,
  },

  // ─── Search ────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 52,
    marginBottom: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassWhite,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.buttonDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    gap: 8,
  },
  searchLoadingText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  searchResultsContainer: {
    marginTop: 10,
    backgroundColor: colors.glassWhiteBright,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    gap: 10,
  },
  searchResultText: {
    fontSize: 15,
    color: colors.black,
  },

  // ─── Specialty Badge ───────────────────────────────────────
  specialtyBadge: {
    backgroundColor: colors.glassWhite,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },

  // ─── Rating ────────────────────────────────────────────────
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassWhite,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },

  // ─── Stats ─────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.glassWhite,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  statBoxCentered: {
    flex: 1,
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.black,
  },

  // ─── Compact Card ──────────────────────────────────────────
  compactCard: {
    backgroundColor: colors.authCardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  compactSpecialty: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },

  // ─── Notes / Multiline Input ───────────────────────────────
  notesInput: {
    backgroundColor: colors.glassWhite,
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: colors.black,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },

  // ─── Bottom Fixed Bar ──────────────────────────────────────
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ─── Section Header (icon + title) ─────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  // ─── Section Spacing ───────────────────────────────────────
  section: {
    marginBottom: spacing.xl,
  },

  // ─── List / Screen Padding ─────────────────────────────────
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  headerPadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    gap: 16,
    paddingBottom: 10,
  },
  listPadding: {
    padding: spacing.lg,
  },

  // ─── Footer / Bottom Bar (non-fixed) ───────────────────────
  footerBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  // ─── Step Progress ─────────────────────────────────────────
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.black,
    borderRightColor: colors.subtleBorderMed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  progressCircleDone: {
    borderColor: colors.successText,
    borderRightColor: colors.successText,
    backgroundColor: colors.successBg,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  progressTextDone: {
    color: colors.successText,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.black,
  },

  // ─── Duration / Hint ───────────────────────────────────────
  durationHint: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 12,
  },

  // ─── Disclaimer / Error ────────────────────────────────────
  disclaimer: {
    fontSize: 13,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  errorCard: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.errorText,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },

  // ─── Insights / Results ────────────────────────────────────
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassWhite,
    borderRadius: radius.md,
    padding: 15,
    marginBottom: 10,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  insightDetails: {
    flex: 1,
  },
  insightName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  insightPossibility: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  insightPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  recommendationIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  linkText: {
    fontWeight: '700',
    color: colors.primary,
  },

  // ─── Home Cards ────────────────────────────────────────────
  homeCard: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  homeCardIcon: {
    marginBottom: 30,
  },
  homeCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
    color: colors.black,
    marginBottom: 6,
    lineHeight: 28,
  },
  homeCardSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ─── FAB ───────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.fabBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.fab,
  },

  // ─── TopBar ────────────────────────────────────────────────
  topBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  topBarIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  topBarAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // ─── Tab Center Button ─────────────────────────────────────
  tabCenterButton: {
    backgroundColor: colors.buttonDark,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.elevated,
  },

  // ─── Featured Doctor Card ──────────────────────────────────
  featuredCard: {
    backgroundColor: colors.authCardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  featuredTop: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  featuredImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  featuredBio: {
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 18,
  },

  // ─── Small Buttons (book, cancel) ──────────────────────────
  bookButtonSmall: {
    backgroundColor: colors.glassWhite,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glassWhiteBright,
  },
  bookButtonSmallText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  cancelBtn: {
    backgroundColor: colors.glassWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glassWhiteBright,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },

  // ─── Date Row ──────────────────────────────────────────────
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  dateTextSecondary: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  rightActions: {
    alignItems: 'flex-end',
    gap: 8,
  },

  // ─── Diagnosis Icon Container ──────────────────────────────
  diagIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.glassWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Auth Screens ──────────────────────────────────────────
  authContainer: {
    flex: 1,
    backgroundColor: colors.authCardBg,
  },
  authContainerAlt: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  authScroll: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  authHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  authHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  authLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authLogoText: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  authHelpButton: {
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  authIconButton: {
    padding: spacing.xs,
  },
  authUserIconBg: {
    backgroundColor: colors.authCardBg,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTitleArea: {
    marginBottom: spacing.xl,
  },
  authTitleAreaCompact: {
    marginBottom: spacing.lg,
  },
  authTitle: {
    ...typography.h1Serif,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  authTitlePlain: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  authSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
  },
  authError: {
    color: colors.accent,
    marginBottom: spacing.md,
    ...typography.caption,
  },
  authCard: {
    backgroundColor: colors.authCardBg,
    borderRadius: radius.xl,
    paddingTop: spacing.lg,
  },
  authCardPadded: {
    backgroundColor: colors.authCardBg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  authForgotLink: {
    color: colors.textPrimary,
    ...typography.caption,
    fontWeight: '700',
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  authSignInBtn: {
    marginBottom: spacing.xl,
    paddingVertical: 18,
  },
  authDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.subtleBorderMed,
  },
  authDividerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    letterSpacing: 0.5,
  },
  authSocialContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  authSocialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 100,
    gap: spacing.sm,
  },
  authSocialText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  authFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
  authFooterCentered: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  authFooterText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  authLink: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  authCopyright: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: '600',
  },

  // ─── Modal ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  // ─── Register Avatar ───────────────────────────────────────
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarPickerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatarFull: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // ─── Checkbox ──────────────────────────────────────────────
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
    paddingRight: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    marginRight: spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  checkboxText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // ─── Row Helpers (register) ────────────────────────────────
  formRow: {
    flexDirection: 'row',
    width: '100%',
  },
  flexHalf: {
    flex: 1,
  },
  spacer: {
    width: spacing.md,
  },

  // ─── Doctor Detail ─────────────────────────────────────────
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: colors.glassWhite,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingTextLarge: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textTertiary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.glassWhiteLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  dividerIndented: {
    height: 1,
    backgroundColor: colors.subtleBorder,
    marginLeft: 50,
  },

  // ─── Reviews ───────────────────────────────────────────────
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.iconDark,
    marginBottom: 12,
  },
  reviewItem: {
    backgroundColor: colors.glassWhiteLight,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 20,
  },

  // ─── Fee Label ─────────────────────────────────────────────
  feeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  feeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  feeBadge: {
    backgroundColor: colors.glassWhite,
    borderRadius: radius.md,
    padding: 10,
    alignItems: 'center',
  },
  feeBadgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  feeBadgeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },

  // ─── Date Picker Chips ─────────────────────────────────────
  dateChipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateChip: {
    width: 64,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.glassWhiteLight,
  },
  dateChipActive: {
    backgroundColor: colors.buttonDark,
  },
  dateDay: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  dateChipTextActive: {
    color: colors.surface,
  },

  // ─── Time Grid Chips ───────────────────────────────────────
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.glassWhiteLight,
  },
  timeChipActive: {
    backgroundColor: colors.buttonDark,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  timeChipTextActive: {
    color: colors.surface,
  },

  // ─── Summary Card ──────────────────────────────────────────
  summaryCard: {
    backgroundColor: colors.summaryBg,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.summaryText,
    letterSpacing: 1,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },

  // ─── Appointment Detail ────────────────────────────────────
  appointmentDoctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  appointmentHospital: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  appointmentStatusRow: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  appointmentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appointmentRowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  appointmentRowValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  appointmentNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  appointmentError: {
    fontSize: 16,
    color: colors.accent,
    padding: spacing.lg,
    textAlign: 'center',
  },

  // ─── Utilities ─────────────────────────────────────────────
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  bottomPadding: {
    height: 40,
  },
  disclaimerWarning: {
    fontSize: 12,
    color: colors.warningText,
    textAlign: 'center',
  },
});

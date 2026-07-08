import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors, spacing, radius } from '../../constants/theme';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { getDoctorImageUrl } from '../../utils/getDoctorImageUrl';
import {
  getAiCheckHistory,
  deleteAiCheckHistory,
  AiCheckHistoryEntry,
} from '../../services/aiCheckHistoryService';
import { subscribePatientAppointments } from '../../services/appointmentService';
import i18n from '../../i18n';

// ─── Helpers ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:   colors.starColorAlt,
  confirmed: colors.secondary,
  completed: colors.primary,
  cancelled: colors.accent,
  no_show:   '#4A90D9',
};

const RISK_COLORS: Record<string, string> = {
  LOW:      '#34C759',
  MODERATE: '#FF9500',
  HIGH:     '#FF6B6B',
  CRITICAL: '#FF3B30',
};

const RISK_BG: Record<string, string> = {
  LOW:      '#E8F9EE',
  MODERATE: '#FFF3E0',
  HIGH:     '#FFE8E8',
  CRITICAL: '#FFE0E0',
};

function getRiskColor(risk: string) { return RISK_COLORS[risk?.toUpperCase()] ?? '#6B7280'; }
function getRiskBg(risk: string)    { return RISK_BG[risk?.toUpperCase()] ?? '#F3F4F6'; }

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

// ─── Main Screen ─────────────────────────────────────────────

export default function HistoryScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments]       = useState<any[]>([]);
  const [diagnosisHistory, setDiagnosisHistory] = useState<AiCheckHistoryEntry[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState<'appointments' | 'diagnoses'>('appointments');
  const [expandedId, setExpandedId]           = useState<string | null>(null);
  const [refreshing, setRefreshing]           = useState(false);

  useEffect(() => { fetchHistory(); }, [user]);

  useFocusEffect(
    useCallback(() => { fetchHistory(); }, [user])
  );

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = subscribePatientAppointments(user.id, () => {
        fetchHistory();
      });
      return unsubscribe;
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    setLoading(true);

    // Local appointments from AsyncStorage
    let localAppts: any[] = [];
    try {
      const stored = await AsyncStorage.getItem('local_appointments');
      if (stored) localAppts = JSON.parse(stored);
    } catch (_) {}

    if (user) {
      const [apptRes, aiRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, doctors(*, profiles(first_name, last_name, profile_image))')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false }),
        getAiCheckHistory(user.id),
      ]);

      const supaAppts = apptRes.data ?? [];
      const supaIds   = new Set(supaAppts.map((a: any) => a.id));
      
      const uniqueLocal = localAppts.filter((localA: any) => {
        if (supaIds.has(localA.id)) return false;
        
        const isDuplicate = supaAppts.some((supaA: any) => 
          supaA.appointment_date == localA.appointment_date &&
          supaA.appointment_time == localA.appointment_time &&
          supaA.doctor_id == localA.doctor_id
        );
        
        return !isDuplicate;
      });
      
      setAppointments([...supaAppts, ...uniqueLocal]);
      setDiagnosisHistory(aiRes.data ?? []);
    } else {
      setAppointments(localAppts);
      setDiagnosisHistory([]);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  // ─── Cancel appointment ─────────────────────────────────────

  const handleCancel = (appointmentId: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          if (appointmentId.startsWith('local-')) {
            try {
              const stored = await AsyncStorage.getItem('local_appointments');
              if (stored) {
                const localAppts = JSON.parse(stored).filter((a: any) => a.id !== appointmentId);
                await AsyncStorage.setItem('local_appointments', JSON.stringify(localAppts));
              }
            } catch (_) {}
          } else {
            await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
          }
          fetchHistory();
        },
      },
    ]);
  };

  // ─── Delete AI check ─────────────────────────────────────────

  const handleDeleteCheck = (id: string) => {
    Alert.alert('Delete Record', 'Remove this diagnosis record from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAiCheckHistory(id);
          fetchHistory();
        },
      },
    ]);
  };

  // ─── Render appointment card ─────────────────────────────────

  const renderAppointmentCard = ({ item }: { item: any }) => {
    const doctor = item.doctors;
    const name = `Dr. ${doctor?.profiles?.first_name ?? ''} ${doctor?.profiles?.last_name ?? ''}`;

    return (
      <TouchableOpacity
        style={globalStyles.compactCard}
        onPress={() => router.push(`/appointments/${item.id}`)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: getDoctorImageUrl(doctor) }}
          style={globalStyles.compactImage}
        />
        <View style={globalStyles.compactInfo}>
          <Text style={globalStyles.compactName}>{name}</Text>
          <Text style={globalStyles.compactSpecialty}>{doctor?.specialty?.toUpperCase() || 'GENERAL'}</Text>
          <View style={globalStyles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.black} />
            <Text style={globalStyles.dateText}>
              {new Date(item.appointment_date).toLocaleDateString('en', {
                month: 'short', day: 'numeric',
              })} at {item.appointment_time}
            </Text>
          </View>
        </View>
        <View style={globalStyles.rightActions}>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? '#6B7280') + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? '#6B7280' }]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
          {['pending', 'confirmed'].includes(item.status) && (
            <TouchableOpacity style={globalStyles.cancelBtn} onPress={() => handleCancel(item.id)}>
              <Text style={globalStyles.cancelBtnText}>{i18n.t('history.cancel') || 'Cancel'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Render AI diagnosis card ─────────────────────────────────

  const renderDiagnosisCard = ({ item }: { item: AiCheckHistoryEntry }) => {
    const isExpanded = expandedId === item.id;
    const topCondition = item.conditions?.[0];
    const riskColor = getRiskColor(item.overall_risk);
    const riskBg    = getRiskBg(item.overall_risk);

    return (
      <TouchableOpacity
        style={styles.diagCard}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.9}
      >
        {/* Top accent bar colored by risk */}
        <View style={[styles.diagAccent, { backgroundColor: riskColor }]} />

        {/* Header row */}
        <View style={styles.diagHeader}>
          <View style={styles.diagIconBg}>
            <MaterialCommunityIcons name="stethoscope" size={22} color={colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.diagTitle} numberOfLines={1}>
              {topCondition?.name ?? 'AI Symptom Check'}
            </Text>
            <Text style={styles.diagDate}>
              {formatDate(item.created_at)} · {formatTime(item.created_at)}
            </Text>
          </View>

          <View style={styles.diagRight}>
            <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
              <Text style={[styles.riskText, { color: riskColor }]}>
                {item.overall_risk}
              </Text>
            </View>
            <Feather
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textSecondary}
              style={{ marginTop: 6 }}
            />
          </View>
        </View>

        {/* Symptom pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillRow}
          contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
        >
          {item.symptoms.map((s, i) => (
            <View key={i} style={styles.symptomPill}>
              <Text style={styles.symptomPillText}>{s}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Duration */}
        <View style={styles.metaRow}>
          <Feather name="clock" size={12} color={colors.textSecondary} />
          <Text style={styles.metaText}>{i18n.t('history.duration') || 'Duration:'} {item.duration}</Text>
          <Text style={styles.bulletSep}>·</Text>
          <Feather name="layers" size={12} color={colors.textSecondary} />
          <Text style={styles.metaText}>{item.conditions?.length ?? 0} {i18n.t('history.conditions') || 'conditions'}</Text>
        </View>

        {/* Expanded detail */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Conditions */}
            {item.conditions?.map((cond, i) => (
              <View key={i} style={styles.conditionRow}>
                <View style={[styles.conditionDot, { backgroundColor: getRiskColor(cond.risk_level) }]} />
                <Text style={styles.conditionName} numberOfLines={1}>{cond.name}</Text>
                <Text style={[styles.conditionRisk, { color: getRiskColor(cond.risk_level) }]}>
                  {cond.risk_level.toUpperCase()}
                </Text>
                <Text style={styles.conditionPct}>{cond.possibility_percent}%</Text>
              </View>
            ))}

            {/* Recommendation */}
            {item.recommendation && (
              <View style={styles.recommendationBox}>
                <Feather name="info" size={14} color={colors.primary} />
                <Text style={styles.recommendationText}>{item.recommendation}</Text>
              </View>
            )}

            {/* Specialist */}
            {item.recommended_specialist && (
              <View style={styles.specialistRow}>
                <MaterialCommunityIcons name="doctor" size={14} color={colors.textSecondary} />
                <Text style={styles.specialistText}>
                  {i18n.t('history.recommended') || 'Recommended:'} <Text style={{ color: colors.primary, fontWeight: '700' }}>{item.recommended_specialist}</Text>
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.bookAgainBtn}
                onPress={() => router.push('/(tabs)/check' as any)}
                activeOpacity={0.8}
              >
                <Feather name="refresh-cw" size={13} color={colors.primary} />
                <Text style={styles.bookAgainText}>{i18n.t('history.check_again') || 'Check Again'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteCheck(item.id)}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={13} color={colors.accent} />
                <Text style={styles.deleteText}>{i18n.t('history.delete') || 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ─── Empty state ─────────────────────────────────────────────

  const renderEmpty = () => {
    if (loading) return <LoadingSpinner />;
    if (activeTab === 'diagnoses') {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="stethoscope" size={48} color={colors.border} />
          <Text style={styles.emptyTitle}>{i18n.t('history.no_diagnoses_title') || 'No diagnosis records yet'}</Text>
          <Text style={styles.emptyDesc}>
            {i18n.t('history.no_diagnoses_desc') || 'Use the Symptom Checker to get AI-powered health insights. Your checks will be saved here automatically.'}
          </Text>
          <TouchableOpacity
            style={styles.emptyAction}
            onPress={() => router.push('/(tabs)/check' as any)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="brain" size={16} color="#fff" />
            <Text style={styles.emptyActionText}>{i18n.t('history.start_check') || 'Start Symptom Check'}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color={colors.border} />
        <Text style={styles.emptyTitle}>{i18n.t('history.no_appointments_title') || 'No appointments yet'}</Text>
        <Text style={styles.emptyDesc}>{i18n.t('history.no_appointments_desc') || 'Book a consultation with a specialist to see your appointments here.'}</Text>
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={() => router.push('/(tabs)/doctors' as any)}
          activeOpacity={0.8}
        >
          <Feather name="search" size={16} color="#fff" />
          <Text style={styles.emptyActionText}>{i18n.t('history.find_doctor') || 'Find a Doctor'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const listData = activeTab === 'appointments' ? appointments : diagnosisHistory;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />

      <FlatList
        ListHeaderComponent={
          <>
            {/* Title */}
            <View style={globalStyles.titleContainer}>
              <Text style={globalStyles.pageTitle}>{i18n.t('history.title') || 'My History'}</Text>
              <Text style={globalStyles.pageDescription}>
                {i18n.t('history.desc') || 'Your appointment and AI diagnosis records.'}
              </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {(['appointments', 'diagnoses'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const count = tab === 'appointments' ? appointments.length : diagnosisHistory.length;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab === 'appointments' ? (i18n.t('history.appointments') || 'Appointments') : (i18n.t('history.diagnoses') || 'AI Diagnoses')}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                        <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        data={listData}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={activeTab === 'appointments' ? renderAppointmentCard : renderDiagnosisCard}
        contentContainerStyle={[globalStyles.listContainer, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.black,
  },
  tabCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabCountActive: {
    backgroundColor: colors.primary,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: '#fff',
  },
  // Status badge (appointments)
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Diagnosis card
  diagCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  diagAccent: {
    height: 4,
  },
  diagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 8,
    gap: 12,
  },
  diagIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  diagDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  diagRight: {
    alignItems: 'flex-end',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Symptom pills
  pillRow: {
    paddingHorizontal: spacing.md,
    marginBottom: 8,
  },
  symptomPill: {
    backgroundColor: colors.primary + '12',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  symptomPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bulletSep: {
    color: colors.border,
    marginHorizontal: 2,
  },
  // Expanded section
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 4,
    backgroundColor: colors.surfaceAlt,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 8,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conditionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  conditionRisk: {
    fontSize: 11,
    fontWeight: '700',
  },
  conditionPct: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    width: 40,
    textAlign: 'right',
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.primary + '0F',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 19,
  },
  specialistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  specialistText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  bookAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  bookAgainText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.accent + '12',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginTop: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { globalStyles } from '../../constants/globalStyles';
import { colors, spacing } from '../../constants/theme';
import { TopBar } from '../../components/TopBar';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>
        
        <View style={styles.header}>
          <Text style={globalStyles.greetingTitle}>Hello, Dr. {profile?.last_name || profile?.first_name}</Text>
          <Text style={globalStyles.greetingSubtitle}>Welcome to your provider dashboard</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="calendar" size={24} color={colors.primary} />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Today's Appts</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="users" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total Patients</Text>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={globalStyles.sectionTitle}>Upcoming Appointments</Text>
          
          <View style={globalStyles.card}>
            <View style={styles.appointmentRow}>
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>10:00 AM</Text>
                <Text style={styles.durationText}>30 min</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>John Doe</Text>
                <Text style={styles.appointmentType}>General Checkup</Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="video" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.appointmentRow, { borderBottomWidth: 0 }]}>
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>11:30 AM</Text>
                <Text style={styles.durationText}>45 min</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>Jane Smith</Text>
                <Text style={styles.appointmentType}>Follow-up</Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="video" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  appointmentTime: {
    width: 70,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.subtleBorder,
    marginRight: spacing.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  durationText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appointmentType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

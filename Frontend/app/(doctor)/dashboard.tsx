import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { globalStyles } from '../../constants/globalStyles';
import { colors, spacing } from '../../constants/theme';
import { TopBar } from '../../components/TopBar';
import { getDoctorProfileByUserId } from '../../services/doctorService';
import { getDoctorAppointments, subscribeDoctorAppointments, updateAppointmentStatus } from '../../services/appointmentService';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (doctorProfile?.id) {
      const unsubscribe = subscribeDoctorAppointments(doctorProfile.id, () => {
        // Reload appointments on realtime update
        fetchAppointments(doctorProfile.id);
      });
      return unsubscribe;
    }
  }, [doctorProfile?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: docData } = await getDoctorProfileByUserId(profile!.id);
      if (docData) {
        setDoctorProfile(docData);
        await fetchAppointments(docData.id);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (doctorId: string) => {
    const { data } = await getDoctorAppointments(doctorId);
    if (data) {
      // Filter out completed/cancelled if desired, or show all
      setAppointments(data.filter(a => a.status === 'pending' || a.status === 'confirmed'));
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    await updateAppointmentStatus(appointmentId, status);
    // Optimistic update
    setAppointments(prev => prev.filter(a => a.id !== appointmentId || status === 'confirmed'));
    if (status === 'confirmed') {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status } : a));
    }
    setModalVisible(false);
  };

  const openSymptomModal = (appt: any) => {
    setSelectedAppointment(appt);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const todayAppointments = appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]);

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
            <Text style={styles.statValue}>{todayAppointments.length}</Text>
            <Text style={styles.statLabel}>Today's Appts</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="clock" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{appointments.filter(a => a.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
        </View>

        {/* Incoming/Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={globalStyles.sectionTitle}>Appointments ({appointments.length})</Text>
          
          {appointments.length === 0 ? (
            <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>No upcoming appointments.</Text>
          ) : (
            <View style={globalStyles.card}>
              {appointments.map((appt, index) => (
                <TouchableOpacity 
                  key={appt.id} 
                  style={[styles.appointmentRow, index === appointments.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => openSymptomModal(appt)}
                >
                  <View style={styles.appointmentTime}>
                    <Text style={styles.timeText}>{appt.appointment_time.slice(0, 5)}</Text>
                    <Text style={styles.dateText}>
                      {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.patientName}>{appt.profiles?.first_name} {appt.profiles?.last_name}</Text>
                    <Text style={styles.appointmentType}>
                      {appt.status === 'pending' ? '🟡 Pending Request' : '🟢 Confirmed'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.iconLight} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Symptom Summary Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAppointment && (
              <>
                <Text style={globalStyles.modalTitle}>Patient Details</Text>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Patient</Text>
                  <Text style={styles.modalValue}>{selectedAppointment.profiles?.first_name} {selectedAppointment.profiles?.last_name}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Date & Time</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {selectedAppointment.appointment_time.slice(0, 5)}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Symptoms Reported</Text>
                  <Text style={styles.modalValue}>{selectedAppointment.symptoms_text || 'No symptoms provided.'}</Text>
                </View>

                {selectedAppointment.diseases && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>AI Predicted Condition</Text>
                    <Text style={styles.modalValue}>{selectedAppointment.diseases.name} ({selectedAppointment.diseases.severity})</Text>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <Text style={styles.modalValue}>{selectedAppointment.status.toUpperCase()}</Text>
                </View>

                {selectedAppointment.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[globalStyles.buttonPrimary, { flex: 1, backgroundColor: colors.successBg, marginRight: spacing.sm }]}
                      onPress={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                    >
                      <Text style={[globalStyles.buttonPrimaryText, { color: colors.successText }]}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[globalStyles.buttonPrimary, { flex: 1, backgroundColor: colors.errorBg, marginLeft: spacing.sm }]}
                      onPress={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    >
                      <Text style={[globalStyles.buttonPrimaryText, { color: colors.errorText }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  style={[globalStyles.resetButton, { marginTop: spacing.md }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={globalStyles.resetButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
  dateText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 40,
  },
  modalSection: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
});

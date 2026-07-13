import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { TopBar } from '../../components/TopBar';
import { useAuth } from '../../hooks/useAuth';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import { getDoctorImageUrl } from '../../utils/getDoctorImageUrl';
import { cancelAppointment, subscribePatientAppointments } from '../../services/appointmentService';
import i18n from '../../i18n';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.starColorAlt,
  confirmed: colors.secondary,
  completed: colors.primary,
  cancelled: colors.accent,
  no_show: '#8E8E93',
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = subscribePatientAppointments(user.id, () => {
        fetchAppointment();
      });
      return unsubscribe;
    }
  }, [user?.id, id]);

  const fetchAppointment = async () => {
    // 1. Try Supabase
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctors(specialty, hospital_name, consultation_fee, profiles(first_name, last_name, profile_image))')
      .eq('id', id)
      .single();
      
    if (data) {
      setAppointment(data);
      setLoading(false);
      return;
    }

    // 2. Try AsyncStorage (local appointments)
    try {

      const stored = await AsyncStorage.getItem('local_appointments');
      if (stored) {
        const localAppts = JSON.parse(stored);
        const localMatch = localAppts.find((a: any) => a.id === id);
        if (localMatch) {
          setAppointment(localMatch);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // 3. Try Mock appointments
    const MOCK_APPOINTMENTS = [
      {
        id: '1',
        appointment_date: '2026-05-30',
        appointment_time: '14:30',
        status: 'confirmed',
        doctors: {
          specialty: 'Cardiologist',
          hospital_name: 'City Heart Institute',
          consultation_fee: 3500,
          profiles: { first_name: 'Sarah', last_name: 'Jenkins', profile_image: 'https://i.pravatar.cc/150?img=47' }
        }
      },
      {
        id: '2',
        appointment_date: '2026-05-15',
        appointment_time: '09:00',
        status: 'completed',
        doctors: {
          specialty: 'Neurologist',
          hospital_name: 'NeuroCare Center',
          consultation_fee: 4000,
          profiles: { first_name: 'Michael', last_name: 'Chen', profile_image: 'https://i.pravatar.cc/150?img=11' }
        }
      }
    ];

    const mockMatch = MOCK_APPOINTMENTS.find(a => String(a.id) === String(id));
    setAppointment(mockMatch || null);
    setLoading(false);
  };

  const handleCancel = () => {
    Alert.alert(i18n.t('appointment.cancel') || 'Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: i18n.t('history.cancel') || 'No', style: 'cancel' },
      {
        text: i18n.t('appointment.cancel') || 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await cancelAppointment(id);
          router.back();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;
  if (!appointment) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <TopBar />
        <View style={[globalStyles.container, globalStyles.content]}>
           <View style={globalStyles.errorCard}>
             <Text style={globalStyles.errorText}>Appointment not found.</Text>
           </View>
        </View>
      </SafeAreaView>
    );
  }

  const doctorName = `Dr. ${appointment.doctors?.profiles?.first_name || ''} ${appointment.doctors?.profiles?.last_name || ''}`;
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const avatarUrl = getDoctorImageUrl(appointment.doctors);

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>{i18n.t('appointment.details') || 'Appointment Details'}</Text>
        <Text style={globalStyles.pageDescription}>{i18n.t('appointment.view_manage') || 'View and manage your scheduled visit'}</Text>

        <View style={globalStyles.profileCard}>
          <Image source={{ uri: avatarUrl }} style={globalStyles.avatarLarge} />
          <View style={globalStyles.profileInfo}>
            <Text style={globalStyles.profileName}>{doctorName}</Text>
            <Text style={globalStyles.profileTier}>{appointment.doctors?.specialty}</Text>
            <Text style={[globalStyles.profileTier, { color: colors.textSecondary, marginTop: 2 }]}>
              {appointment.doctors?.hospital_name}
            </Text>
            <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
              <Badge
                label={appointment.status.toUpperCase()}
                color={STATUS_COLORS[appointment.status] || colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={globalStyles.cardPadded}>
          <Text style={globalStyles.sectionTitle}>{i18n.t('appointment.info') || 'APPOINTMENT INFO'}</Text>
          <View style={{ marginTop: 10 }}>
            {[
              { label: i18n.t('book.select_date') || 'Date', value: new Date(appointment.appointment_date).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: i18n.t('book.time') || 'Time', value: appointment.appointment_time },
              { label: i18n.t('appointment.fee') || 'Consultation Fee', value: `LKR ${appointment.doctors?.consultation_fee || '3500'}` },
            ].map((item, idx, arr) => (
              <View key={item.label}>
                <View style={globalStyles.rowSpaceBetween}>
                  <Text style={globalStyles.rowTitle}>{item.label}</Text>
                  <Text style={globalStyles.rowSubtitle}>{item.value}</Text>
                </View>
                {idx < arr.length - 1 && <View style={[globalStyles.divider, { marginVertical: 4 }]} />}
              </View>
            ))}
          </View>
        </View>

        {appointment.notes ? (
          <View style={globalStyles.cardPadded}>
            <Text style={globalStyles.sectionTitle}>YOUR NOTES</Text>
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.rowSubtitle}>{appointment.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: 20, gap: 10 }}>
          {canCancel && (
            <Button title={i18n.t('appointment.cancel') || "Cancel Appointment"} onPress={handleCancel} variant="danger" />
          )}

          {appointment.status === 'completed' && (
            <Button
              title={i18n.t('appointment.review') || "Leave a Review"}
              onPress={() => router.push({ pathname: '/doctors/[id]', params: { id: appointment.doctor_id } })}
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

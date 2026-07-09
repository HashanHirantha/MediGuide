import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { AppointmentCard } from '../../components/AppointmentCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useRealtime } from '../../hooks/useRealtime';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('appointments')
      .select('*, doctors(specialty, consultation_fee, profiles(first_name, last_name, profile_image))')
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: true });
    setAppointments(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Realtime updates for appointment status changes
  useRealtime('appointments', `patient_id=eq.${user?.id}`, fetchAppointments);

  return (
    <View style={globalStyles.safeArea}>
      <TopBar />
      <View style={globalStyles.container}>
        <View style={globalStyles.titleContainer}>
          <Text style={globalStyles.pageTitle}>My Appointments</Text>
        </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard appointment={item} onRefresh={fetchAppointments} />
          )}
          contentContainerStyle={globalStyles.listPadding}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>You have no appointments yet.</Text>
          }
        />
      )}
      </View>
    </View>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/theme';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
const STATUS_COLORS: Record<string, string> = {
  pending: colors.starColorAlt,
  confirmed: colors.secondary,
  completed: colors.primary,
  cancelled: colors.accent,
  no_show: '#8E8E93',
};

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    appointment_date: '2026-05-30',
    appointment_time: '14:30',
    status: 'confirmed',
    doctors: {
      specialty: 'Cardiologist',
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
      profiles: { first_name: 'Michael', last_name: 'Chen', profile_image: 'https://i.pravatar.cc/150?img=11' }
    }
  }
];

const MOCK_DIAGNOSES = [
  {
    id: '1',
    created_at: '2026-05-20T10:00:00Z',
    confidence_score: 92,
    diseases: { name: 'Arrhythmia', severity: 'moderate' }
  },
  {
    id: '2',
    created_at: '2026-04-10T14:30:00Z',
    confidence_score: 85,
    diseases: { name: 'Hypertension', severity: 'mild' }
  }
];

export default function HistoryScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [diagnosisHistory, setDiagnosisHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'diagnoses'>('appointments');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Reload when screen comes into focus (e.g. after booking)
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [user])
  );

  const fetchHistory = async () => {
    setLoading(true);

    // Load locally-saved appointments from AsyncStorage
    let localAppts: any[] = [];
    try {
      const stored = await AsyncStorage.getItem('local_appointments');
      if (stored) localAppts = JSON.parse(stored);
    } catch (e) {
      // ignore
    }

    if (user) {
      const [apptRes, diagRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, doctors(*, profiles(first_name, last_name, profile_image))')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('diagnosis_history')
          .select('*, diseases(name, specialty, severity)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      const supaAppts = apptRes.data ?? [];
      // Merge: Supabase data first, then local-only (filter out duplicates)
      const supaIds = new Set(supaAppts.map((a: any) => a.id));
      const uniqueLocal = localAppts.filter((a: any) => !supaIds.has(a.id));
      setAppointments([...supaAppts, ...uniqueLocal]);
      setDiagnosisHistory(diagRes.data ?? []);
    } else {
      // No user — show only local appointments
      setAppointments(localAppts);
    }

    setLoading(false);
  };

  const handleCancel = (appointmentId: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          // If it's a local appointment, remove from AsyncStorage
          if (appointmentId.startsWith('local-')) {
            try {
              const stored = await AsyncStorage.getItem('local_appointments');
              if (stored) {
                const localAppts = JSON.parse(stored).filter((a: any) => a.id !== appointmentId);
                await AsyncStorage.setItem('local_appointments', JSON.stringify(localAppts));
              }
            } catch (e) {}
          } else {
            await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
          }
          fetchHistory();
        },
      },
    ]);
  };



  const renderTitle = () => (
    <View style={globalStyles.titleContainer}>
      <Text style={globalStyles.pageTitle}>My History</Text>
      <Text style={globalStyles.pageDescription}>
        View your past appointments and diagnosis history here.
      </Text>
    </View>
  );

  const renderTabs = () => (
    <View style={globalStyles.filterList}>
      <TouchableOpacity
        style={[globalStyles.filterChip, activeTab === 'appointments' ? globalStyles.filterChipActive : globalStyles.filterChipInactive]}
        onPress={() => setActiveTab('appointments')}
        activeOpacity={0.8}
      >
        <Text style={[globalStyles.filterText, activeTab === 'appointments' ? globalStyles.filterTextActive : globalStyles.filterTextInactive]}>
          Appointments
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[globalStyles.filterChip, activeTab === 'diagnoses' ? globalStyles.filterChipActive : globalStyles.filterChipInactive]}
        onPress={() => setActiveTab('diagnoses')}
        activeOpacity={0.8}
      >
        <Text style={[globalStyles.filterText, activeTab === 'diagnoses' ? globalStyles.filterTextActive : globalStyles.filterTextInactive]}>
          Diagnoses
        </Text>
      </TouchableOpacity>
    </View>
  );

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
          source={{ uri: doctor?.profiles?.profile_image || 'https://i.pravatar.cc/150?img=11' }} 
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
          <Badge label={item.status} color={STATUS_COLORS[item.status]} />
          {['pending', 'confirmed'].includes(item.status) && (
            <TouchableOpacity style={globalStyles.cancelBtn} onPress={() => handleCancel(item.id)}>
              <Text style={globalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiagnosisCard = ({ item }: { item: any }) => {
    return (
      <View style={globalStyles.compactCard}>
        <View style={globalStyles.diagIconContainer}>
          <Ionicons name="medical" size={28} color={colors.black} />
        </View>
        <View style={globalStyles.compactInfo}>
          <Text style={globalStyles.compactName}>{item.diseases?.name ?? 'Unknown'}</Text>
          <Text style={globalStyles.compactSpecialty}>{(item.diseases?.severity ?? 'Unknown')?.toUpperCase()}</Text>
          <View style={globalStyles.dateRow}>
            <Ionicons name="analytics-outline" size={12} color={colors.black} />
            <Text style={globalStyles.dateText}>
              {item.confidence_score}% Confidence
            </Text>
          </View>
        </View>
        <View style={globalStyles.rightActions}>
          <Text style={globalStyles.dateTextSecondary}>
            {new Date(item.created_at).toLocaleDateString('en', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      
      <FlatList
        ListHeaderComponent={
          <>
            {renderTitle()}
            {renderTabs()}
          </>
        }
        data={activeTab === 'appointments' ? (appointments.length > 0 ? appointments : MOCK_APPOINTMENTS) : (diagnosisHistory.length > 0 ? diagnosisHistory : MOCK_DIAGNOSES)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={activeTab === 'appointments' ? renderAppointmentCard : renderDiagnosisCard}
        contentContainerStyle={globalStyles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <LoadingSpinner /> : (
            <Text style={globalStyles.emptyText}>
              No {activeTab === 'appointments' ? 'appointments' : 'diagnoses'} found.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
});

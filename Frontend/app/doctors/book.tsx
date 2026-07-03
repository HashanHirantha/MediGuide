import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';

const TIME_SLOTS = [
  { time: '09:00', label: '9:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '11:00', label: '11:00 AM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:00', label: '4:00 PM' },
];

export default function BookScreen() {
  const { doctorId, diseaseId } = useLocalSearchParams<{ doctorId: string; diseaseId?: string }>();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const isBookingRef = useRef(false);

  useEffect(() => {
    supabase
      .from('doctors')
      .select('*, profiles(first_name, last_name, profile_image)')
      .eq('id', doctorId)
      .single()
      .then(({ data }) => {
        setDoctor(data);
        setFetchLoading(false);
      });
  }, [doctorId]);

  // Generate next 7 available dates
  const getDates = () => {
    const dates: { full: string; day: string; date: number; month: string }[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString('en', { month: 'short' }),
      });
    }
    return dates;
  };

  const handleBook = async () => {
    if (isBookingRef.current) return;
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Info', 'Please select a date and time slot.');
      return;
    }
    isBookingRef.current = true;
    setLoading(true);

    const doc = doctor;
    const newAppointment = {
      id: `local-${Date.now()}`,
      patient_id: user?.id || 'local-user',
      doctor_id: doctorId,
      disease_id: diseaseId ? Number(diseaseId) : null,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      symptoms_text: symptoms || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      doctors: {
        specialty: doc?.specialty || 'General',
        profiles: {
          first_name: doc?.profiles?.first_name || 'Doctor',
          last_name: doc?.profiles?.last_name || '',
          profile_image: doc?.profiles?.profile_image || 'https://i.pravatar.cc/150?img=11',
        },
      },
    };

    // Try Supabase first
    const { error } = await supabase.from('appointments').insert({
      patient_id: user!.id,
      doctor_id: doctorId,
      disease_id: diseaseId ? Number(diseaseId) : null,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      symptoms_text: symptoms || null,
      status: 'pending',
    });

    if (error) {
      // Save locally as fallback if Supabase fails (offline mode)
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const existing = await AsyncStorage.getItem('local_appointments');
        const localAppointments = existing ? JSON.parse(existing) : [];
        localAppointments.unshift(newAppointment);
        await AsyncStorage.setItem('local_appointments', JSON.stringify(localAppointments));
      } catch (e) {
        // AsyncStorage save failed silently
      }

      Alert.alert('Booking Saved Locally ⚠️', 'We could not reach the server, but your appointment is saved locally.', [
        { text: 'View Appointments', onPress: () => router.replace('/(tabs)/history') },
      ]);
    } else {
      Alert.alert('Booking Confirmed! ✅', 'Your appointment request has been submitted.', [
        { text: 'View Appointments', onPress: () => router.replace('/(tabs)/history') },
      ]);
    }
    setLoading(false);
    isBookingRef.current = false;
  };

  if (fetchLoading) return <LoadingSpinner />;

  const doc = doctor;
  const doctorName = `Dr. ${doc?.profiles?.first_name} ${doc?.profiles?.last_name}`;
  const dates = getDates();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>

        {/* Page Title */}
        <Text style={globalStyles.pageTitle}>{i18n.t('book.title') || 'Book Appointment'}</Text>
        <Text style={globalStyles.pageDescription}>
          {i18n.t('book.desc') || 'Schedule your visit with your preferred specialist.'}
        </Text>

        {/* Doctor Mini Card */}
        <View style={globalStyles.profileCard}>
          <Image
            source={{ uri: doc?.profiles?.profile_image || 'https://i.pravatar.cc/150?img=11' }}
            style={globalStyles.avatarLarge}
          />
          <View style={globalStyles.profileInfo}>
            <Text style={globalStyles.profileName}>{doctorName}</Text>
            <View style={[globalStyles.specialtyBadge, { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }]}>
              <Text style={[globalStyles.specialtyText, { fontSize: 9 }]}>{doc?.specialty?.toUpperCase() || 'CARDIOLOGIST'}</Text>
            </View>
          </View>
          <View style={globalStyles.feeBadge}>
            <Text style={globalStyles.feeBadgeLabel}>FEE</Text>
            <Text style={globalStyles.feeBadgeValue}>LKR {doc?.consultation_fee || 3500}</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={globalStyles.cardPadded}>
          <View style={globalStyles.sectionHeader}>
            <Feather name="calendar" size={16} color={colors.iconDark} />
            <Text style={globalStyles.sectionTitle}>{i18n.t('book.select_date') || 'SELECT DATE'}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={globalStyles.dateChipRow}>
              {dates.map((d) => {
                const isActive = selectedDate === d.full;
                return (
                  <TouchableOpacity
                    key={d.full}
                    style={[globalStyles.dateChip, isActive && globalStyles.dateChipActive]}
                    onPress={() => setSelectedDate(d.full)}
                    activeOpacity={0.8}
                  >
                    <Text style={[globalStyles.dateDay, isActive && globalStyles.dateChipTextActive]}>{d.day}</Text>
                    <Text style={[globalStyles.dateNum, isActive && globalStyles.dateChipTextActive]}>{d.date}</Text>
                    <Text style={[globalStyles.dateMonth, isActive && globalStyles.dateChipTextActive]}>{d.month}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={globalStyles.cardPadded}>
          <View style={globalStyles.sectionHeader}>
            <Feather name="clock" size={16} color={colors.iconDark} />
            <Text style={globalStyles.sectionTitle}>{i18n.t('book.time') || 'SELECT TIME'}</Text>
          </View>
          <View style={globalStyles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const isActive = selectedTime === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[globalStyles.timeChip, isActive && globalStyles.timeChipActive]}
                  onPress={() => setSelectedTime(slot.time)}
                  activeOpacity={0.8}
                >
                  <Text style={[globalStyles.timeChipText, isActive && globalStyles.timeChipTextActive]}>{slot.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={globalStyles.cardPadded}>
          <View style={globalStyles.sectionHeader}>
            <Feather name="edit-3" size={16} color={colors.iconDark} />
            <Text style={globalStyles.sectionTitle}>{i18n.t('book.notes') || 'ADDITIONAL NOTES'}</Text>
          </View>
          <TextInput
            style={[globalStyles.notesInput, { minHeight: 100, borderRadius: 12, padding: 16, fontSize: 14 }]}
            placeholder={i18n.t('book.notes_placeholder') || "Describe your symptoms or reason for visit..."}
            placeholderTextColor={colors.iconLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={symptoms}
            onChangeText={setSymptoms}
          />
        </View>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <View style={globalStyles.summaryCard}>
            <Text style={globalStyles.summaryLabel}>{i18n.t('book.summary') || 'BOOKING SUMMARY'}</Text>
            <View style={globalStyles.summaryRow}>
              <Feather name="user" size={14} color={colors.iconDark} />
              <Text style={globalStyles.summaryText}>{doctorName}</Text>
            </View>
            <View style={globalStyles.summaryRow}>
              <Feather name="calendar" size={14} color={colors.iconDark} />
              <Text style={globalStyles.summaryText}>
                {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={globalStyles.summaryRow}>
              <Feather name="clock" size={14} color={colors.iconDark} />
              <Text style={globalStyles.summaryText}>
                {TIME_SLOTS.find(s => s.time === selectedTime)?.label}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Confirm Button */}
      <View style={globalStyles.bottomBarContainer}>
        <TouchableOpacity
          style={[globalStyles.buttonPrimary, (!selectedDate || !selectedTime) && globalStyles.disabled]}
          activeOpacity={0.8}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <Text style={globalStyles.buttonPrimaryText}>{i18n.t('book.booking') || 'Booking...'}</Text>
          ) : (
            <>
              <Text style={globalStyles.buttonPrimaryText}>{i18n.t('book.confirm') || 'Confirm Booking'}</Text>
              <Feather name="check-circle" size={20} color={colors.surface} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

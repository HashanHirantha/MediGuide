import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { globalStyles } from '../../constants/globalStyles';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfileByUserId, updateDoctorProfile } from '../../services/doctorService';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorSchedule() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');

  useEffect(() => {
    if (profile?.id) {
      loadProfile();
    }
  }, [profile?.id]);

  const loadProfile = async () => {
    try {
      const { data } = await getDoctorProfileByUserId(profile!.id);
      if (data) {
        if (data.available_days) {
          setSelectedDays(data.available_days.split(',').map((d: string) => d.trim()));
        }
        setAvailableFrom(data.available_from ? data.available_from.substring(0, 5) : '');
        setAvailableTo(data.available_to ? data.available_to.substring(0, 5) : '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const formatTimeInput = (text: string, setter: (val: string) => void) => {
    // Basic formatting to ensure HH:MM
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 4) cleaned = cleaned.substring(0, 4);
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + ':' + cleaned.substring(2);
    }
    setter(formatted);
  };

  const handleSave = async () => {
    if (availableFrom && availableFrom.length < 5) {
      return Alert.alert('Invalid Time', 'Please enter a valid From time in HH:MM format.');
    }
    if (availableTo && availableTo.length < 5) {
      return Alert.alert('Invalid Time', 'Please enter a valid To time in HH:MM format.');
    }

    setSaving(true);
    try {
      // Sort days based on standard week order
      const sortedDays = DAYS_OF_WEEK.filter(d => selectedDays.includes(d)).join(',');

      const { error } = await updateDoctorProfile(profile!.id, {
        available_days: sortedDays,
        // PostgreSQL TIME expects HH:MM:SS, but we append :00 if user types HH:MM
        available_from: availableFrom ? (availableFrom.length === 5 ? `${availableFrom}:00` : availableFrom) : undefined,
        available_to: availableTo ? (availableTo.length === 5 ? `${availableTo}:00` : availableTo) : undefined,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Schedule updated successfully.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>Availability Schedule</Text>
        <Text style={globalStyles.pageDescription}>Manage your available working days and hours for patient bookings.</Text>
        
        <View style={{ marginTop: spacing.xl }}>
          <Text style={globalStyles.label}>Available Days</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
            <View style={{ flex: 1 }}>
              <Text style={globalStyles.label}>From (HH:MM)</Text>
              <TextInput
                style={globalStyles.input}
                value={availableFrom}
                onChangeText={(text) => formatTimeInput(text, setAvailableFrom)}
                placeholder="09:00"
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={globalStyles.label}>To (HH:MM)</Text>
              <TextInput
                style={globalStyles.input}
                value={availableTo}
                onChangeText={(text) => formatTimeInput(text, setAvailableTo)}
                placeholder="17:00"
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.previewContainer}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={styles.previewText}>
              Patients will be able to book you on {selectedDays.length > 0 ? DAYS_OF_WEEK.filter(d => selectedDays.includes(d)).join(', ') : 'No days selected'} {availableFrom && availableTo ? `between ${availableFrom} and ${availableTo}` : ''}.
            </Text>
          </View>

          <TouchableOpacity 
            style={[globalStyles.buttonPrimary, { marginTop: spacing.xl }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={globalStyles.buttonPrimaryText}>Save Schedule</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.xs,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.subtleBorder,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayChipTextSelected: {
    color: colors.surface,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  }
});

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../constants/globalStyles';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfileByUserId, updateDoctorProfile } from '../../services/doctorService';

export default function DoctorSchedule() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableDays, setAvailableDays] = useState('');
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
        setAvailableDays(data.available_days || '');
        setAvailableFrom(data.available_from ? data.available_from.substring(0, 5) : '');
        setAvailableTo(data.available_to ? data.available_to.substring(0, 5) : '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateDoctorProfile(profile!.id, {
        available_days: availableDays,
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
          <TextInput
            style={globalStyles.input}
            value={availableDays}
            onChangeText={setAvailableDays}
            placeholder="e.g. Mon,Tue,Thu,Fri"
            placeholderTextColor={colors.textTertiary}
          />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={globalStyles.label}>From (HH:MM)</Text>
              <TextInput
                style={globalStyles.input}
                value={availableFrom}
                onChangeText={setAvailableFrom}
                placeholder="09:00"
                keyboardType="numbers-and-punctuation"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={globalStyles.label}>To (HH:MM)</Text>
              <TextInput
                style={globalStyles.input}
                value={availableTo}
                onChangeText={setAvailableTo}
                placeholder="17:00"
                keyboardType="numbers-and-punctuation"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
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

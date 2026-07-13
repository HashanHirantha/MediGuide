import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function NotificationsSettingsScreen() {
  const { profile } = useAuth();
  
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [healthTips, setHealthTips] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadPreferences();
    }
  }, [profile?.id]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notify_appointments, notify_health_tips, notify_emergency')
        .eq('id', profile!.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setAppointmentReminders(data.notify_appointments ?? true);
        setHealthTips(data.notify_health_tips ?? false);
        setEmergencyAlerts(data.notify_emergency ?? true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profile!.id);
        
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      
      // Revert state on failure
      if (field === 'notify_appointments') setAppointmentReminders(!value);
      if (field === 'notify_health_tips') setHealthTips(!value);
      if (field === 'notify_emergency') setEmergencyAlerts(!value);
    }
  };

  const handleToggleAppointments = (val: boolean) => {
    setAppointmentReminders(val);
    updatePreference('notify_appointments', val);
  };

  const handleToggleHealthTips = (val: boolean) => {
    setHealthTips(val);
    updatePreference('notify_health_tips', val);
  };

  const handleToggleEmergency = (val: boolean) => {
    setEmergencyAlerts(val);
    updatePreference('notify_emergency', val);
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.notifications') || 'Notifications'}</Text>
        <Text style={globalStyles.pageDescription}>
          {i18n.t('settings.notifications_desc') || 'Manage your alerts, sounds, and health reminders'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={[globalStyles.sectionTitle, { marginTop: 20 }]}>PUSH NOTIFICATIONS</Text>
        <View style={globalStyles.card}>
          
          {/* Appointment Reminders */}
          <View style={globalStyles.row}>
            <View style={globalStyles.iconContainer}>
              <Feather name="calendar" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Appointment Reminders</Text>
              <Text style={globalStyles.rowSubtitle}>Get alerted before your appointments</Text>
            </View>
            <Switch
              value={appointmentReminders}
              onValueChange={handleToggleAppointments}
              trackColor={{ false: '#d1d1d6', true: colors.primary }}
              thumbColor={appointmentReminders ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          {/* Health Tips */}
          <View style={globalStyles.row}>
            <View style={globalStyles.iconContainer}>
              <Feather name="heart" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Health Tips</Text>
              <Text style={globalStyles.rowSubtitle}>Daily tips for a healthier lifestyle</Text>
            </View>
            <Switch
              value={healthTips}
              onValueChange={handleToggleHealthTips}
              trackColor={{ false: '#d1d1d6', true: colors.primary }}
              thumbColor={healthTips ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          {/* Emergency Alerts */}
          <View style={globalStyles.row}>
            <View style={[globalStyles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Feather name="alert-triangle" size={20} color={colors.errorText} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Emergency Alerts</Text>
              <Text style={globalStyles.rowSubtitle}>Critical symptom warnings and immediate risks</Text>
            </View>
            <Switch
              value={emergencyAlerts}
              onValueChange={handleToggleEmergency}
              trackColor={{ false: '#d1d1d6', true: colors.primary }}
              thumbColor={emergencyAlerts ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={globalStyles.sectionTitle}>OTHER ALERTS</Text>
        <View style={globalStyles.card}>
          
          {/* Email Notifications */}
          <View style={globalStyles.row}>
            <View style={globalStyles.iconContainer}>
              <Feather name="mail" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>Email Notifications</Text>
              <Text style={globalStyles.rowSubtitle}>Receive booking confirmations via email</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: '#d1d1d6', true: colors.primary }}
              thumbColor={emailAlerts ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[globalStyles.divider, { marginLeft: 72 }]} />

          {/* SMS Alerts */}
          <View style={globalStyles.row}>
            <View style={globalStyles.iconContainer}>
              <Feather name="message-square" size={20} color={colors.iconDark} />
            </View>
            <View style={globalStyles.rowTextContainer}>
              <Text style={globalStyles.rowTitle}>SMS Alerts</Text>
              <Text style={globalStyles.rowSubtitle}>Receive text messages for urgent updates</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: '#d1d1d6', true: colors.primary }}
              thumbColor={smsAlerts ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
        </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

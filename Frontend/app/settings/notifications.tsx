import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';

export default function NotificationsSettingsScreen() {
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [healthTips, setHealthTips] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.notifications') || 'Notifications'}</Text>
        <Text style={globalStyles.pageDescription}>
          {i18n.t('settings.notifications_desc') || 'Manage your alerts, sounds, and health reminders'}
        </Text>

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
              onValueChange={setAppointmentReminders}
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
              onValueChange={setHealthTips}
              trackColor={{ false: '#d1d1d6', true: colors.primary }}
              thumbColor={healthTips ? '#fff' : '#f4f3f4'}
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

      </ScrollView>
    </SafeAreaView>
  );
}

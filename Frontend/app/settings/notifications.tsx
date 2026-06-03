import React, { useState } from 'react';
import { View, Text, SafeAreaView, Switch, ScrollView } from 'react-native';
import { TopBar } from '../../components/TopBar';
import { colors } from '../../constants/theme';
import { globalStyles } from '../../constants/globalStyles';

export default function NotificationsSettingsScreen() {
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [healthTips, setHealthTips] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>Notifications</Text>
        <Text style={globalStyles.pageDescription}>Manage your alerts, sounds, and health reminders here.</Text>

        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Push Notifications</Text>
          <View style={globalStyles.card}>
            <View style={globalStyles.rowSpaceBetween}>
              <View style={globalStyles.rowTextContainer}>
                <Text style={globalStyles.rowTitle}>Appointment Reminders</Text>
                <Text style={globalStyles.rowSubtitle}>Get alerted before your appointments</Text>
              </View>
              <Switch 
                value={appointmentReminders} 
                onValueChange={setAppointmentReminders}
                trackColor={{ false: colors.border, true: colors.iconDark }}
              />
            </View>
            <View style={globalStyles.divider} />
            <View style={globalStyles.rowSpaceBetween}>
              <View style={globalStyles.rowTextContainer}>
                <Text style={globalStyles.rowTitle}>Health Tips</Text>
                <Text style={globalStyles.rowSubtitle}>Daily tips for a healthier lifestyle</Text>
              </View>
              <Switch 
                value={healthTips} 
                onValueChange={setHealthTips}
                trackColor={{ false: colors.border, true: colors.iconDark }}
              />
            </View>
          </View>
        </View>

        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Other Alerts</Text>
          <View style={globalStyles.card}>
            <View style={globalStyles.rowSpaceBetween}>
              <View style={globalStyles.rowTextContainer}>
                <Text style={globalStyles.rowTitle}>Email Notifications</Text>
                <Text style={globalStyles.rowSubtitle}>Receive booking confirmations via email</Text>
              </View>
              <Switch 
                value={emailAlerts} 
                onValueChange={setEmailAlerts}
                trackColor={{ false: colors.border, true: colors.iconDark }}
              />
            </View>
            <View style={globalStyles.divider} />
            <View style={globalStyles.rowSpaceBetween}>
              <View style={globalStyles.rowTextContainer}>
                <Text style={globalStyles.rowTitle}>SMS Alerts</Text>
                <Text style={globalStyles.rowSubtitle}>Receive text messages for urgent updates</Text>
              </View>
              <Switch 
                value={smsAlerts} 
                onValueChange={setSmsAlerts}
                trackColor={{ false: colors.border, true: colors.iconDark }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

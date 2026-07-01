import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { colors } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { globalStyles } from '../../constants/globalStyles';

export default function SecuritySettingsScreen() {
  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'A password reset link will be sent to your email.');
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={globalStyles.content}>
        <Text style={globalStyles.pageTitle}>Security</Text>
        <Text style={globalStyles.pageDescription}>Manage biometrics and data encryption here.</Text>

        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Authentication</Text>
          <View style={globalStyles.card}>
            <TouchableOpacity style={globalStyles.row} onPress={handleChangePassword}>
              <View style={globalStyles.iconContainer}>
                <Feather name="lock" size={20} color={colors.iconDark} />
              </View>
              <View style={globalStyles.rowTextContainer}>
                <Text style={globalStyles.rowTitle}>Change Password</Text>
                <Text style={globalStyles.rowSubtitle}>Update your account password</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.iconLight} />
            </TouchableOpacity>
            
            <View style={globalStyles.divider} />
            
            <View style={globalStyles.rowSpaceBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={globalStyles.iconContainer}>
                  <Feather name="shield" size={20} color={colors.iconDark} />
                </View>
                <View style={globalStyles.rowTextContainer}>
                  <Text style={globalStyles.rowTitle}>Two-Factor Authentication</Text>
                  <Text style={globalStyles.rowSubtitle}>Require a code when logging in</Text>
                </View>
              </View>
              <Switch 
                value={twoFactor} 
                onValueChange={setTwoFactor}
                trackColor={{ false: colors.border, true: colors.iconDark }}
              />
            </View>
          </View>
        </View>

        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Device & Privacy</Text>
          <View style={globalStyles.card}>
            <View style={globalStyles.rowSpaceBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={globalStyles.iconContainer}>
                  <Feather name="smartphone" size={20} color={colors.iconDark} />
                </View>
                <View style={globalStyles.rowTextContainer}>
                  <Text style={globalStyles.rowTitle}>Biometric Login</Text>
                  <Text style={globalStyles.rowSubtitle}>Use Face ID / Touch ID to sign in</Text>
                </View>
              </View>
              <Switch 
                value={biometrics} 
                onValueChange={setBiometrics}
                trackColor={{ false: colors.border, true: colors.iconDark }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TopBar } from '../../components/TopBar';
import { globalStyles } from '../../constants/globalStyles';
import { colors } from '../../constants/theme';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';

export default function SecuritySettingsScreen() {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsSupported(compatible && enrolled);

    if (compatible && enrolled) {
      const stored = await AsyncStorage.getItem('biometrics_enabled');
      if (stored === 'true') {
        setBiometricsEnabled(true);
      }
    }
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      // Trying to enable
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable Biometric Login',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        setBiometricsEnabled(true);
        await AsyncStorage.setItem('biometrics_enabled', 'true');
        Alert.alert('Success', 'Biometric authentication enabled.');
      } else {
        setBiometricsEnabled(false);
      }
    } else {
      // Trying to disable
      setBiometricsEnabled(false);
      await AsyncStorage.setItem('biometrics_enabled', 'false');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter a new password and confirm it.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', i18n.t('security.passwords_match') || 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', i18n.t('security.password_updated') || 'Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <TopBar />
      <ScrollView contentContainerStyle={[globalStyles.content, { paddingBottom: 40 }]}>
        <Text style={globalStyles.pageTitle}>{i18n.t('settings.security') || 'Security'}</Text>
        <Text style={globalStyles.pageDescription}>
          {i18n.t('security.desc') || 'Manage your password'}
        </Text>



        {biometricsSupported && (
          <>
            <Text style={[globalStyles.sectionTitle, { marginTop: 24 }]}>APP LOCK</Text>
            <View style={globalStyles.card}>
              <View style={globalStyles.settingRow}>
                <View style={globalStyles.settingIconContainer}>
                  <Feather name="fingerprint" size={20} color={colors.primary} />
                </View>
                <View style={globalStyles.settingTextContainer}>
                  <Text style={globalStyles.settingTitle}>{i18n.t('security.biometrics') || 'Biometric Login'}</Text>
                  <Text style={globalStyles.settingDescription}>
                    {i18n.t('security.biometrics_desc') || 'Require authentication to open the app'}
                  </Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={handleToggleBiometrics}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </>
        )}

        <Text style={[globalStyles.sectionTitle, { marginTop: 24 }]}>CHANGE PASSWORD</Text>
        <View style={globalStyles.card}>
          <View style={{ padding: 16 }}>
            <Input
              label=""
              placeholder={i18n.t('security.new_password') || 'New Password'}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              leftIcon="shield"
            />

            <Input
              label=""
              placeholder={i18n.t('security.confirm_password') || 'Confirm New Password'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="check-circle"
            />

            <TouchableOpacity
              style={[globalStyles.buttonPrimary, loading && globalStyles.disabled]}
              onPress={handleUpdatePassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={globalStyles.buttonPrimaryText}>
                  {i18n.t('security.update') || 'Update Password'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

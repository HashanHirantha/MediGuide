import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { globalStyles } from '../constants/globalStyles';
import { useAuth } from '../hooks/useAuth';

export const BiometricLock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const appState = useRef(AppState.currentState);
  const { user } = useAuth();

  useEffect(() => {
    checkBiometricsSetting();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const checkBiometricsSetting = async () => {
    const enabled = await AsyncStorage.getItem('biometrics_enabled');
    if (enabled === 'true') {
      setBiometricsEnabled(true);
      lockAndAuthenticate();
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground!
      const enabled = await AsyncStorage.getItem('biometrics_enabled');
      if (enabled === 'true') {
        lockAndAuthenticate();
      }
    }
    appState.current = nextAppState;
  };

  const lockAndAuthenticate = async () => {
    setIsLocked(true);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock MediGuide',
      disableDeviceFallback: true,
      cancelLabel: 'Cancel',
    });
    
    if (result.success) {
      setIsLocked(false);
    }
  };

  if (isLocked && biometricsEnabled && user) {
    return (
      <View style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <Feather name="lock" size={64} color={colors.primary} style={{ marginBottom: 24 }} />
        <Text style={[globalStyles.authTitle, { textAlign: 'center' }]}>App Locked</Text>
        <Text style={[globalStyles.authSubtitle, { textAlign: 'center', marginBottom: 40 }]}>
          Authenticate to access your health data.
        </Text>
        <TouchableOpacity style={[globalStyles.buttonPrimary, { width: 200 }]} onPress={lockAndAuthenticate}>
          <Text style={globalStyles.buttonPrimaryText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

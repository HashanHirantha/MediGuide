import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors, radius, spacing, typography } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BiometricLockProps {
  children: React.ReactNode;
}

export function BiometricLock({ children }: BiometricLockProps) {
  const { user, loading } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkBiometrics = useCallback(async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometrics_enabled');
      if (enabled === 'true' && user) {
        setIsLocked(true);
        authenticate();
      } else {
        setIsLocked(false);
      }
    } catch (e) {
      console.log('Error checking biometrics', e);
    } finally {
      setChecking(false);
    }
  }, [user]);

  // Re-check when user auth state changes or when the app loads
  useEffect(() => {
    if (!loading) {
      checkBiometrics();
    }
  }, [loading, checkBiometrics]);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock MediGuide',
      disableDeviceFallback: true,
      cancelLabel: 'Cancel',
    });
    
    if (result.success) {
      setIsLocked(false);
    }
  };

  if (checking) {
    // Show nothing while checking (or a splash screen overlay)
    return null;
  }

  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="lock" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>App Locked</Text>
          <Text style={styles.subtitle}>
            Please authenticate to access MediGuide.
          </Text>

          <TouchableOpacity style={styles.button} onPress={authenticate} activeOpacity={0.8}>
            <Feather name="fingerprint" size={20} color="#fff" />
            <Text style={styles.buttonText}>Unlock with Biometrics</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

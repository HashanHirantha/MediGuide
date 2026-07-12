import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { HealthProvider } from '../contexts/HealthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { BiometricLock } from '../components/BiometricLock';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BiometricLock>
          <NotificationProvider>
            <HealthProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(doctor)" />
                <Stack.Screen name="symptoms" />
                <Stack.Screen name="doctors" />
                <Stack.Screen name="appointments" />
              </Stack>
            </HealthProvider>
          </NotificationProvider>
        </BiometricLock>
      </AuthProvider>
    </LanguageProvider>
  );
}

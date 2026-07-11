import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuthContext } from './AuthContext';
import { registerForPushNotificationsAsync, savePushToken } from '../services/notificationService';
import { router } from 'expo-router';

interface NotificationContextValue {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
}

const NotificationContext = createContext<NotificationContextValue>({
  expoPushToken: undefined,
  notification: undefined,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    // Only register for push notifications if we have an authenticated user
    if (user?.id) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          savePushToken(user.id, token);
        }
      });
    }
  }, [user?.id]);

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification received in foreground:', notification.request.content.title);
    });

    // This listener is fired whenever a user taps on or interacts with a notification 
    // (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      const data = response.notification.request.content.data;
      
      // Handle deep linking based on notification data
      if (data?.type === 'appointment_reminder' && data?.appointmentId) {
        // Navigate to appointment details
        router.push(`/appointments/${data.appointmentId}`);
      } else if (data?.type === 'health_tip') {
        // We could navigate to a tips screen or articles
        router.push('/');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}

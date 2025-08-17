import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useHydration } from './HydrationContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationContextType {
  scheduleReminders: () => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  pauseReminders: (duration: 'short' | 'hour' | 'day') => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { state } = useHydration();
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      const granted = finalStatus === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const scheduleReminders = async () => {
    if (Platform.OS === 'web' || !state.reminderSettings.enabled) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!permissionGranted) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const { activeHours, interval, customMessages } = state.reminderSettings;

      // Schedule notifications for the next 24 hours within active hours
      for (let i = 1; i <= 24; i++) {
        const notificationTime = new Date(now.getTime() + i * interval * 60 * 1000);
        const hour = notificationTime.getHours();

        // Check if within active hours
        if (hour >= activeHours.start && hour <= activeHours.end) {
          // Check if not in DND period
          const isInDND = state.reminderSettings.dndPeriods.some(
            period => hour >= period.start && hour <= period.end
          );

          if (!isInDND) {
            const progress = Math.round((state.currentIntake / state.dailyGoal) * 100);
            const randomMessage = customMessages[Math.floor(Math.random() * customMessages.length)]
              .replace('{progress}', progress.toString());

            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'AquaFlow Hydration Reminder',
                body: randomMessage,
                sound: state.reminderSettings.soundEnabled ? 'default' : false,
                vibrate: state.reminderSettings.vibrationEnabled ? [0, 250, 250, 250] : [],
              },
              trigger: {
                date: notificationTime,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  };

  const cancelAllReminders = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling reminders:', error);
    }
  };

  const pauseReminders = async (duration: 'short' | 'hour' | 'day') => {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const pauseTime = duration === 'short' ? 15 * 60 * 1000 : 
                      duration === 'hour' ? 60 * 60 * 1000 : 
                      24 * 60 * 60 * 1000;

      setTimeout(scheduleReminders, pauseTime);
    } catch (error) {
      console.error('Error pausing reminders:', error);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (permissionGranted && state.reminderSettings.enabled) {
      scheduleReminders();
    }
  }, [state.reminderSettings, permissionGranted]);

  return (
    <NotificationContext.Provider value={{
      scheduleReminders,
      cancelAllReminders,
      pauseReminders,
      requestPermissions
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

let Notifications: any;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

export function NotificationPermissionPopup() {
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const checkAndRequestPermissions = async () => {
      try {
        if (hasShownPopup) return;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        if (existingStatus === 'undetermined') {
          Alert.alert(
            'Enable Hydration Reminders?',
            'Stay hydrated with timely reminders throughout your day!',
            [
              { text: 'Not Now', style: 'cancel', onPress: () => setHasShownPopup(true) },
              {
                text: 'Enable',
                onPress: async () => {
                  await Notifications.requestPermissionsAsync();
                  setHasShownPopup(true);
                },
              },
            ]
          );
        } else if (existingStatus === 'denied') {
          Alert.alert(
            'Notifications Disabled',
            'You can enable hydration reminders anytime in Settings > Notifications',
            [{ text: 'OK', onPress: () => setHasShownPopup(true) }]
          );
        }
      } catch (error) {
        console.error('Error checking notification permissions:', error);
      }
    };

    const timer = setTimeout(checkAndRequestPermissions, 1000);
    return () => clearTimeout(timer);
  }, [hasShownPopup]);

  return null;
}

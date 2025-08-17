import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold
} from '@expo-google-fonts/nunito';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { HydrationProvider } from '@/contexts/HydrationContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito_400Regular': Nunito_400Regular,
    'Nunito_600SemiBold': Nunito_600SemiBold,
    'Nunito_700Bold': Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <HydrationProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </NotificationProvider>
    </HydrationProvider>
  );
}
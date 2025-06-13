import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OxyProvider, OxyServices } from '@oxyhq/services';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Phudu: require('../assets/fonts/Phudu-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Initialize OxyServices
  const oxyServices = new OxyServices({
    baseURL: Platform.OS === 'web' ? 'https://api.oxy.so' : 'http://10.0.2.2:4000',
  });

  return (
    <OxyProvider 
      oxyServices={oxyServices}
      theme="light"
      onAuthenticated={(user) => console.log('User authenticated:', user)}
    >
      <SafeAreaProvider>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="create-note" />
            <Stack.Screen name="edit-note" />
          </Stack>
          
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    </OxyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OxyProvider, OxyServices } from '@oxyhq/services';
import BottomNavigation from '../ui/components/navigation/BottomNavigation';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Tablet/desktop breakpoint
  
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
          {isLargeScreen && Platform.OS === 'web' ? (
            <View style={styles.webContainer}>
              <View style={styles.webSidebar}>
                <BottomNavigation orientation="vertical" />
              </View>
              <View style={styles.webContent}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="create-note" />
                  <Stack.Screen name="edit-note" />
                  <Stack.Screen name="search" />
                  <Stack.Screen name="profile" />
                </Stack>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.content}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="create-note" />
                  <Stack.Screen name="edit-note" />
                  <Stack.Screen name="search" />
                  <Stack.Screen name="profile" />
                </Stack>
              </View>
              <BottomNavigation />
            </>
          )}
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
  content: {
    flex: 1,
  },
  webContainer: {
    flex: 1, 
    flexDirection: 'row',
  },
  webSidebar: {
    width: 250,
  },
  webContent: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
  },
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OxyProvider, OxyServices } from '@oxyhq/services';
import BottomNavigation from '../ui/components/navigation/BottomNavigation';
import NotesScreen from './index';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define breakpoints as constants to avoid unnecessary re-renders
const TABLET_BREAKPOINT = 768;

export default function RootLayout() {
  const pathname = usePathname();
  
  // Get initial dimensions only once
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    const { width } = Dimensions.get('window');
    return width >= TABLET_BREAKPOINT;
  });
  
  // Check if we're on an edit route
  const isEditRoute = pathname?.includes('/edit-note');
  
  // Only for web: add resize listener for responsive layout
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        const { width } = Dimensions.get('window');
        setIsLargeScreen(width >= TABLET_BREAKPOINT);
      };
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  
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
    baseURL: 'https://api.oxy.so',
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
                {isEditRoute ? (
                  <View style={styles.splitContainer}>
                    <View style={styles.mainPanel}>
                      <NotesScreen />
                    </View>
                    <View style={styles.editPanel}>
                      <Slot />
                    </View>
                  </View>
                ) : (
                  <Slot />
                )}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.content}>
                <Slot />
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
    width: '100%',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  editPanel: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});

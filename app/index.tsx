import { Ionicons } from '@expo/vector-icons';
import { OxySignInButton, useOxy } from '@oxyhq/services/full';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const bottomSheetRef = useRef(null);

// Enhanced component to show authenticated user info
const UserInfo = () => {
  // Get all relevant user data and functions from OxyContext
  const { user, logout, isAuthenticated, error } = useOxy();

  const handleLogout = async () => {
    try {
      await logout();
      console.log('User logged out successfully via OxyContext');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user || !isAuthenticated) return null;

  return (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
      <Text style={styles.sessionText}>User ID: {user.id}</Text>
      {user.email && <Text style={styles.sessionText}>Email: {user.email}</Text>}
      <Text style={styles.sessionInfoText}>Session maintained via OxyContext</Text>
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default function Index() {
  const { isAuthenticated, user, showBottomSheet } = useOxy();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Oxy Services Examples</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Welcome{user ? `, ${user.username}` : ''}!</Text>
        <Text style={styles.description}>
          {isAuthenticated
            ? "You're signed in. Explore the app features below."
            : "Sign in to access all app features."}
        </Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Profile</Text>
            <Text style={styles.menuDescription}>View and manage your profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/search')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#34b27d' }]}>
            <Ionicons name="search" size={24} color="#fff" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Search Users</Text>
            <Text style={styles.menuDescription}>Find and connect with others</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Moved buttonContainer from _layout.tsx */}
      <View style={styles.buttonContainer}>
        {/* Show UserInfo component that uses OxyContext */}
        <UserInfo />

        {/* Show sign in button if not authenticated */}
        {!isAuthenticated && (
          <OxySignInButton
            variant="contained"
            text="Sign In / Sign Up"
          />
        )}

        {/* OxySignInButton examples */}
        <View style={styles.buttonExamples}>
          <Text style={styles.sectionTitle}>OxySignInButton Examples:</Text>

          {/* Default style */}
          <OxySignInButton />

          {/* Outlined variant */}
          <OxySignInButton
            variant="outline"
            style={{ marginTop: 10 }}
          />

          {/* Contained variant */}
          <OxySignInButton
            variant="contained"
            style={{ marginTop: 10 }}
          />

          {/* Custom handler example */}
          <OxySignInButton
            style={{ marginTop: 10 }}
            text="Custom Handler"
          />

          {/* Contained variant */}
          <OxySignInButton
            variant="contained"
            style={{ marginTop: 10 }}
            text="Continue with Oxy"
          />

          <Button
            title="Sign Up"
            onPress={() => showBottomSheet?.('SignUp')}
            color="#d169e5"
          />

          <Button
            title="Karma Center"
            onPress={() => showBottomSheet?.('KarmaCenter')}
            color="#d169e5"
          />

          <Button
            title="Profile"
            onPress={() => showBottomSheet?.({ screen: 'Profile', props: { userId: '67e1771bd4bc596eba772e61' } })}
            color="#d169e5"
          />
        </View>

        {/* Account Center button for authenticated users */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.accountCenterButton}
            onPress={() => showBottomSheet?.('AccountOverview')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.accountCenterButtonText}>Account Overview</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    marginBottom: 15,
    fontSize: 14,
    color: "#666",
  },
  menuSection: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d169e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#888',
  },
  // Styles moved from _layout.tsx
  buttonContainer: {
    margin: 20,
    marginTop: 50,
    gap: 10,
  },
  controlButtons: {
    marginTop: 20,
    gap: 10,
  },
  buttonExamples: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  welcomeContainer: {
    margin: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sessionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  sessionInfoText: {
    fontSize: 12,
    color: '#0066CC',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 10,
  },
  accountCenterButton: {
    backgroundColor: '#d169e5',
    padding: 14,
    borderRadius: 35,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCenterButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  }
});

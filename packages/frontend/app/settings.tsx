import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useOxy } from '@oxyhq/services';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user } = useOxy();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // For now, just navigate back - the actual sign out would depend on Oxy services
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data from your device. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implementation would clear app cache
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your notes will be exported as a backup file.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export',
          onPress: () => {
            // Implementation would export user data
            Alert.alert('Success', 'Data export started');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          {(() => {
            const IconComponent = Ionicons as any;
            return (
              <IconComponent
                name="person"
                size={80}
                color="#ccc"
                style={styles.authPromptIcon}
              />
            );
          })()}
          <Text style={styles.authPromptTitle}>Settings</Text>
          <Text style={styles.authPromptText}>
            Please sign in to view your settings
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userIcon}>
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="person"
                  size={32}
                  color="#fff"
                />
              );
            })()}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {typeof user.name === 'string' ? user.name : user.name?.full || user.name?.first || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Noted</Text>
          <View style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {(() => {
                const IconComponent = Ionicons as any;
                return (
                  <IconComponent
                    name="document-text"
                    size={18}
                    color="#ffc107"
                    style={{ marginRight: 8 }}
                  />
                );
              })()}
              <Text style={styles.appName}>Noted</Text>
            </View>
            <Text style={styles.appDescription}>
              A simple and elegant note-taking app powered by Oxy services.
              Create, edit, and organize your thoughts seamlessly.
            </Text>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={[styles.settingItem, styles.firstSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive alerts for note reminders</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#e0e0e0', true: '#ffc107' }}
              thumbColor={notifications ? '#fff' : '#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#e0e0e0', true: '#ffc107' }}
              thumbColor={darkMode ? '#fff' : '#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="sync" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Auto Sync</Text>
                <Text style={styles.settingDescription}>Automatically sync notes across devices</Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#e0e0e0', true: '#ffc107' }}
              thumbColor={autoSync ? '#fff' : '#fff'}
            />
          </View>

          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-offline" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Offline Mode</Text>
                <Text style={styles.settingDescription}>Work without internet connection</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#e0e0e0', true: '#ffc107' }}
              thumbColor={offlineMode ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.firstSettingItem]}
            onPress={() => router.push('/create-note')}
          >
            <Ionicons name="add" size={20} color="#666" style={styles.settingIcon} />
            <Text style={styles.actionText}>Create New Note</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.lastSettingItem]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={20} color="#666" style={styles.settingIcon} />
            <Text style={styles.actionText}>Search Notes</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.firstSettingItem]}
            onPress={handleExportData}
          >
            <Ionicons name="download" size={20} color="#666" style={styles.settingIcon} />
            <Text style={styles.actionText}>Export Notes</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.lastSettingItem]}
            onPress={handleClearCache}
          >
            <Ionicons name="trash" size={20} color="#ff4757" style={styles.settingIcon} />
            <Text style={[styles.actionText, { color: '#ff4757' }]}>Clear Cache</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userCard: {
    padding: 24,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userIconText: {
    fontSize: 24,
    color: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  firstSettingItem: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 1,
  },
  lastSettingItem: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4757',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4757',
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authPromptIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  authPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

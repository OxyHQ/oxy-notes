import React, { useState, useEffect } from 'react';
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
import Constants from 'expo-constants';
import { useNotesStore } from '../stores/notesStore';
import ExportNotesModal from '../ui/components/ExportNotesModal';

export default function SettingsScreen() {
  const { user } = useOxy();
  const { notes, loadNotes } = useNotesStore();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load notes when component mounts
  useEffect(() => {
    console.log('Settings screen mounted, loading notes...');
    loadNotes();
  }, [loadNotes]);

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
    console.log('Export button pressed');
    console.log('Notes count:', notes.length);
    console.log('showExportModal state:', showExportModal);
    
    if (notes.length === 0) {
      Alert.alert(
        'No Notes to Export',
        'You don\'t have any notes to export yet. Create some notes first.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Setting showExportModal to true');
    setShowExportModal(true);
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
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem, styles.lastSettingItem]}
            onPress={() => {
              // Future: Navigate to account management screen
              Alert.alert('Account', 'Account management features coming soon!');
            }}
          >
            <View style={styles.userIcon}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.settingInfo}>
              <View>
                <Text style={styles.settingLabel}>
                  {typeof user.name === 'string' ? user.name : user.name?.full || user.name?.first || 'User'}
                </Text>
                <Text style={styles.settingDescription}>{user.email}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* About Noted */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Noted</Text>
          
          {/* App Title and Version */}
          <View style={[styles.settingItem, styles.firstSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={20} color="#ffc107" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Noted</Text>
                <Text style={styles.settingDescription}>Version {Constants.expoConfig?.version || '1.0.0'}</Text>
              </View>
            </View>
          </View>

          {/* Build Info */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="hammer" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Build</Text>
                <Text style={styles.settingDescription}>
                  {typeof Constants.expoConfig?.runtimeVersion === 'string' 
                    ? Constants.expoConfig.runtimeVersion 
                    : 'Development'}
                </Text>
              </View>
            </View>
          </View>

          {/* Platform Info */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Platform</Text>
                <Text style={styles.settingDescription}>
                  {Constants.platform?.ios ? 'iOS' : Constants.platform?.android ? 'Android' : 'Web'}
                </Text>
              </View>
            </View>
          </View>

          {/* Expo SDK */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="code-slash" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Expo SDK</Text>
                <Text style={styles.settingDescription}>{Constants.expoVersion || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          {/* Notes Count */}
          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="documents" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Your Notes</Text>
                <Text style={styles.settingDescription}>{notes.length} notes created</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support & Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Feedback</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem]}
            onPress={() => {
              Alert.alert(
                'Help & Support',
                'For help and support, please contact us at support@noted.app or visit our documentation.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Text style={styles.settingDescription}>Get help and documentation</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Send Feedback',
                'We\'d love to hear from you! Your feedback helps us improve Noted.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Send Feedback', 
                    onPress: () => {
                      // Here you could implement actual feedback functionality
                      Alert.alert('Thank you!', 'Your feedback is valuable to us.');
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Send Feedback</Text>
                <Text style={styles.settingDescription}>Share your thoughts and suggestions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={() => {
              Alert.alert(
                'Rate Noted',
                'Enjoying Noted? Please rate us on the App Store!',
                [
                  { text: 'Maybe Later', style: 'cancel' },
                  { 
                    text: 'Rate Now', 
                    onPress: () => {
                      // Here you could implement app store rating
                      Alert.alert('Thank you!', 'Redirecting to App Store...');
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="star" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Rate Noted</Text>
                <Text style={styles.settingDescription}>Rate us on the App Store</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
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
              trackColor={{ false: '#f0f0f0', true: '#34d399' }}
              thumbColor={notifications ? '#ffffff' : '#d1d5db'}
              ios_backgroundColor="#f0f0f0"
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
              trackColor={{ false: '#f0f0f0', true: '#6366f1' }}
              thumbColor={darkMode ? '#ffffff' : '#d1d5db'}
              ios_backgroundColor="#f0f0f0"
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
              trackColor={{ false: '#f0f0f0', true: '#10b981' }}
              thumbColor={autoSync ? '#ffffff' : '#d1d5db'}
              ios_backgroundColor="#f0f0f0"
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
              trackColor={{ false: '#f0f0f0', true: '#f59e0b' }}
              thumbColor={offlineMode ? '#ffffff' : '#d1d5db'}
              ios_backgroundColor="#f0f0f0"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem]}
            onPress={() => router.push('/create-note')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="add" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Create New Note</Text>
                <Text style={styles.settingDescription}>Start writing a new note</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={() => router.push('/search')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="search" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Search Notes</Text>
                <Text style={styles.settingDescription}>Find notes by title or content</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem]}
            onPress={handleExportData}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="download" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Export Notes</Text>
                <Text style={styles.settingDescription}>Download your notes as backup</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={handleClearCache}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="trash" size={20} color="#ff4757" style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingLabel, { color: '#ff4757' }]}>Clear Cache</Text>
                <Text style={styles.settingDescription}>Remove cached data from device</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem, styles.lastSettingItem, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="log-out" size={20} color="#ff4757" style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingLabel, { color: '#ff4757' }]}>Sign Out</Text>
                <Text style={styles.settingDescription}>Sign out of your account</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <ExportNotesModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        notes={notes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
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
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  settingItem: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  firstSettingItem: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 2,
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
  signOutButton: {
    borderWidth: 1,
    borderColor: '#ff4757',
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

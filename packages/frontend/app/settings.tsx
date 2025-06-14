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
import { useTranslation } from 'react-i18next';
import { useNotesStore } from '../stores/notesStore';
import ExportNotesModal from '../ui/components/ExportNotesModal';
import LanguageSelectionModal from '../ui/components/LanguageSelectionModal';
import { availableLanguages } from '../i18n';

export default function SettingsScreen() {
  const { user } = useOxy();
  const { notes, loadNotes } = useNotesStore();
  const { t, i18n } = useTranslation();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Load notes when component mounts
  useEffect(() => {
    console.log('Settings screen mounted, loading notes...');
    loadNotes();
  }, [loadNotes]);

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.signOut'),
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
      t('settings.data.clearCache'),
      t('settings.data.clearCacheMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: () => {
            // Implementation would clear app cache
            Alert.alert(t('common.success'), t('settings.data.clearCacheSuccess'));
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
        t('settings.data.noNotesToExport'),
        t('settings.data.noNotesToExportMessage'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    console.log('Setting showExportModal to true');
    setShowExportModal(true);
  };

  const getCurrentLanguageName = () => {
    const current = availableLanguages.find(lang => lang.code === i18n.language);
    return current ? current.name : t('common.defaultLanguageName');
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
          <Text style={styles.authPromptTitle}>{t('settings.title')}</Text>
          <Text style={styles.authPromptText}>
            {t('settings.signInPrompt')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.account')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem, styles.lastSettingItem]}
            onPress={() => {
              // Future: Navigate to account management screen
              Alert.alert(t('settings.sections.account'), t('settings.account.manageAccount'));
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
          <Text style={styles.sectionTitle}>{t('settings.sections.aboutNoted')}</Text>
          
          {/* App Title and Version */}
          <View style={[styles.settingItem, styles.firstSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={20} color="#ffc107" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.aboutNoted.appName')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.aboutNoted.version', { version: Constants.expoConfig?.version || '1.0.0' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Build Info */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="hammer" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.aboutNoted.build')}</Text>
                <Text style={styles.settingDescription}>
                  {typeof Constants.expoConfig?.runtimeVersion === 'string' 
                    ? Constants.expoConfig.runtimeVersion 
                    : t('settings.aboutNoted.buildVersion')}
                </Text>
              </View>
            </View>
          </View>

          {/* Platform Info */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.aboutNoted.platform')}</Text>
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
                <Text style={styles.settingLabel}>{t('settings.aboutNoted.expoSDK')}</Text>
                <Text style={styles.settingDescription}>{Constants.expoVersion || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          {/* Notes Count */}
          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="documents" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.aboutNoted.notesCount')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.aboutNoted.notesCountDesc', { count: notes.length })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support & Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.supportFeedback')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem]}
            onPress={() => {
              Alert.alert(
                t('settings.supportFeedback.helpSupport'),
                t('settings.supportFeedback.helpSupportMessage'),
                [{ text: t('common.ok') }]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.supportFeedback.helpSupport')}</Text>
                <Text style={styles.settingDescription}>{t('settings.supportFeedback.helpSupportDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                t('settings.supportFeedback.sendFeedback'),
                t('settings.supportFeedback.sendFeedbackMessage'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { 
                    text: t('common.sendFeedback'), 
                    onPress: () => {
                      // Here you could implement actual feedback functionality
                      Alert.alert(t('common.success'), t('settings.supportFeedback.sendFeedbackThankYou'));
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.supportFeedback.sendFeedback')}</Text>
                <Text style={styles.settingDescription}>{t('settings.supportFeedback.sendFeedbackDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={() => {
              Alert.alert(
                t('settings.supportFeedback.rateApp'),
                t('settings.supportFeedback.rateAppMessage'),
                [
                  { text: t('common.maybeLater'), style: 'cancel' },
                  { 
                    text: t('common.rateNow'), 
                    onPress: () => {
                      // Here you could implement app store rating
                      Alert.alert(t('common.success'), t('settings.supportFeedback.rateAppThankYou'));
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="star" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.supportFeedback.rateApp')}</Text>
                <Text style={styles.settingDescription}>{t('settings.supportFeedback.rateAppDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.preferences')}</Text>
          
          <View style={[styles.settingItem, styles.firstSettingItem]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.preferences.notifications')}</Text>
                <Text style={styles.settingDescription}>{t('settings.preferences.notificationsDesc')}</Text>
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
                <Text style={styles.settingLabel}>{t('settings.preferences.darkMode')}</Text>
                <Text style={styles.settingDescription}>{t('settings.preferences.darkModeDesc')}</Text>
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
                <Text style={styles.settingLabel}>{t('settings.preferences.autoSync')}</Text>
                <Text style={styles.settingDescription}>{t('settings.preferences.autoSyncDesc')}</Text>
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

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-offline" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.preferences.offlineMode')}</Text>
                <Text style={styles.settingDescription}>{t('settings.preferences.offlineModeDesc')}</Text>
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

          {/* Language Selection */}
          <TouchableOpacity 
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.preferences.language')}</Text>
                <Text style={styles.settingDescription}>
                  {getCurrentLanguageName()} • {t('settings.preferences.languageDesc')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.quickActions')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem]}
            onPress={() => router.push('/create-note')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="add" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.quickActions.createNote')}</Text>
                <Text style={styles.settingDescription}>{t('settings.quickActions.createNoteDesc')}</Text>
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
                <Text style={styles.settingLabel}>{t('settings.quickActions.searchNotes')}</Text>
                <Text style={styles.settingDescription}>{t('settings.quickActions.searchNotesDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.data')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.firstSettingItem]}
            onPress={handleExportData}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="download" size={20} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>{t('settings.data.exportNotes')}</Text>
                <Text style={styles.settingDescription}>{t('settings.data.exportNotesDesc')}</Text>
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
                <Text style={[styles.settingLabel, { color: '#ff4757' }]}>{t('settings.data.clearCache')}</Text>
                <Text style={styles.settingDescription}>{t('settings.data.clearCacheDesc')}</Text>
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
                <Text style={[styles.settingLabel, { color: '#ff4757' }]}>{t('settings.signOut')}</Text>
                <Text style={styles.settingDescription}>{t('settings.signOutDesc')}</Text>
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

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
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

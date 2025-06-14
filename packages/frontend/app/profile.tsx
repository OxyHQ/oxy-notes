import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useOxy } from '@oxyhq/services';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { user } = useOxy();
  const { t } = useTranslation();

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: () => {
            // For now, just navigate back - the actual sign out would depend on Oxy services
            router.replace('/');
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
          <Text style={styles.authPromptTitle}>{t('profile.title')}</Text>
          <Text style={styles.authPromptText}>
            {t('profile.signInPrompt')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
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
          <Text style={styles.sectionTitle}>{t('profile.aboutNoted')}</Text>
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
              {t('profile.appDescription')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.actions')}</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/create-note')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>{t('profile.createNote')}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>{t('profile.searchNotes')}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  actionArrow: {
    fontSize: 20,
    color: '#ccc',
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

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

export default function ProfileScreen() {
  const { user } = useOxy();

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
          <Text style={styles.authPromptTitle}>Profile</Text>
          <Text style={styles.authPromptText}>
            Please sign in to view your profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
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
                  size={24}
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
            <Text style={styles.appName}>📝 Noted</Text>
            <Text style={styles.appDescription}>
              A simple and elegant note-taking app powered by Oxy services.
              Create, edit, and organize your thoughts seamlessly.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/create-note')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Create New Note</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Search Notes</Text>
            <Text style={styles.actionArrow}>›</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userIconText: {
    fontSize: 24,
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
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

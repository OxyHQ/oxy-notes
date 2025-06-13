import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TabItem {
  name: string;
  path: string;
  icon: string;
  label: string;
}

const tabs: TabItem[] = [
  {
    name: 'notes',
    path: '/',
    icon: 'document-text',
    label: 'Notes',
  },
  {
    name: 'search',
    path: '/search',
    icon: 'search',
    label: 'Search',
  },
  {
    name: 'create',
    path: '/create-note',
    icon: 'add-circle',
    label: 'Create',
  },
  {
    name: 'profile',
    path: '/profile',
    icon: 'person',
    label: 'Profile',
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const handleTabPress = (path: string) => {
    if (pathname !== path) {
      router.push(path as any);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tab,
            isActive(tab.path) && styles.activeTab,
          ]}
          onPress={() => handleTabPress(tab.path)}
          activeOpacity={0.7}
        >
          {React.createElement(Ionicons, {
            name: tab.icon as any,
            size: isActive(tab.path) ? 26 : 24,
            color: isActive(tab.path) ? '#ffc107' : '#666',
          })}
          <Text style={[
            styles.label,
            isActive(tab.path) && styles.activeLabel,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  activeLabel: {
    color: '#ffc107',
    fontWeight: '600',
  },
});

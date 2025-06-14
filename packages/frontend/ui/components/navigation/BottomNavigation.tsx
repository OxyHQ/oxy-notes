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

interface BottomNavigationProps {
  orientation?: 'horizontal' | 'vertical';
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
    name: 'settings',
    path: '/settings',
    icon: 'settings',
    label: 'Settings',
  },
];

export default function BottomNavigation({ orientation = 'horizontal' }: BottomNavigationProps) {
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
    <View style={[
      styles.container,
      orientation === 'vertical' ? styles.verticalContainer : styles.horizontalContainer,
    ]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tab,
            isActive(tab.path) && styles.activeTab,
            orientation === 'vertical' ? styles.verticalTab : styles.horizontalTab,
            orientation === 'vertical' && isActive(tab.path) ? styles.verticalActiveTab : {},
          ]}
          onPress={() => handleTabPress(tab.path)}
          activeOpacity={0.7}
        >
          {(() => {
            const IconComponent = Ionicons as any;
            return (
              <IconComponent
                name={tab.icon}
                size={isActive(tab.path) ? 26 : 24}
                color={isActive(tab.path) ? '#ffc107' : '#666'}
              />
            );
          })()}
          <Text style={[
            styles.label,
            isActive(tab.path) && styles.activeLabel,
            orientation === 'vertical' ? styles.verticalLabel : {},
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
    backgroundColor: '#fff',
    borderRadius: 35,
    margin: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  horizontalContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  verticalContainer: {
    flexDirection: 'column',
    paddingVertical: 20,
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  horizontalTab: {
    flex: 1,
  },
  verticalTab: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 35,
  },
  verticalActiveTab: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    width: '90%',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  verticalLabel: {
    marginLeft: 12,
    marginTop: 0,
    fontSize: 14,
  },
  activeLabel: {
    color: '#ffc107',
    fontWeight: '600',
  },
});

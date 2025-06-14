import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
      <TouchableOpacity
          key={'create-note'}
          style={[
            styles.tab,
            { backgroundColor: '#ffc107', borderRadius: 35, padding: 4 },
            isActive('/create-note') && { opacity: 0.8 },
            orientation === 'vertical' ? styles.verticalTab : styles.horizontalTab,
          ]}
          onPress={() => handleTabPress('/create-note')}
          activeOpacity={0.7}
        >
          {(() => {
            const IconComponent = Ionicons as any;
            return (
              <IconComponent
                name={'add-circle'}
                size={45}
                color={isActive('/create-note') ? '#fff' : '#fff'}
              />
            );
          })()}
            {orientation === 'vertical' && (
            <Text style={[
              {color: '#fff', fontSize: 12, fontWeight: '500'},
              orientation === 'vertical' ? styles.verticalLabel : {},
            ]}>
              {'New Note'}
            </Text>
            )}
        </TouchableOpacity>
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
    ...(Platform.OS === 'web'
      ? {
          position: 'fixed' as any,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }
      : {}),
  },
  verticalContainer: {
    flexDirection: 'column',
    paddingVertical: 20,
    flex: 1,
    marginRight: 0,
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

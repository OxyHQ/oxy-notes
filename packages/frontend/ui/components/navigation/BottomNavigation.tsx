import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface TabItem {
  name: string;
  path: string;
  icon: string;
  labelKey: string;
}

interface BottomNavigationProps {
  orientation?: 'horizontal' | 'vertical';
}

const tabs: TabItem[] = [
  {
    name: 'notes',
    path: '/',
    icon: 'document-text',
    labelKey: 'navigation.home',
  },
  {
    name: 'search',
    path: '/search',
    icon: 'search',
    labelKey: 'navigation.search',
  },
  {
    name: 'settings',
    path: '/settings',
    icon: 'settings',
    labelKey: 'navigation.settings',
  },
];

export default function BottomNavigation({ orientation = 'horizontal' }: BottomNavigationProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

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
            {t(tab.labelKey)}
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
              {t('navigation.newNote')}
            </Text>
            )}
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  horizontalContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    margin: 6,
    padding: 8,
    borderRadius: 35,
    gap: 8,
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
    padding: 8,
    flex: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    marginTop: 10,
    borderTopRightRadius: 35,
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
  },
  activeTab: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 35,
  },
  verticalActiveTab: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
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

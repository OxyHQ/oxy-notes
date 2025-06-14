import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { availableLanguages, changeLanguage } from '../../i18n';

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelectionModal({ visible, onClose }: LanguageSelectionModalProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguageName = () => {
    const current = availableLanguages.find(lang => lang.code === currentLanguage);
    return current ? current.name : 'English (US)';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('settings.languageSelection.title')}</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Current Language */}
          <View style={styles.currentLanguageSection}>
            <Text style={styles.currentLanguageText}>
              {t('settings.languageSelection.current', { language: getCurrentLanguageName() })}
            </Text>
          </View>

          {/* Language List */}
          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  currentLanguage === language.code && styles.selectedLanguageItem
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    currentLanguage === language.code && styles.selectedLanguageName
                  ]}>
                    {language.name}
                  </Text>
                </View>
                {currentLanguage === language.code && (
                  <Ionicons name="checkmark" size={20} color="#ffc107" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  currentLanguageSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentLanguageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#fff',
  },
  selectedLanguageItem: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedLanguageName: {
    color: '#e67e00',
    fontWeight: '600',
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotesExporter, ExportFormat } from '../../utils/exportNotes';
import { StoredNote } from '../../utils/storage';

interface ExportNotesModalProps {
  visible: boolean;
  onClose: () => void;
  notes: StoredNote[];
}

interface FormatOption {
  format: ExportFormat;
  title: string;
  description: string;
  icon: string;
}

const formatOptions: FormatOption[] = [
  {
    format: 'json',
    title: 'JSON',
    description: 'Machine-readable format with complete data',
    icon: 'code-outline',
  },
  {
    format: 'markdown',
    title: 'Markdown',
    description: 'Human-readable format with formatting',
    icon: 'document-text-outline',
  },
  {
    format: 'txt',
    title: 'Plain Text',
    description: 'Simple text format for maximum compatibility',
    icon: 'document-outline',
  },
  {
    format: 'csv',
    title: 'CSV',
    description: 'Spreadsheet-compatible format',
    icon: 'grid-outline',
  },
];

export default function ExportNotesModal({ visible, onClose, notes }: ExportNotesModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const stats = NotesExporter.getExportStats(notes);

  // Debug logging
  console.log('ExportNotesModal props:', { visible, notes: notes.length });
  
  React.useEffect(() => {
    if (visible) {
      console.log('Export modal is now visible with', notes.length, 'notes');
    }
  }, [visible, notes.length]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      await NotesExporter.exportNotes(notes, {
        format: selectedFormat,
        includeArchived,
        includeMetadata,
      });

      const message = Platform.OS === 'web' 
        ? 'Your notes have been downloaded to your device.'
        : 'Your notes have been exported successfully. You can now share or save the file.';

      Alert.alert(
        'Export Complete',
        message,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your notes. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const getPreviewCount = () => {
    return includeArchived ? stats.total : stats.active;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Notes</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Export Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Preview</Text>
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Notes to export:</Text>
                <Text style={styles.statValue}>{getPreviewCount()}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Active notes:</Text>
                <Text style={styles.statValue}>{stats.active}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Archived notes:</Text>
                <Text style={styles.statValue}>{stats.archived}</Text>
              </View>
            </View>
          </View>

          {/* Format Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Format</Text>
            <View style={styles.formatGrid}>
              {formatOptions.map((option) => (
                <TouchableOpacity
                  key={option.format}
                  style={[
                    styles.formatOption,
                    selectedFormat === option.format && styles.formatOptionSelected,
                  ]}
                  onPress={() => setSelectedFormat(option.format)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={selectedFormat === option.format ? '#007AFF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.formatTitle,
                      selectedFormat === option.format && styles.formatTitleSelected,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text style={styles.formatDescription}>{option.description}</Text>
                  {selectedFormat === option.format && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Export Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Options</Text>
            
            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Include Archived Notes</Text>
                <Text style={styles.optionDescription}>
                  Export archived notes along with active ones
                </Text>
              </View>
              <Switch
                value={includeArchived}
                onValueChange={setIncludeArchived}
                trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
                thumbColor={includeArchived ? '#ffffff' : '#d1d5db'}
                ios_backgroundColor="#f0f0f0"
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Include Metadata</Text>
                <Text style={styles.optionDescription}>
                  Include creation dates, sync status, and other technical details
                </Text>
              </View>
              <Switch
                value={includeMetadata}
                onValueChange={setIncludeMetadata}
                trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
                thumbColor={includeMetadata ? '#ffffff' : '#d1d5db'}
                ios_backgroundColor="#f0f0f0"
              />
            </View>
          </View>
        </ScrollView>

        {/* Export Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="download" size={20} color="#fff" />
            )}
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export Notes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  formatOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  formatTitleSelected: {
    color: '#007AFF',
  },
  formatDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  optionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

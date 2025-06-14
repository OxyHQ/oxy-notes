import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { StoredNote } from './storage';

export type ExportFormat = 'json' | 'csv' | 'txt' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeArchived?: boolean;
  includeMetadata?: boolean;
}

export class NotesExporter {
  /**
   * Export notes to the specified format
   */
  static async exportNotes(
    notes: StoredNote[], 
    options: ExportOptions = { format: 'json' }
  ): Promise<string> {
    try {
      // Filter notes based on options
      let notesToExport = notes;
      if (!options.includeArchived) {
        notesToExport = notes.filter(note => !note.archived);
      }

      // Sort notes by creation date
      notesToExport = notesToExport.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      let content: string;
      let fileName: string;
      let mimeType: string;

      switch (options.format) {
        case 'json':
          content = this.exportToJSON(notesToExport, options.includeMetadata);
          fileName = `notes-export-${this.getDateString()}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          content = this.exportToCSV(notesToExport, options.includeMetadata);
          fileName = `notes-export-${this.getDateString()}.csv`;
          mimeType = 'text/csv';
          break;
        case 'txt':
          content = this.exportToTXT(notesToExport, options.includeMetadata);
          fileName = `notes-export-${this.getDateString()}.txt`;
          mimeType = 'text/plain';
          break;
        case 'markdown':
          content = this.exportToMarkdown(notesToExport, options.includeMetadata);
          fileName = `notes-export-${this.getDateString()}.md`;
          mimeType = 'text/markdown';
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Create file and share based on platform
      if (Platform.OS === 'web') {
        // Web platform - use browser download
        this.downloadFileOnWeb(content, fileName, mimeType);
        return fileName; // Return filename for web
      } else {
        // Native platforms - use Expo FileSystem and Sharing
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: 'Export Notes',
          });
        } else {
          throw new Error('Sharing is not available on this device');
        }

        return fileUri;
      }
    } catch (error) {
      console.error('Error exporting notes:', error);
      throw error;
    }
  }

  /**
   * Export notes to JSON format
   */
  private static exportToJSON(notes: StoredNote[], includeMetadata: boolean = true): string {
    const exportData = {
      exportInfo: {
        appName: 'Noted',
        exportDate: new Date().toISOString(),
        totalNotes: notes.length,
        format: 'json',
        version: '1.0.0',
      },
      notes: notes.map(note => {
        const exportNote: any = {
          title: note.title,
          content: note.content,
          color: note.color,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        };

        if (includeMetadata) {
          exportNote.id = note.id;
          exportNote.localId = note.localId;
          exportNote.syncStatus = note.syncStatus;
          exportNote.lastModified = note.lastModified;
          if (note.archived) {
            exportNote.archived = note.archived;
          }
        }

        return exportNote;
      }),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export notes to CSV format
   */
  private static exportToCSV(notes: StoredNote[], includeMetadata: boolean = true): string {
    const headers = ['Title', 'Content', 'Color', 'Created At', 'Updated At'];
    if (includeMetadata) {
      headers.push('ID', 'Sync Status', 'Archived');
    }

    const rows = [headers.join(',')];
    
    notes.forEach(note => {
      const row = [
        this.escapeCSV(note.title),
        this.escapeCSV(note.content),
        note.color,
        note.createdAt,
        note.updatedAt,
      ];

      if (includeMetadata) {
        row.push(
          note.id || '',
          note.syncStatus || '',
          note.archived ? 'true' : 'false'
        );
      }

      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Export notes to plain text format
   */
  private static exportToTXT(notes: StoredNote[], includeMetadata: boolean = true): string {
    const lines = [];
    
    lines.push('NOTED - NOTES EXPORT');
    lines.push('===================');
    lines.push(`Export Date: ${new Date().toLocaleString()}`);
    lines.push(`Total Notes: ${notes.length}`);
    lines.push('');

    notes.forEach((note, index) => {
      lines.push(`--- NOTE ${index + 1} ---`);
      lines.push(`Title: ${note.title}`);
      lines.push(`Created: ${new Date(note.createdAt).toLocaleString()}`);
      lines.push(`Updated: ${new Date(note.updatedAt).toLocaleString()}`);
      
      if (includeMetadata) {
        lines.push(`Color: ${note.color}`);
        lines.push(`Status: ${note.syncStatus || 'unknown'}`);
        if (note.archived) {
          lines.push(`Archived: Yes`);
        }
      }
      
      lines.push('');
      lines.push('Content:');
      lines.push(note.content);
      lines.push('');
      lines.push('━'.repeat(50));
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export notes to Markdown format
   */
  private static exportToMarkdown(notes: StoredNote[], includeMetadata: boolean = true): string {
    const lines = [];
    
    lines.push('# Notes Export');
    lines.push('');
    lines.push(`**Export Date:** ${new Date().toLocaleString()}`);
    lines.push(`**Total Notes:** ${notes.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    notes.forEach((note, index) => {
      lines.push(`## ${note.title}`);
      lines.push('');
      
      if (includeMetadata) {
        lines.push('**Metadata:**');
        lines.push(`- Created: ${new Date(note.createdAt).toLocaleString()}`);
        lines.push(`- Updated: ${new Date(note.updatedAt).toLocaleString()}`);
        lines.push(`- Color: ${note.color}`);
        if (note.archived) {
          lines.push(`- Status: Archived`);
        }
        lines.push('');
      }
      
      lines.push('**Content:**');
      lines.push('');
      lines.push(note.content);
      lines.push('');
      
      if (index < notes.length - 1) {
        lines.push('---');
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  /**
   * Escape CSV values
   */
  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Get formatted date string for filename
   */
  private static getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}-${hours}${minutes}`;
  }

  /**
   * Get export statistics
   */
  static getExportStats(notes: StoredNote[]): {
    total: number;
    active: number;
    archived: number;
    syncedCount: number;
    pendingCount: number;
  } {
    return {
      total: notes.length,
      active: notes.filter(n => !n.archived).length,
      archived: notes.filter(n => !!n.archived).length,
      syncedCount: notes.filter(n => n.syncStatus === 'synced').length,
      pendingCount: notes.filter(n => n.syncStatus === 'pending').length,
    };
  }

  /**
   * Download file on web platform using browser download
   */
  private static downloadFileOnWeb(content: string, fileName: string, mimeType: string): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Web download not available in this environment');
      }

      // Create blob with the content
      const blob = new Blob([content], { type: mimeType });
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      
      // Create temporary anchor element for download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file on web:', error);
      throw new Error('Failed to download file on web platform');
    }
  }
}

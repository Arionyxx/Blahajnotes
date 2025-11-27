import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { ThemeToggle } from './ThemeToggle';
import { AutoSaveSlider } from './AutoSaveSlider';
import { DataLocation } from './DataLocation';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { settings, loadSettings } = useSettings();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Close on click outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
              onClose();
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!settings) return null;

  const styles = {
      overlay: {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
      },
      modal: {
          backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#fff',
          color: settings.theme === 'dark' ? '#fff' : '#000',
          padding: '20px',
          borderRadius: '8px',
          width: '500px',
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      },
      header: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: settings.theme === 'dark' ? '1px solid #333' : '1px solid #eee',
          paddingBottom: '10px',
      },
      closeButton: {
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: settings.theme === 'dark' ? '#fff' : '#000',
      }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} ref={modalRef}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Settings</h2>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <ThemeToggle />
        <AutoSaveSlider />
        <DataLocation />
        
        <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#888' }}>
            Settings are automatically saved.
        </div>
      </div>
    </div>
  );
};

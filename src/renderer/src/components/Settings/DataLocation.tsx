import React from 'react';
import { useSettings } from '../../hooks/useSettings';

export const DataLocation: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const handleChange = async () => {
    try {
      const result = await window.fileSystem.selectDirectory();
      if (result) {
          updateSettings({ dataPath: result });
      }
    } catch (e) {
      console.error("Failed to select directory", e);
      alert("Failed to open directory picker");
    }
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Location</label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
            type="text" 
            value={settings.dataPath} 
            readOnly 
            style={{ flex: 1, padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} 
        />
        <button onClick={handleChange} style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #999' }}>
            Change...
        </button>
      </div>
    </div>
  );
};

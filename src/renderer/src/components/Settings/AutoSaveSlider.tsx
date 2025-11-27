import React from 'react';
import { useSettings } from '../../hooks/useSettings';

export const AutoSaveSlider: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    updateSettings({ autoSaveInterval: val * 1000 });
  };

  const seconds = settings.autoSaveInterval / 1000;

  return (
    <div style={{ padding: '10px 0' }}>
      <label htmlFor="autosave-slider" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Auto-save Interval: {seconds}s
      </label>
      <input
        id="autosave-slider"
        type="range"
        min="1"
        max="10"
        step="1"
        value={seconds}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
    </div>
  );
};

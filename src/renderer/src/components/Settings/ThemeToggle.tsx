import React from 'react';
import { useSettings } from '../../hooks/useSettings';

export const ThemeToggle: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
      <label htmlFor="theme-toggle" style={{ fontWeight: 'bold' }}>Dark Mode</label>
      <input
        id="theme-toggle"
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
      />
    </div>
  );
};

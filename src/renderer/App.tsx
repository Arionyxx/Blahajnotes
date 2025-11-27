import React, { useState, useEffect } from 'react';
import { RichTextEditor } from './src/components/Editor/RichTextEditor';
import { GraphCanvas } from './src/components/Graph/GraphCanvas';
import { SettingsPanel } from './src/components/Settings/SettingsPanel';
import { useSettings } from './src/hooks/useSettings';

const App = () => {
  const [view, setView] = useState<'notes' | 'graph'>('graph');
  const [showSettings, setShowSettings] = useState(false);
  const { settings, loadSettings } = useSettings();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === ',') {
            setShowSettings(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDark = settings?.theme === 'dark';
  
  // Apply theme to body
  useEffect(() => {
      if (isDark) {
          document.body.classList.add('dark');
      } else {
          document.body.classList.remove('dark');
      }
  }, [isDark]);

  const buttonStyle = (active: boolean) => ({
    padding: '5px 10px',
    marginRight: '10px',
    fontWeight: active ? 'bold' : 'normal',
    background: active 
        ? (isDark ? '#444' : '#ddd') 
        : (isDark ? '#222' : '#f0f0f0'),
    color: isDark ? '#fff' : '#000',
    border: `1px solid ${isDark ? '#555' : '#ccc'}`,
    borderRadius: '4px',
    cursor: 'pointer'
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5em' }}>Story World</h1>
        <div>
            <button 
                onClick={() => setView('notes')}
                style={buttonStyle(view === 'notes')}
            >
                Notes
            </button>
            <button 
                onClick={() => setView('graph')}
                style={buttonStyle(view === 'graph')}
            >
                Graph
            </button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
            <button 
                onClick={() => setShowSettings(true)}
                style={buttonStyle(false)}
            >
                Settings
            </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
         {view === 'notes' ? <RichTextEditor /> : <GraphCanvas />}
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;

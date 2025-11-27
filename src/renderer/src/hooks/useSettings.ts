import { create } from 'zustand';
import { Settings } from '../../../shared/types';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

export const useSettings = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  loadSettings: async () => {
    set({ loading: true });
    try {
      const settings = await window.fileSystem.loadSettings();
      set({ settings, loading: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ loading: false });
    }
  },
  updateSettings: async (newSettings) => {
    const currentSettings = get().settings;
    if (!currentSettings) return;

    const updated = { ...currentSettings, ...newSettings };
    set({ settings: updated });
    try {
      await window.fileSystem.saveSettings(updated);
    } catch (error) {
      console.error('Failed to save settings:', error);
      set({ settings: currentSettings });
    }
  },
}));

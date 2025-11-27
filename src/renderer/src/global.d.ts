import { Note, GraphData, Settings } from '../../shared/types';
import { IpcRendererEvent } from 'electron';

declare global {
  interface Window {
    fileSystem: {
      loadProject: () => Promise<void>;
      loadSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<void>;
      selectDirectory: () => Promise<string | null>;
      saveNote: (note: Note) => Promise<void>;
      deleteNote: (id: string) => Promise<void>;
      saveGraph: (graph: GraphData) => Promise<void>;
      loadGraph: () => Promise<GraphData>;
      listFiles: () => Promise<void>;
      onFileChange: (callback: (event: IpcRendererEvent, data: { event: string; filePath: string }) => void) => () => void;
    };
  }
}

export {};

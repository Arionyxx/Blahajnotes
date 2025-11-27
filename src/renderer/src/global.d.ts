import { Note, GraphData } from '../../shared/types';
import { IpcRendererEvent } from 'electron';

declare global {
  interface Window {
    fileSystem: {
      loadProject: () => Promise<void>;
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

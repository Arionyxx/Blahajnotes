import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Note, GraphData } from '../shared/types';

contextBridge.exposeInMainWorld('fileSystem', {
  loadProject: () => ipcRenderer.invoke('project:load'),
  saveNote: (note: Note) => ipcRenderer.invoke('note:save', note),
  deleteNote: (id: string) => ipcRenderer.invoke('note:delete', id),
  saveGraph: (graph: GraphData) => ipcRenderer.invoke('graph:save', graph),
  loadGraph: () => ipcRenderer.invoke('graph:load'),
  listFiles: () => ipcRenderer.invoke('files:list'),
  onFileChange: (callback: (event: IpcRendererEvent, data: { event: string; filePath: string }) => void) => {
    const subscription = (_: IpcRendererEvent, data: { event: string; filePath: string }) => callback(_, data);
    ipcRenderer.on('file:changed', subscription);
    return () => ipcRenderer.removeListener('file:changed', subscription);
  }
});

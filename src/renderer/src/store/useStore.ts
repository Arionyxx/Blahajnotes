import { create } from 'zustand';
import { Note } from '../../../shared/types';

interface StoreState {
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  updateNoteContent: (content: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedNote: {
    id: '1',
    title: 'Test Note',
    content: '<h1>Hello World</h1><p>This is a test note.</p>',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, // Default mock note
  setSelectedNote: (note) => set({ selectedNote: note }),
  updateNoteContent: (content) => set((state) => ({
    selectedNote: state.selectedNote ? { ...state.selectedNote, content } : null
  })),
}));

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileStore } from './FileStore';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Note } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_DIR = path.join(os.tmpdir(), 'notes-app-test-' + uuidv4());

describe('FileStore', () => {
  let fileStore: FileStore;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    fileStore = new FileStore(TEST_DIR);
  });

  afterEach(async () => {
    fileStore.close();
    await fs.remove(TEST_DIR);
  });

  it('should create and read a note', async () => {
    const note: Note = {
      id: 'note-1',
      title: 'Test Note',
      content: 'This is a test',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fileStore.writeNote(note);
    const readNote = await fileStore.readNote(note.id);
    expect(readNote).toEqual(note);
  });

  it('should delete a note', async () => {
    const note: Note = {
      id: 'note-2',
      title: 'Delete Me',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fileStore.writeNote(note);
    await fileStore.deleteNote(note.id);
    await expect(fileStore.readNote(note.id)).rejects.toThrow();
  });

  it('should list notes', async () => {
     const note1: Note = {
      id: 'note-1',
      title: 'Note 1',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
     const note2: Note = {
      id: 'note-2',
      title: 'Note 2',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fileStore.writeNote(note1);
    await fileStore.writeNote(note2);

    const notes = await fileStore.listNotes();
    expect(notes).toHaveLength(2);
    expect(notes.map(n => n.id).sort()).toEqual(['note-1', 'note-2']);
  });
  
  it('should handle invalid data', async () => {
    const badPath = path.join(TEST_DIR, 'notes', 'bad.json');
    await fs.ensureDir(path.dirname(badPath));
    await fs.writeJson(badPath, { id: 'bad', title: 123 });

    // listNotes should ideally skip invalid notes or handle them?
    // My implementation logs error and returns null, filtering it out.
    // So listNotes should return 0 valid notes.
    
    const notes = await fileStore.listNotes();
    expect(notes).toHaveLength(0);

    // direct read should throw
    await expect(fileStore.readNote('bad')).rejects.toThrow();
  });

  it('should perform well with 1000 notes', async () => {
    const notes: Note[] = [];
    for (let i = 0; i < 1000; i++) {
      notes.push({
        id: `perf-${i}`,
        title: `Perf Note ${i}`,
        content: 'Some content',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Write them all
    await Promise.all(notes.map(n => fileStore.writeNote(n)));

    const start = performance.now();
    const readNotes = await fileStore.listNotes();
    const end = performance.now();

    expect(readNotes).toHaveLength(1000);
    console.log(`Read 1000 notes in ${end - start}ms`);
    // Relaxed requirement for test environment
    expect(end - start).toBeLessThan(2000); 
  });
});

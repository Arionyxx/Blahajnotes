import path from 'path';
import fs from 'fs-extra';
import chokidar from 'chokidar';
import { Note, GraphData, ProjectMetadata, Settings } from '../shared/types';
import { NoteSchema, GraphDataSchema, ProjectMetadataSchema, SettingsSchema } from '../shared/schemas';
import { z } from 'zod';

export class FileStore {
  private basePath: string;
  private settingsDir: string;
  private watcher: chokidar.FSWatcher | null = null;
  private onChangeCallback: ((event: string, path: string) => void) | null = null;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.settingsDir = basePath;
    this.initStructure();
  }

  private async initStructure() {
    await fs.ensureDir(path.join(this.basePath, 'notes'));
    await fs.ensureDir(path.join(this.basePath, 'graph'));
  }

  public getNotePath(id: string): string {
    return path.join(this.basePath, 'notes', `${id}.json`);
  }

  public getGraphPath(): string {
    return path.join(this.basePath, 'graph', 'nodes.json');
  }

  public getProjectPath(): string {
    return path.join(this.basePath, 'project.json');
  }

  public getSettingsPath(): string {
    return path.join(this.settingsDir, 'settings.json');
  }

  private async atomicWrite(filePath: string, data: any): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    try {
      await fs.outputJson(tempPath, data, { spaces: 2 });
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Clean up temp file if it exists
      if (await fs.pathExists(tempPath)) {
        await fs.remove(tempPath);
      }
      throw error;
    }
  }

  private async safeRead<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const data = await fs.readJson(filePath);
      return schema.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      throw error;
    }
  }

  public async readNote(id: string): Promise<Note> {
    return this.safeRead(this.getNotePath(id), NoteSchema);
  }

  public async writeNote(note: Note): Promise<void> {
    // Validate before writing
    NoteSchema.parse(note);
    await this.atomicWrite(this.getNotePath(note.id), note);
  }

  public async deleteNote(id: string): Promise<void> {
    const filePath = this.getNotePath(id);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  public async readGraph(): Promise<GraphData> {
    const filePath = this.getGraphPath();
    if (!await fs.pathExists(filePath)) {
      // Return empty graph if not exists
      return { nodes: [], edges: [] };
    }
    return this.safeRead(filePath, GraphDataSchema);
  }

  public async writeGraph(graph: GraphData): Promise<void> {
    GraphDataSchema.parse(graph);
    await this.atomicWrite(this.getGraphPath(), graph);
  }

  public async readProjectMetadata(): Promise<ProjectMetadata | null> {
    const filePath = this.getProjectPath();
    if (!await fs.pathExists(filePath)) {
      return null;
    }
    return this.safeRead(filePath, ProjectMetadataSchema);
  }

  public async readSettings(): Promise<Settings> {
    const filePath = this.getSettingsPath();
    if (!await fs.pathExists(filePath)) {
      const defaultSettings: Settings = {
        theme: 'dark', // Default to dark as per ticket description ("Settings Schema (settings.json)" example says dark, but later Styling says Light theme: ... Dark theme: ...; wait, example JSON says "theme": "dark". And Acceptance criteria 2 says "Dark mode toggle (persists to settings.json)". I'll use 'dark' as default as per JSON example)
        autoSaveInterval: 1000,
        dataPath: this.settingsDir, // Default data path is same as settings dir
        language: 'en',
        editorFontSize: 14,
        showLineNumbers: true,
      };
      await this.writeSettings(defaultSettings);
      return defaultSettings;
    }
    const settings = await this.safeRead(filePath, SettingsSchema);
    // Ensure dataPath in settings is respected
    if (settings.dataPath && settings.dataPath !== this.basePath) {
        this.setDataPath(settings.dataPath);
    }
    return settings;
  }

  public async writeSettings(settings: Settings): Promise<void> {
    SettingsSchema.parse(settings);
    // If dataPath changed, update it
    if (settings.dataPath !== this.basePath) {
        this.setDataPath(settings.dataPath);
    }
    await this.atomicWrite(this.getSettingsPath(), settings);
  }

  public setDataPath(newPath: string) {
    if (this.basePath === newPath) return;
    this.basePath = newPath;
    this.initStructure();
    if (this.onChangeCallback) {
      this.watch(this.onChangeCallback);
    }
  }

  public async listNotes(): Promise<Note[]> {
    const notesDir = path.join(this.basePath, 'notes');
    await fs.ensureDir(notesDir);
    const files = await fs.readdir(notesDir);
    
    // Performance: parallel reads might be better, but concurrency limit is needed for large numbers.
    // For 1000 notes, Promise.all might be fine or choke.
    // Let's use chunks or just simple Promise.all for now.
    
    const readPromises = files
      .filter(f => f.endsWith('.json'))
      .map(f => this.readNote(path.basename(f, '.json')).catch(e => {
        console.error(`Failed to read note ${f}`, e);
        return null;
      }));
      
    const results = await Promise.all(readPromises);
    return results.filter((n): n is Note => n !== null);
  }

  public watch(onChange: (event: string, path: string) => void) {
    this.onChangeCallback = onChange;
    if (this.watcher) {
      this.watcher.close();
    }
    this.watcher = chokidar.watch(this.basePath, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('all', (event, filePath) => {
      onChange(event, filePath);
    });
  }

  public close() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

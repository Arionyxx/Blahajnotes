import path from 'path';
import fs from 'fs-extra';
import chokidar from 'chokidar';
import { Note, GraphData, ProjectMetadata } from '../shared/types';
import { NoteSchema, GraphDataSchema, ProjectMetadataSchema } from '../shared/schemas';
import { z } from 'zod';

export class FileStore {
  private basePath: string;
  private watcher: chokidar.FSWatcher | null = null;

  constructor(basePath: string) {
    this.basePath = basePath;
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

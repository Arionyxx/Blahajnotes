export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export interface NodeData {
  role?: string;
  description?: string;
  [key: string]: any;
}

export interface Node {
  id: string;
  label?: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  width?: number;
  height?: number;
  selected?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface ProjectMetadata {
  name: string;
  created: string; // ISO 8601 date string
  lastModified: string; // ISO 8601 date string
}

export interface AppMetadata {
  version: string;
  lastSync: string; // ISO 8601 date string
}

export interface Settings {
  theme: 'light' | 'dark';
  autoSaveInterval: number;
  dataPath: string;
  language: string;
  editorFontSize: number;
  showLineNumbers: boolean;
}

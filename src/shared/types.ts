export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Edge {
  source: string;
  target: string;
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

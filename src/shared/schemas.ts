import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const NodeSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  type: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
  width: z.number().optional(),
  height: z.number().optional(),
  selected: z.boolean().optional(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
});

export const GraphDataSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export const ProjectMetadataSchema = z.object({
  name: z.string(),
  created: z.string(),
  lastModified: z.string(),
});

export const AppMetadataSchema = z.object({
  version: z.string(),
  lastSync: z.string(),
});

export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  autoSaveInterval: z.number(), // In milliseconds
  dataPath: z.string(),
  language: z.string().default('en'),
  editorFontSize: z.number().default(14),
  showLineNumbers: z.boolean().default(true),
});

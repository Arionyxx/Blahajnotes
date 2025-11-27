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
  label: z.string(),
  x: z.number(),
  y: z.number(),
});

export const EdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
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

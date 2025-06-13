
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  owner_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Node types enum
export const nodeTypeSchema = z.enum(['text', 'ai_document', 'ai_brainstorm', 'media', 'custom']);
export type NodeType = z.infer<typeof nodeTypeSchema>;

// Document types enum
export const documentTypeSchema = z.enum(['project_brief', 'prd', 'lean_canvas', 'other']);
export type DocumentType = z.infer<typeof documentTypeSchema>;

// Canvas node schema
export const canvasNodeSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  type: nodeTypeSchema,
  title: z.string(),
  content: z.string().nullable(),
  position_x: z.number(),
  position_y: z.number(),
  width: z.number(),
  height: z.number(),
  style_data: z.record(z.any()).nullable(), // JSON data for styling
  metadata: z.record(z.any()).nullable(), // JSON data for additional properties
  created_by: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CanvasNode = z.infer<typeof canvasNodeSchema>;

// AI document schema
export const aiDocumentSchema = z.object({
  id: z.string(),
  node_id: z.string(),
  document_type: documentTypeSchema,
  prompt: z.string(),
  generated_content: z.string(),
  status: z.enum(['generating', 'completed', 'failed']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type AiDocument = z.infer<typeof aiDocumentSchema>;

// Canvas edge schema (for connecting nodes)
export const canvasEdgeSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  source_node_id: z.string(),
  target_node_id: z.string(),
  style_data: z.record(z.any()).nullable(),
  created_at: z.coerce.date()
});

export type CanvasEdge = z.infer<typeof canvasEdgeSchema>;

// Project sharing schema
export const projectShareSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  shared_with_user_id: z.string(),
  permission: z.enum(['view', 'comment', 'edit']),
  created_by: z.string(),
  created_at: z.coerce.date()
});

export type ProjectShare = z.infer<typeof projectShareSchema>;

// Comment schema
export const commentSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  node_id: z.string().nullable(),
  content: z.string(),
  position_x: z.number().nullable(),
  position_y: z.number().nullable(),
  author_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Comment = z.infer<typeof commentSchema>;

// Input schemas for creating entities
export const createProjectInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  owner_id: z.string()
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const createCanvasNodeInputSchema = z.object({
  project_id: z.string(),
  type: nodeTypeSchema,
  title: z.string().min(1),
  content: z.string().nullable().optional(),
  position_x: z.number(),
  position_y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  style_data: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  created_by: z.string()
});

export type CreateCanvasNodeInput = z.infer<typeof createCanvasNodeInputSchema>;

export const createAiDocumentInputSchema = z.object({
  node_id: z.string(),
  document_type: documentTypeSchema,
  prompt: z.string().min(1)
});

export type CreateAiDocumentInput = z.infer<typeof createAiDocumentInputSchema>;

export const createCanvasEdgeInputSchema = z.object({
  project_id: z.string(),
  source_node_id: z.string(),
  target_node_id: z.string(),
  style_data: z.record(z.any()).nullable().optional()
});

export type CreateCanvasEdgeInput = z.infer<typeof createCanvasEdgeInputSchema>;

export const createProjectShareInputSchema = z.object({
  project_id: z.string(),
  shared_with_user_id: z.string(),
  permission: z.enum(['view', 'comment', 'edit']),
  created_by: z.string()
});

export type CreateProjectShareInput = z.infer<typeof createProjectShareInputSchema>;

export const createCommentInputSchema = z.object({
  project_id: z.string(),
  node_id: z.string().nullable().optional(),
  content: z.string().min(1),
  position_x: z.number().nullable().optional(),
  position_y: z.number().nullable().optional(),
  author_id: z.string()
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

// Update schemas
export const updateProjectInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export const updateCanvasNodeInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().nullable().optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  style_data: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

export type UpdateCanvasNodeInput = z.infer<typeof updateCanvasNodeInputSchema>;

// Query schemas
export const getProjectInputSchema = z.object({
  id: z.string()
});

export type GetProjectInput = z.infer<typeof getProjectInputSchema>;

export const getProjectCanvasInputSchema = z.object({
  project_id: z.string()
});

export type GetProjectCanvasInput = z.infer<typeof getProjectCanvasInputSchema>;

export const getUserProjectsInputSchema = z.object({
  user_id: z.string()
});

export type GetUserProjectsInput = z.infer<typeof getUserProjectsInputSchema>;

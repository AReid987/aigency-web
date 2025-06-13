
import { text, pgTable, timestamp, real, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const nodeTypeEnum = pgEnum('node_type', ['text', 'ai_document', 'ai_brainstorm', 'media', 'custom']);
export const documentTypeEnum = pgEnum('document_type', ['project_brief', 'prd', 'lean_canvas', 'other']);
export const documentStatusEnum = pgEnum('document_status', ['generating', 'completed', 'failed']);
export const permissionEnum = pgEnum('permission', ['view', 'comment', 'edit']);

// Users table
export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  owner_id: text('owner_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Canvas nodes table
export const canvasNodesTable = pgTable('canvas_nodes', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull().references(() => projectsTable.id, { onDelete: 'cascade' }),
  type: nodeTypeEnum('type').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  position_x: real('position_x').notNull(),
  position_y: real('position_y').notNull(),
  width: real('width').notNull(),
  height: real('height').notNull(),
  style_data: jsonb('style_data'),
  metadata: jsonb('metadata'),
  created_by: text('created_by').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// AI documents table
export const aiDocumentsTable = pgTable('ai_documents', {
  id: text('id').primaryKey(),
  node_id: text('node_id').notNull().references(() => canvasNodesTable.id, { onDelete: 'cascade' }).unique(),
  document_type: documentTypeEnum('document_type').notNull(),
  prompt: text('prompt').notNull(),
  generated_content: text('generated_content').notNull(),
  status: documentStatusEnum('status').notNull().default('generating'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Canvas edges table
export const canvasEdgesTable = pgTable('canvas_edges', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull().references(() => projectsTable.id, { onDelete: 'cascade' }),
  source_node_id: text('source_node_id').notNull().references(() => canvasNodesTable.id, { onDelete: 'cascade' }),
  target_node_id: text('target_node_id').notNull().references(() => canvasNodesTable.id, { onDelete: 'cascade' }),
  style_data: jsonb('style_data'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Project sharing table
export const projectSharesTable = pgTable('project_shares', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull().references(() => projectsTable.id, { onDelete: 'cascade' }),
  shared_with_user_id: text('shared_with_user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  permission: permissionEnum('permission').notNull(),
  created_by: text('created_by').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Comments table
export const commentsTable = pgTable('comments', {
  id: text('id').primaryKey(),
  project_id: text('project_id').notNull().references(() => projectsTable.id, { onDelete: 'cascade' }),
  node_id: text('node_id').references(() => canvasNodesTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  position_x: real('position_x'),
  position_y: real('position_y'),
  author_id: text('author_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  ownedProjects: many(projectsTable),
  createdNodes: many(canvasNodesTable),
  sharedProjects: many(projectSharesTable, { relationName: 'sharedWith' }),
  createdShares: many(projectSharesTable, { relationName: 'createdBy' }),
  comments: many(commentsTable)
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [projectsTable.owner_id],
    references: [usersTable.id]
  }),
  nodes: many(canvasNodesTable),
  edges: many(canvasEdgesTable),
  shares: many(projectSharesTable),
  comments: many(commentsTable)
}));

export const canvasNodesRelations = relations(canvasNodesTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [canvasNodesTable.project_id],
    references: [projectsTable.id]
  }),
  creator: one(usersTable, {
    fields: [canvasNodesTable.created_by],
    references: [usersTable.id]
  }),
  aiDocument: one(aiDocumentsTable),
  sourceEdges: many(canvasEdgesTable, { relationName: 'sourceNode' }),
  targetEdges: many(canvasEdgesTable, { relationName: 'targetNode' }),
  comments: many(commentsTable)
}));

export const aiDocumentsRelations = relations(aiDocumentsTable, ({ one }) => ({
  node: one(canvasNodesTable, {
    fields: [aiDocumentsTable.node_id],
    references: [canvasNodesTable.id]
  })
}));

export const canvasEdgesRelations = relations(canvasEdgesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [canvasEdgesTable.project_id],
    references: [projectsTable.id]
  }),
  sourceNode: one(canvasNodesTable, {
    fields: [canvasEdgesTable.source_node_id],
    references: [canvasNodesTable.id],
    relationName: 'sourceNode'
  }),
  targetNode: one(canvasNodesTable, {
    fields: [canvasEdgesTable.target_node_id],
    references: [canvasNodesTable.id],
    relationName: 'targetNode'
  })
}));

export const projectSharesRelations = relations(projectSharesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [projectSharesTable.project_id],
    references: [projectsTable.id]
  }),
  sharedWithUser: one(usersTable, {
    fields: [projectSharesTable.shared_with_user_id],
    references: [usersTable.id],
    relationName: 'sharedWith'
  }),
  createdByUser: one(usersTable, {
    fields: [projectSharesTable.created_by],
    references: [usersTable.id],
    relationName: 'createdBy'
  })
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [commentsTable.project_id],
    references: [projectsTable.id]
  }),
  node: one(canvasNodesTable, {
    fields: [commentsTable.node_id],
    references: [canvasNodesTable.id]
  }),
  author: one(usersTable, {
    fields: [commentsTable.author_id],
    references: [usersTable.id]
  })
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  projects: projectsTable,
  canvasNodes: canvasNodesTable,
  aiDocuments: aiDocumentsTable,
  canvasEdges: canvasEdgesTable,
  projectShares: projectSharesTable,
  comments: commentsTable
};

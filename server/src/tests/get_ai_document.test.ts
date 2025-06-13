
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable, aiDocumentsTable } from '../db/schema';
import { getAiDocument } from '../handlers/get_ai_document';

describe('getAiDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get an AI document by node_id', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    });

    await db.insert(projectsTable).values({
      id: 'project-1',
      name: 'Test Project',
      owner_id: 'user-1'
    });

    await db.insert(canvasNodesTable).values({
      id: 'node-1',
      project_id: 'project-1',
      type: 'ai_document',
      title: 'AI Node',
      position_x: 0,
      position_y: 0,
      width: 200,
      height: 100,
      created_by: 'user-1'
    });

    await db.insert(aiDocumentsTable).values({
      id: 'doc-1',
      node_id: 'node-1',
      document_type: 'project_brief',
      prompt: 'Generate a project brief',
      generated_content: 'This is the generated content',
      status: 'completed'
    });

    const result = await getAiDocument({ node_id: 'node-1' });

    expect(result.id).toEqual('doc-1');
    expect(result.node_id).toEqual('node-1');
    expect(result.document_type).toEqual('project_brief');
    expect(result.prompt).toEqual('Generate a project brief');
    expect(result.generated_content).toEqual('This is the generated content');
    expect(result.status).toEqual('completed');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when AI document not found', async () => {
    await expect(getAiDocument({ node_id: 'non-existent' }))
      .rejects.toThrow(/AI document not found for node_id: non-existent/i);
  });

  it('should get AI document with different document types', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    });

    await db.insert(projectsTable).values({
      id: 'project-1',
      name: 'Test Project',
      owner_id: 'user-1'
    });

    await db.insert(canvasNodesTable).values({
      id: 'node-1',
      project_id: 'project-1',
      type: 'ai_document',
      title: 'AI Node',
      position_x: 0,
      position_y: 0,
      width: 200,
      height: 100,
      created_by: 'user-1'
    });

    await db.insert(aiDocumentsTable).values({
      id: 'doc-1',
      node_id: 'node-1',
      document_type: 'prd',
      prompt: 'Generate a PRD',
      generated_content: 'Product Requirements Document content',
      status: 'generating'
    });

    const result = await getAiDocument({ node_id: 'node-1' });

    expect(result.document_type).toEqual('prd');
    expect(result.status).toEqual('generating');
    expect(result.generated_content).toEqual('Product Requirements Document content');
  });
});

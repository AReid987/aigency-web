
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aiDocumentsTable, canvasNodesTable, projectsTable, usersTable } from '../db/schema';
import { type CreateAiDocumentInput } from '../schema';
import { createAiDocument } from '../handlers/create_ai_document';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Test data
const testUserId = randomUUID();
const testProjectId = randomUUID();
const testNodeId = randomUUID();

const testInput: CreateAiDocumentInput = {
  node_id: testNodeId,
  document_type: 'project_brief',
  prompt: 'Generate a comprehensive project brief for a new mobile app'
};

describe('createAiDocument', () => {
  beforeEach(async () => {
    await createDB();

    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null
      })
      .execute();

    // Create prerequisite project
    await db.insert(projectsTable)
      .values({
        id: testProjectId,
        name: 'Test Project',
        description: 'A test project',
        owner_id: testUserId
      })
      .execute();

    // Create prerequisite canvas node
    await db.insert(canvasNodesTable)
      .values({
        id: testNodeId,
        project_id: testProjectId,
        type: 'ai_document',
        title: 'Test AI Document Node',
        content: null,
        position_x: 100,
        position_y: 200,
        width: 300,
        height: 400,
        style_data: null,
        metadata: null,
        created_by: testUserId
      })
      .execute();
  });

  afterEach(resetDB);

  it('should create an AI document', async () => {
    const result = await createAiDocument(testInput);

    // Basic field validation
    expect(result.node_id).toEqual(testNodeId);
    expect(result.document_type).toEqual('project_brief');
    expect(result.prompt).toEqual('Generate a comprehensive project brief for a new mobile app');
    expect(result.generated_content).toEqual('');
    expect(result.status).toEqual('generating');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save AI document to database', async () => {
    const result = await createAiDocument(testInput);

    // Query using proper drizzle syntax
    const aiDocuments = await db.select()
      .from(aiDocumentsTable)
      .where(eq(aiDocumentsTable.id, result.id))
      .execute();

    expect(aiDocuments).toHaveLength(1);
    expect(aiDocuments[0].node_id).toEqual(testNodeId);
    expect(aiDocuments[0].document_type).toEqual('project_brief');
    expect(aiDocuments[0].prompt).toEqual(testInput.prompt);
    expect(aiDocuments[0].generated_content).toEqual('');
    expect(aiDocuments[0].status).toEqual('generating');
    expect(aiDocuments[0].created_at).toBeInstanceOf(Date);
    expect(aiDocuments[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create AI document with different document types', async () => {
    const prdInput: CreateAiDocumentInput = {
      node_id: testNodeId,
      document_type: 'prd',
      prompt: 'Generate a product requirements document'
    };

    const result = await createAiDocument(prdInput);

    expect(result.document_type).toEqual('prd');
    expect(result.prompt).toEqual('Generate a product requirements document');
    expect(result.status).toEqual('generating');
  });

  it('should throw error when node does not exist', async () => {
    const invalidInput: CreateAiDocumentInput = {
      node_id: 'non-existent-node-id',
      document_type: 'project_brief',
      prompt: 'Test prompt'
    };

    await expect(createAiDocument(invalidInput)).rejects.toThrow(/not found/i);
  });

  it('should enforce unique constraint on node_id', async () => {
    // Create first AI document
    await createAiDocument(testInput);

    // Attempt to create another AI document for the same node
    const duplicateInput: CreateAiDocumentInput = {
      node_id: testNodeId,
      document_type: 'prd',
      prompt: 'Another prompt'
    };

    await expect(createAiDocument(duplicateInput)).rejects.toThrow();
  });
});

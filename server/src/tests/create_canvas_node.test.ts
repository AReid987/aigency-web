
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { canvasNodesTable, usersTable, projectsTable } from '../db/schema';
import { type CreateCanvasNodeInput } from '../schema';
import { createCanvasNode } from '../handlers/create_canvas_node';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('createCanvasNode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;
  let projectId: string;

  beforeEach(async () => {
    // Create test user
    userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    }).execute();

    // Create test project
    projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      owner_id: userId
    }).execute();
  });

  const testInput: CreateCanvasNodeInput = {
    project_id: '', // Will be set in beforeEach
    type: 'text',
    title: 'Test Node',
    content: 'This is test content',
    position_x: 100.5,
    position_y: 200.75,
    width: 300,
    height: 150,
    style_data: { color: 'blue', border: '1px solid' },
    metadata: { version: 1, category: 'test' },
    created_by: '' // Will be set in beforeEach
  };

  beforeEach(() => {
    testInput.project_id = projectId;
    testInput.created_by = userId;
  });

  it('should create a canvas node', async () => {
    const result = await createCanvasNode(testInput);

    // Basic field validation
    expect(result.project_id).toEqual(projectId);
    expect(result.type).toEqual('text');
    expect(result.title).toEqual('Test Node');
    expect(result.content).toEqual('This is test content');
    expect(result.position_x).toEqual(100.5);
    expect(result.position_y).toEqual(200.75);
    expect(result.width).toEqual(300);
    expect(result.height).toEqual(150);
    expect(result.style_data).toEqual({ color: 'blue', border: '1px solid' });
    expect(result.metadata).toEqual({ version: 1, category: 'test' });
    expect(result.created_by).toEqual(userId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save canvas node to database', async () => {
    const result = await createCanvasNode(testInput);

    // Query using proper drizzle syntax
    const nodes = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.id, result.id))
      .execute();

    expect(nodes).toHaveLength(1);
    expect(nodes[0].title).toEqual('Test Node');
    expect(nodes[0].content).toEqual('This is test content');
    expect(nodes[0].position_x).toEqual(100.5);
    expect(nodes[0].position_y).toEqual(200.75);
    expect(nodes[0].width).toEqual(300);
    expect(nodes[0].height).toEqual(150);
    expect(nodes[0].type).toEqual('text');
    expect(nodes[0].project_id).toEqual(projectId);
    expect(nodes[0].created_by).toEqual(userId);
    expect(nodes[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle optional fields correctly', async () => {
    const minimalInput: CreateCanvasNodeInput = {
      project_id: projectId,
      type: 'ai_document',
      title: 'Minimal Node',
      position_x: 0,
      position_y: 0,
      width: 100,
      height: 100,
      created_by: userId
    };

    const result = await createCanvasNode(minimalInput);

    expect(result.title).toEqual('Minimal Node');
    expect(result.type).toEqual('ai_document');
    expect(result.content).toBeNull();
    expect(result.style_data).toBeNull();
    expect(result.metadata).toBeNull();
    expect(result.position_x).toEqual(0);
    expect(result.position_y).toEqual(0);
    expect(result.width).toEqual(100);
    expect(result.height).toEqual(100);
  });

  it('should handle different node types', async () => {
    const mediaNodeInput: CreateCanvasNodeInput = {
      project_id: projectId,
      type: 'media',
      title: 'Media Node',
      content: 'Media content',
      position_x: 50.25,
      position_y: 75.75,
      width: 200,
      height: 250,
      metadata: { mediaType: 'image', url: 'http://example.com/image.jpg' },
      created_by: userId
    };

    const result = await createCanvasNode(mediaNodeInput);

    expect(result.type).toEqual('media');
    expect(result.title).toEqual('Media Node');
    expect(result.metadata).toEqual({ mediaType: 'image', url: 'http://example.com/image.jpg' });
    expect(result.position_x).toEqual(50.25);
    expect(result.position_y).toEqual(75.75);
  });

  it('should fail when project does not exist', async () => {
    const invalidInput: CreateCanvasNodeInput = {
      ...testInput,
      project_id: 'nonexistent-project-id'
    };

    await expect(createCanvasNode(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should fail when user does not exist', async () => {
    const invalidInput: CreateCanvasNodeInput = {
      ...testInput,
      created_by: 'nonexistent-user-id'
    };

    await expect(createCanvasNode(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});

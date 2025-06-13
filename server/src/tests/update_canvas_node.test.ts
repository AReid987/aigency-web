
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable } from '../db/schema';
import { type UpdateCanvasNodeInput } from '../schema';
import { updateCanvasNode } from '../handlers/update_canvas_node';
import { eq } from 'drizzle-orm';

describe('updateCanvasNode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;
  let projectId: string;
  let nodeId: string;

  beforeEach(async () => {
    // Create test user
    userId = 'test-user-1';
    await db.insert(usersTable)
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User'
      })
      .execute();

    // Create test project
    projectId = 'test-project-1';
    await db.insert(projectsTable)
      .values({
        id: projectId,
        name: 'Test Project',
        owner_id: userId
      })
      .execute();

    // Create test canvas node
    nodeId = 'test-node-1';
    await db.insert(canvasNodesTable)
      .values({
        id: nodeId,
        project_id: projectId,
        type: 'text',
        title: 'Original Title',
        content: 'Original content',
        position_x: 100,
        position_y: 200,
        width: 300,
        height: 400,
        created_by: userId
      })
      .execute();
  });

  it('should update canvas node title', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      title: 'Updated Title'
    };

    const result = await updateCanvasNode(input);

    expect(result.id).toEqual(nodeId);
    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual('Original content'); // Should remain unchanged
    expect(result.position_x).toEqual(100);
    expect(result.position_y).toEqual(200);
    expect(result.width).toEqual(300);
    expect(result.height).toEqual(400);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update canvas node content', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      content: 'Updated content'
    };

    const result = await updateCanvasNode(input);

    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.content).toEqual('Updated content');
  });

  it('should update canvas node position', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      position_x: 150,
      position_y: 250
    };

    const result = await updateCanvasNode(input);

    expect(result.position_x).toEqual(150);
    expect(result.position_y).toEqual(250);
    expect(typeof result.position_x).toBe('number');
    expect(typeof result.position_y).toBe('number');
  });

  it('should update canvas node dimensions', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      width: 500,
      height: 600
    };

    const result = await updateCanvasNode(input);

    expect(result.width).toEqual(500);
    expect(result.height).toEqual(600);
    expect(typeof result.width).toBe('number');
    expect(typeof result.height).toBe('number');
  });

  it('should update canvas node style data', async () => {
    const styleData = { backgroundColor: '#ff0000', borderColor: '#000000' };
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      style_data: styleData
    };

    const result = await updateCanvasNode(input);

    expect(result.style_data).toEqual(styleData);
  });

  it('should update canvas node metadata', async () => {
    const metadata = { tags: ['important', 'draft'], priority: 'high' };
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      metadata: metadata
    };

    const result = await updateCanvasNode(input);

    expect(result.metadata).toEqual(metadata);
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      title: 'New Title',
      content: 'New content',
      position_x: 75,
      position_y: 125,
      width: 250,
      height: 350,
      style_data: { color: '#blue' },
      metadata: { version: 2 }
    };

    const result = await updateCanvasNode(input);

    expect(result.title).toEqual('New Title');
    expect(result.content).toEqual('New content');
    expect(result.position_x).toEqual(75);
    expect(result.position_y).toEqual(125);
    expect(result.width).toEqual(250);
    expect(result.height).toEqual(350);
    expect(result.style_data).toEqual({ color: '#blue' });
    expect(result.metadata).toEqual({ version: 2 });
  });

  it('should save updates to database', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      title: 'Database Test Title',
      content: 'Database test content'
    };

    await updateCanvasNode(input);

    // Verify changes were saved
    const nodes = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.id, nodeId))
      .execute();

    expect(nodes).toHaveLength(1);
    expect(nodes[0].title).toEqual('Database Test Title');
    expect(nodes[0].content).toEqual('Database test content');
    expect(nodes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent node', async () => {
    const input: UpdateCanvasNodeInput = {
      id: 'non-existent-node',
      title: 'Should Fail'
    };

    await expect(updateCanvasNode(input)).rejects.toThrow(/not found/i);
  });

  it('should handle null values correctly', async () => {
    const input: UpdateCanvasNodeInput = {
      id: nodeId,
      content: null,
      style_data: null,
      metadata: null
    };

    const result = await updateCanvasNode(input);

    expect(result.content).toBeNull();
    expect(result.style_data).toBeNull();
    expect(result.metadata).toBeNull();
  });
});

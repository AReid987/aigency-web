
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable, canvasEdgesTable } from '../db/schema';
import { type CreateCanvasEdgeInput } from '../schema';
import { createCanvasEdge } from '../handlers/create_canvas_edge';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('createCanvasEdge', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a canvas edge', async () => {
    // Create test user
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    });

    // Create test project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      owner_id: userId
    });

    // Create source node
    const sourceNodeId = nanoid();
    await db.insert(canvasNodesTable).values({
      id: sourceNodeId,
      project_id: projectId,
      type: 'text',
      title: 'Source Node',
      position_x: 0,
      position_y: 0,
      width: 100,
      height: 100,
      created_by: userId
    });

    // Create target node
    const targetNodeId = nanoid();
    await db.insert(canvasNodesTable).values({
      id: targetNodeId,
      project_id: projectId,
      type: 'text',
      title: 'Target Node',
      position_x: 200,
      position_y: 200,
      width: 100,
      height: 100,
      created_by: userId
    });

    const testInput: CreateCanvasEdgeInput = {
      project_id: projectId,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      style_data: { color: 'blue', width: 2 }
    };

    const result = await createCanvasEdge(testInput);

    // Basic field validation
    expect(result.project_id).toEqual(projectId);
    expect(result.source_node_id).toEqual(sourceNodeId);
    expect(result.target_node_id).toEqual(targetNodeId);
    expect(result.style_data).toEqual({ color: 'blue', width: 2 });
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save canvas edge to database', async () => {
    // Create test user
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    });

    // Create test project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      owner_id: userId
    });

    // Create source node
    const sourceNodeId = nanoid();
    await db.insert(canvasNodesTable).values({
      id: sourceNodeId,
      project_id: projectId,
      type: 'text',
      title: 'Source Node',
      position_x: 0,
      position_y: 0,
      width: 100,
      height: 100,
      created_by: userId
    });

    // Create target node
    const targetNodeId = nanoid();
    await db.insert(canvasNodesTable).values({
      id: targetNodeId,
      project_id: projectId,
      type: 'text',
      title: 'Target Node',
      position_x: 200,
      position_y: 200,
      width: 100,
      height: 100,
      created_by: userId
    });

    const testInput: CreateCanvasEdgeInput = {
      project_id: projectId,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      style_data: { color: 'red', thickness: 3 }
    };

    const result = await createCanvasEdge(testInput);

    // Query database to verify edge was saved
    const edges = await db.select()
      .from(canvasEdgesTable)
      .where(eq(canvasEdgesTable.id, result.id))
      .execute();

    expect(edges).toHaveLength(1);
    expect(edges[0].project_id).toEqual(projectId);
    expect(edges[0].source_node_id).toEqual(sourceNodeId);
    expect(edges[0].target_node_id).toEqual(targetNodeId);
    expect(edges[0].style_data).toEqual({ color: 'red', thickness: 3 });
    expect(edges[0].created_at).toBeInstanceOf(Date);
  });

  it('should create canvas edge with null style_data', async () => {
    // Create test user
    const userId = nanoid();
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    });

    // Create test project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      owner_id: userId
    });

    // Create source node
    const sourceNodeId = nanoid();
    await db.insert(canvasNodesTable).values({
      id: sourceNodeId,
      project_id: projectId,
      type: 'text',
      title: 'Source Node',
      position_x: 0,
      position_y: 0,
      width: 100,
      height: 100,
      created_by: userId
    });

    // Create target node
    const targetNodeId = nanoid();
    await db.insert(canvasNodesTable).values({
      id: targetNodeId,
      project_id: projectId,
      type: 'text',
      title: 'Target Node',
      position_x: 200,
      position_y: 200,
      width: 100,
      height: 100,
      created_by: userId
    });

    const testInput: CreateCanvasEdgeInput = {
      project_id: projectId,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId
    };

    const result = await createCanvasEdge(testInput);

    expect(result.style_data).toBeNull();
    expect(result.project_id).toEqual(projectId);
    expect(result.source_node_id).toEqual(sourceNodeId);
    expect(result.target_node_id).toEqual(targetNodeId);
  });

  it('should throw error when project does not exist', async () => {
    const testInput: CreateCanvasEdgeInput = {
      project_id: 'non-existent-project',
      source_node_id: 'non-existent-source',
      target_node_id: 'non-existent-target'
    };

    await expect(createCanvasEdge(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});

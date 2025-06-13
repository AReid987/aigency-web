
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable, canvasEdgesTable } from '../db/schema';
import { deleteCanvasEdge } from '../handlers/delete_canvas_edge';
import { eq } from 'drizzle-orm';

// Helper to create test data
const createTestData = async () => {
  // Create user
  const user = await db.insert(usersTable)
    .values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    })
    .returning()
    .execute();

  // Create project
  const project = await db.insert(projectsTable)
    .values({
      id: 'project-1',
      name: 'Test Project',
      owner_id: user[0].id
    })
    .returning()
    .execute();

  // Create source node
  const sourceNode = await db.insert(canvasNodesTable)
    .values({
      id: 'node-1',
      project_id: project[0].id,
      type: 'text',
      title: 'Source Node',
      position_x: 0,
      position_y: 0,
      width: 100,
      height: 100,
      created_by: user[0].id
    })
    .returning()
    .execute();

  // Create target node
  const targetNode = await db.insert(canvasNodesTable)
    .values({
      id: 'node-2',
      project_id: project[0].id,
      type: 'text',
      title: 'Target Node',
      position_x: 200,
      position_y: 200,
      width: 100,
      height: 100,
      created_by: user[0].id
    })
    .returning()
    .execute();

  // Create edge
  const edge = await db.insert(canvasEdgesTable)
    .values({
      id: 'edge-1',
      project_id: project[0].id,
      source_node_id: sourceNode[0].id,
      target_node_id: targetNode[0].id
    })
    .returning()
    .execute();

  return { user: user[0], project: project[0], sourceNode: sourceNode[0], targetNode: targetNode[0], edge: edge[0] };
};

describe('deleteCanvasEdge', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing canvas edge', async () => {
    const { edge } = await createTestData();

    const result = await deleteCanvasEdge({ id: edge.id });

    expect(result.success).toBe(true);

    // Verify edge is deleted from database
    const edges = await db.select()
      .from(canvasEdgesTable)
      .where(eq(canvasEdgesTable.id, edge.id))
      .execute();

    expect(edges).toHaveLength(0);
  });

  it('should return false for non-existent edge', async () => {
    const result = await deleteCanvasEdge({ id: 'non-existent-edge' });

    expect(result.success).toBe(false);
  });

  it('should not affect other edges when deleting one edge', async () => {
    const { project, sourceNode, targetNode } = await createTestData();

    // Create a second edge
    const secondEdge = await db.insert(canvasEdgesTable)
      .values({
        id: 'edge-2',
        project_id: project.id,
        source_node_id: sourceNode.id,
        target_node_id: targetNode.id
      })
      .returning()
      .execute();

    // Delete the first edge
    const result = await deleteCanvasEdge({ id: 'edge-1' });

    expect(result.success).toBe(true);

    // Verify first edge is deleted
    const firstEdge = await db.select()
      .from(canvasEdgesTable)
      .where(eq(canvasEdgesTable.id, 'edge-1'))
      .execute();

    expect(firstEdge).toHaveLength(0);

    // Verify second edge still exists
    const remainingEdges = await db.select()
      .from(canvasEdgesTable)
      .where(eq(canvasEdgesTable.id, secondEdge[0].id))
      .execute();

    expect(remainingEdges).toHaveLength(1);
    expect(remainingEdges[0].id).toBe(secondEdge[0].id);
  });
});

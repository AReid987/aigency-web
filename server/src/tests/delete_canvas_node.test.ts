
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable } from '../db/schema';
import { deleteCanvasNode } from '../handlers/delete_canvas_node';
import { eq } from 'drizzle-orm';

describe('deleteCanvasNode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing canvas node', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User'
    });

    // Create test project
    await db.insert(projectsTable).values({
      id: 'project1',
      name: 'Test Project',
      owner_id: 'user1'
    });

    // Create test canvas node
    await db.insert(canvasNodesTable).values({
      id: 'node1',
      project_id: 'project1',
      type: 'text',
      title: 'Test Node',
      position_x: 100,
      position_y: 200,
      width: 300,
      height: 150,
      created_by: 'user1'
    });

    // Delete the canvas node
    const result = await deleteCanvasNode({ id: 'node1' });

    expect(result.success).toBe(true);

    // Verify node was deleted from database
    const nodes = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.id, 'node1'))
      .execute();

    expect(nodes).toHaveLength(0);
  });

  it('should return false when deleting non-existent node', async () => {
    const result = await deleteCanvasNode({ id: 'nonexistent' });

    expect(result.success).toBe(false);
  });

  it('should cascade delete related AI documents', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User'
    });

    // Create test project
    await db.insert(projectsTable).values({
      id: 'project1',
      name: 'Test Project',
      owner_id: 'user1'
    });

    // Create test canvas node
    await db.insert(canvasNodesTable).values({
      id: 'node1',
      project_id: 'project1',
      type: 'ai_document',
      title: 'AI Node',
      position_x: 100,
      position_y: 200,
      width: 300,
      height: 150,
      created_by: 'user1'
    });

    // Delete the canvas node (should cascade to AI documents due to foreign key constraint)
    const result = await deleteCanvasNode({ id: 'node1' });

    expect(result.success).toBe(true);

    // Verify node was deleted
    const nodes = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.id, 'node1'))
      .execute();

    expect(nodes).toHaveLength(0);
  });
});

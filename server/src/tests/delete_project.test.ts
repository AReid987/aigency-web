
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, usersTable, canvasNodesTable, commentsTable } from '../db/schema';
import { type GetProjectInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const testUser = {
  id: randomUUID(),
  email: 'test@example.com',
  name: 'Test User'
};

const testProject = {
  id: randomUUID(),
  name: 'Test Project',
  description: 'A project for testing',
  owner_id: testUser.id
};

const testInput: GetProjectInput = {
  id: testProject.id
};

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing project', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values(testUser).execute();
    
    // Create test project
    await db.insert(projectsTable).values(testProject).execute();

    const result = await deleteProject(testInput);

    // Should return success
    expect(result.success).toBe(true);

    // Project should be deleted from database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, testProject.id))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should return false for non-existent project', async () => {
    const nonExistentInput: GetProjectInput = {
      id: randomUUID()
    };

    const result = await deleteProject(nonExistentInput);

    expect(result.success).toBe(false);
  });

  it('should cascade delete related records', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values(testUser).execute();
    
    // Create test project
    await db.insert(projectsTable).values(testProject).execute();

    // Create related canvas node
    const testNode = {
      id: randomUUID(),
      project_id: testProject.id,
      type: 'text' as const,
      title: 'Test Node',
      content: 'Test content',
      position_x: 100,
      position_y: 200,
      width: 300,
      height: 400,
      created_by: testUser.id
    };
    await db.insert(canvasNodesTable).values(testNode).execute();

    // Create related comment
    const testComment = {
      id: randomUUID(),
      project_id: testProject.id,
      node_id: testNode.id,
      content: 'Test comment',
      position_x: 50,
      position_y: 75,
      author_id: testUser.id
    };
    await db.insert(commentsTable).values(testComment).execute();

    // Delete project
    const result = await deleteProject(testInput);
    expect(result.success).toBe(true);

    // Project should be deleted
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, testProject.id))
      .execute();
    expect(projects).toHaveLength(0);

    // Related canvas node should be deleted due to cascade
    const nodes = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.project_id, testProject.id))
      .execute();
    expect(nodes).toHaveLength(0);

    // Related comment should be deleted due to cascade
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.project_id, testProject.id))
      .execute();
    expect(comments).toHaveLength(0);
  });
});

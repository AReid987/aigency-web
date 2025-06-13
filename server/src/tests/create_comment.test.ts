
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { commentsTable, usersTable, projectsTable, canvasNodesTable } from '../db/schema';
import { type CreateCommentInput, type User, type Project, type CanvasNode } from '../schema';
import { createComment } from '../handlers/create_comment';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Test data
const testUser: User = {
  id: nanoid(),
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  created_at: new Date(),
  updated_at: new Date()
};

const testProject: Project = {
  id: nanoid(),
  name: 'Test Project',
  description: 'A project for testing',
  owner_id: testUser.id,
  created_at: new Date(),
  updated_at: new Date()
};

const testNode: CanvasNode = {
  id: nanoid(),
  project_id: testProject.id,
  type: 'text',
  title: 'Test Node',
  content: 'Test content',
  position_x: 100,
  position_y: 200,
  width: 300,
  height: 150,
  style_data: null,
  metadata: null,
  created_by: testUser.id,
  created_at: new Date(),
  updated_at: new Date()
};

describe('createComment', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      avatar_url: testUser.avatar_url
    }).execute();

    await db.insert(projectsTable).values({
      id: testProject.id,
      name: testProject.name,
      description: testProject.description,
      owner_id: testProject.owner_id
    }).execute();

    await db.insert(canvasNodesTable).values({
      id: testNode.id,
      project_id: testNode.project_id,
      type: testNode.type,
      title: testNode.title,
      content: testNode.content,
      position_x: testNode.position_x,
      position_y: testNode.position_y,
      width: testNode.width,
      height: testNode.height,
      style_data: testNode.style_data,
      metadata: testNode.metadata,
      created_by: testNode.created_by
    }).execute();
  });

  afterEach(resetDB);

  it('should create a project comment without node association', async () => {
    const testInput: CreateCommentInput = {
      project_id: testProject.id,
      content: 'This is a project comment',
      author_id: testUser.id
    };

    const result = await createComment(testInput);

    // Basic field validation
    expect(result.project_id).toEqual(testProject.id);
    expect(result.node_id).toBeNull();
    expect(result.content).toEqual('This is a project comment');
    expect(result.position_x).toBeNull();
    expect(result.position_y).toBeNull();
    expect(result.author_id).toEqual(testUser.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a node comment with position coordinates', async () => {
    const testInput: CreateCommentInput = {
      project_id: testProject.id,
      node_id: testNode.id,
      content: 'This is a node comment',
      position_x: 50.5,
      position_y: 75.25,
      author_id: testUser.id
    };

    const result = await createComment(testInput);

    // Verify all fields including position coordinates
    expect(result.project_id).toEqual(testProject.id);
    expect(result.node_id).toEqual(testNode.id);
    expect(result.content).toEqual('This is a node comment');
    expect(result.position_x).toEqual(50.5);
    expect(result.position_y).toEqual(75.25);
    expect(result.author_id).toEqual(testUser.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save comment to database', async () => {
    const testInput: CreateCommentInput = {
      project_id: testProject.id,
      node_id: testNode.id,
      content: 'Database test comment',
      position_x: 100,
      position_y: 200,
      author_id: testUser.id
    };

    const result = await createComment(testInput);

    // Query database to verify persistence
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, result.id))
      .execute();

    expect(comments).toHaveLength(1);
    expect(comments[0].project_id).toEqual(testProject.id);
    expect(comments[0].node_id).toEqual(testNode.id);
    expect(comments[0].content).toEqual('Database test comment');
    expect(comments[0].position_x).toEqual(100);
    expect(comments[0].position_y).toEqual(200);
    expect(comments[0].author_id).toEqual(testUser.id);
    expect(comments[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle comment without position coordinates', async () => {
    const testInput: CreateCommentInput = {
      project_id: testProject.id,
      node_id: testNode.id,
      content: 'Comment without position',
      author_id: testUser.id
    };

    const result = await createComment(testInput);

    expect(result.position_x).toBeNull();
    expect(result.position_y).toBeNull();
    expect(result.content).toEqual('Comment without position');
  });

  it('should fail when project does not exist', async () => {
    const testInput: CreateCommentInput = {
      project_id: 'nonexistent-project',
      content: 'This should fail',
      author_id: testUser.id
    };

    await expect(createComment(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should fail when author does not exist', async () => {
    const testInput: CreateCommentInput = {
      project_id: testProject.id,
      content: 'This should fail',
      author_id: 'nonexistent-user'
    };

    await expect(createComment(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, canvasNodesTable, commentsTable } from '../db/schema';
import { getProjectComments } from '../handlers/get_project_comments';

const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null
};

const testProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project',
  owner_id: 'user-1'
};

const testNode = {
  id: 'node-1',
  project_id: 'project-1',
  type: 'text' as const,
  title: 'Test Node',
  content: 'Test content',
  position_x: 100,
  position_y: 200,
  width: 300,
  height: 150,
  style_data: null,
  metadata: null,
  created_by: 'user-1'
};

const testComment1 = {
  id: 'comment-1',
  project_id: 'project-1',
  node_id: 'node-1',
  content: 'This is a comment on the node',
  position_x: 150,
  position_y: 250,
  author_id: 'user-1'
};

const testComment2 = {
  id: 'comment-2',
  project_id: 'project-1',
  node_id: null,
  content: 'This is a general project comment',
  position_x: null,
  position_y: null,
  author_id: 'user-1'
};

describe('getProjectComments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return comments for a project', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(projectsTable).values(testProject).execute();
    await db.insert(canvasNodesTable).values(testNode).execute();
    await db.insert(commentsTable).values([testComment1, testComment2]).execute();

    const result = await getProjectComments({ project_id: 'project-1' });

    expect(result).toHaveLength(2);
    
    // Check first comment (with node and position)
    const nodeComment = result.find(c => c.id === 'comment-1');
    expect(nodeComment).toBeDefined();
    expect(nodeComment!.content).toEqual('This is a comment on the node');
    expect(nodeComment!.node_id).toEqual('node-1');
    expect(nodeComment!.position_x).toEqual(150);
    expect(nodeComment!.position_y).toEqual(250);
    expect(nodeComment!.author_id).toEqual('user-1');
    expect(nodeComment!.created_at).toBeInstanceOf(Date);
    expect(nodeComment!.updated_at).toBeInstanceOf(Date);

    // Check second comment (general project comment)
    const projectComment = result.find(c => c.id === 'comment-2');
    expect(projectComment).toBeDefined();
    expect(projectComment!.content).toEqual('This is a general project comment');
    expect(projectComment!.node_id).toBeNull();
    expect(projectComment!.position_x).toBeNull();
    expect(projectComment!.position_y).toBeNull();
    expect(projectComment!.author_id).toEqual('user-1');
  });

  it('should return empty array for project with no comments', async () => {
    // Create prerequisite data without comments
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(projectsTable).values(testProject).execute();

    const result = await getProjectComments({ project_id: 'project-1' });

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent project', async () => {
    const result = await getProjectComments({ project_id: 'non-existent' });

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return comments for the specified project', async () => {
    // Create another user and project
    const anotherUser = { ...testUser, id: 'user-2', email: 'user2@example.com' };
    const anotherProject = { ...testProject, id: 'project-2', name: 'Another Project', owner_id: 'user-2' };
    const anotherComment = {
      id: 'comment-3',
      project_id: 'project-2',
      node_id: null,
      content: 'Comment on another project',
      position_x: null,
      position_y: null,
      author_id: 'user-2'
    };

    // Create all data
    await db.insert(usersTable).values([testUser, anotherUser]).execute();
    await db.insert(projectsTable).values([testProject, anotherProject]).execute();
    await db.insert(canvasNodesTable).values(testNode).execute();
    await db.insert(commentsTable).values([testComment1, testComment2, anotherComment]).execute();

    const result = await getProjectComments({ project_id: 'project-1' });

    expect(result).toHaveLength(2);
    expect(result.every(c => c.project_id === 'project-1')).toBe(true);
    expect(result.find(c => c.id === 'comment-3')).toBeUndefined();
  });
});

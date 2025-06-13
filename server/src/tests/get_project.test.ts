
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable } from '../db/schema';
import { type GetProjectInput } from '../schema';
import { getProject } from '../handlers/get_project';

// Test data
const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null
};

const testProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A project for testing',
  owner_id: 'user-1'
};

describe('getProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get a project by id', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values(testUser)
      .execute();

    // Create test project
    await db.insert(projectsTable)
      .values(testProject)
      .execute();

    const input: GetProjectInput = {
      id: 'project-1'
    };

    const result = await getProject(input);

    // Verify project fields
    expect(result.id).toEqual('project-1');
    expect(result.name).toEqual('Test Project');
    expect(result.description).toEqual('A project for testing');
    expect(result.owner_id).toEqual('user-1');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when project not found', async () => {
    const input: GetProjectInput = {
      id: 'non-existent-project'
    };

    await expect(getProject(input)).rejects.toThrow(/not found/i);
  });

  it('should get project with null description', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values(testUser)
      .execute();

    // Create project with null description
    const projectWithNullDescription = {
      ...testProject,
      id: 'project-2',
      description: null
    };

    await db.insert(projectsTable)
      .values(projectWithNullDescription)
      .execute();

    const input: GetProjectInput = {
      id: 'project-2'
    };

    const result = await getProject(input);

    expect(result.id).toEqual('project-2');
    expect(result.name).toEqual('Test Project');
    expect(result.description).toBeNull();
    expect(result.owner_id).toEqual('user-1');
  });
});

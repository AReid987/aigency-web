
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, usersTable } from '../db/schema';
import { type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null
};

const testProject = {
  id: 'project-1',
  name: 'Original Project',
  description: 'Original description',
  owner_id: 'user-1'
};

describe('updateProject', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite user
    await db.insert(usersTable)
      .values(testUser)
      .execute();

    // Create test project
    await db.insert(projectsTable)
      .values(testProject)
      .execute();
  });

  afterEach(resetDB);

  it('should update project name only', async () => {
    const input: UpdateProjectInput = {
      id: 'project-1',
      name: 'Updated Project Name'
    };

    const result = await updateProject(input);

    expect(result.id).toEqual('project-1');
    expect(result.name).toEqual('Updated Project Name');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.owner_id).toEqual('user-1');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update project description only', async () => {
    const input: UpdateProjectInput = {
      id: 'project-1',
      description: 'Updated description'
    };

    const result = await updateProject(input);

    expect(result.id).toEqual('project-1');
    expect(result.name).toEqual('Original Project'); // Should remain unchanged
    expect(result.description).toEqual('Updated description');
    expect(result.owner_id).toEqual('user-1');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update both name and description', async () => {
    const input: UpdateProjectInput = {
      id: 'project-1',
      name: 'Completely New Name',
      description: 'Completely new description'
    };

    const result = await updateProject(input);

    expect(result.name).toEqual('Completely New Name');
    expect(result.description).toEqual('Completely new description');
    expect(result.owner_id).toEqual('user-1');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should set description to null when provided', async () => {
    const input: UpdateProjectInput = {
      id: 'project-1',
      description: null
    };

    const result = await updateProject(input);

    expect(result.description).toBeNull();
    expect(result.name).toEqual('Original Project'); // Should remain unchanged
  });

  it('should save changes to database', async () => {
    const input: UpdateProjectInput = {
      id: 'project-1',
      name: 'Database Test Name',
      description: 'Database test description'
    };

    await updateProject(input);

    // Verify changes were persisted
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, 'project-1'))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('Database Test Name');
    expect(projects[0].description).toEqual('Database test description');
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    // Get original timestamp
    const originalProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, 'project-1'))
      .execute();

    const originalUpdatedAt = originalProject[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateProjectInput = {
      id: 'project-1',
      name: 'Timestamp Test'
    };

    const result = await updateProject(input);

    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent project', async () => {
    const input: UpdateProjectInput = {
      id: 'non-existent-id',
      name: 'This should fail'
    };

    await expect(updateProject(input)).rejects.toThrow(/not found/i);
  });
});

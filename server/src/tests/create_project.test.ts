
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, usersTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    // Create test user first
    const testUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User'
    };

    await db.insert(usersTable)
      .values(testUser)
      .execute();

    const testInput: CreateProjectInput = {
      name: 'Test Project',
      description: 'A project for testing',
      owner_id: testUser.id
    };

    const result = await createProject(testInput);

    expect(result.name).toEqual('Test Project');
    expect(result.description).toEqual('A project for testing');
    expect(result.owner_id).toEqual(testUser.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project without description', async () => {
    // Create test user first
    const testUser = {
      id: 'test-user-2',
      email: 'test2@example.com',
      name: 'Test User 2'
    };

    await db.insert(usersTable)
      .values(testUser)
      .execute();

    const testInput: CreateProjectInput = {
      name: 'Minimal Project',
      owner_id: testUser.id
    };

    const result = await createProject(testInput);

    expect(result.name).toEqual('Minimal Project');
    expect(result.description).toBeNull();
    expect(result.owner_id).toEqual(testUser.id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    // Create test user first
    const testUser = {
      id: 'test-user-3',
      email: 'test3@example.com',
      name: 'Test User 3'
    };

    await db.insert(usersTable)
      .values(testUser)
      .execute();

    const testInput: CreateProjectInput = {
      name: 'Database Test Project',
      description: 'Testing database persistence',
      owner_id: testUser.id
    };

    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('Database Test Project');
    expect(projects[0].description).toEqual('Testing database persistence');
    expect(projects[0].owner_id).toEqual(testUser.id);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should fail when owner does not exist', async () => {
    const testInput: CreateProjectInput = {
      name: 'Invalid Project',
      description: 'This should fail',
      owner_id: 'non-existent-user'
    };

    await expect(createProject(testInput)).rejects.toThrow(/foreign key constraint/i);
  });
});

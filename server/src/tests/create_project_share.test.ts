
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, projectSharesTable } from '../db/schema';
import { type CreateProjectShareInput } from '../schema';
import { createProjectShare } from '../handlers/create_project_share';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('createProjectShare', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project share', async () => {
    // Create prerequisite users
    const ownerId = nanoid();
    const sharedUserId = nanoid();
    
    await db.insert(usersTable).values([
      {
        id: ownerId,
        email: 'owner@example.com',
        name: 'Owner User'
      },
      {
        id: sharedUserId,
        email: 'shared@example.com',
        name: 'Shared User'
      }
    ]).execute();

    // Create prerequisite project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      description: 'A project for testing',
      owner_id: ownerId
    }).execute();

    const testInput: CreateProjectShareInput = {
      project_id: projectId,
      shared_with_user_id: sharedUserId,
      permission: 'edit',
      created_by: ownerId
    };

    const result = await createProjectShare(testInput);

    // Basic field validation
    expect(result.project_id).toEqual(projectId);
    expect(result.shared_with_user_id).toEqual(sharedUserId);
    expect(result.permission).toEqual('edit');
    expect(result.created_by).toEqual(ownerId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save project share to database', async () => {
    // Create prerequisite users
    const ownerId = nanoid();
    const sharedUserId = nanoid();
    
    await db.insert(usersTable).values([
      {
        id: ownerId,
        email: 'owner@example.com',
        name: 'Owner User'
      },
      {
        id: sharedUserId,
        email: 'shared@example.com',
        name: 'Shared User'
      }
    ]).execute();

    // Create prerequisite project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      description: 'A project for testing',
      owner_id: ownerId
    }).execute();

    const testInput: CreateProjectShareInput = {
      project_id: projectId,
      shared_with_user_id: sharedUserId,
      permission: 'view',
      created_by: ownerId
    };

    const result = await createProjectShare(testInput);

    // Query to verify the project share was saved
    const projectShares = await db.select()
      .from(projectSharesTable)
      .where(eq(projectSharesTable.id, result.id))
      .execute();

    expect(projectShares).toHaveLength(1);
    expect(projectShares[0].project_id).toEqual(projectId);
    expect(projectShares[0].shared_with_user_id).toEqual(sharedUserId);
    expect(projectShares[0].permission).toEqual('view');
    expect(projectShares[0].created_by).toEqual(ownerId);
    expect(projectShares[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different permission types', async () => {
    // Create prerequisite users
    const ownerId = nanoid();
    const sharedUserId = nanoid();
    
    await db.insert(usersTable).values([
      {
        id: ownerId,
        email: 'owner@example.com',
        name: 'Owner User'
      },
      {
        id: sharedUserId,
        email: 'shared@example.com',
        name: 'Shared User'
      }
    ]).execute();

    // Create prerequisite project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      description: 'A project for testing',
      owner_id: ownerId
    }).execute();

    const permissions = ['view', 'comment', 'edit'] as const;

    for (const permission of permissions) {
      const testInput: CreateProjectShareInput = {
        project_id: projectId,
        shared_with_user_id: sharedUserId,
        permission,
        created_by: ownerId
      };

      const result = await createProjectShare(testInput);
      expect(result.permission).toEqual(permission);
    }
  });

  it('should throw error for non-existent project', async () => {
    // Create prerequisite users
    const ownerId = nanoid();
    const sharedUserId = nanoid();
    
    await db.insert(usersTable).values([
      {
        id: ownerId,
        email: 'owner@example.com',
        name: 'Owner User'
      },
      {
        id: sharedUserId,
        email: 'shared@example.com',
        name: 'Shared User'
      }
    ]).execute();

    const testInput: CreateProjectShareInput = {
      project_id: 'non-existent-project',
      shared_with_user_id: sharedUserId,
      permission: 'view',
      created_by: ownerId
    };

    await expect(createProjectShare(testInput)).rejects.toThrow(/foreign key constraint/i);
  });

  it('should throw error for non-existent user', async () => {
    // Create prerequisite owner
    const ownerId = nanoid();
    
    await db.insert(usersTable).values({
      id: ownerId,
      email: 'owner@example.com',
      name: 'Owner User'
    }).execute();

    // Create prerequisite project
    const projectId = nanoid();
    await db.insert(projectsTable).values({
      id: projectId,
      name: 'Test Project',
      description: 'A project for testing',
      owner_id: ownerId
    }).execute();

    const testInput: CreateProjectShareInput = {
      project_id: projectId,
      shared_with_user_id: 'non-existent-user',
      permission: 'view',
      created_by: ownerId
    };

    await expect(createProjectShare(testInput)).rejects.toThrow(/foreign key constraint/i);
  });
});

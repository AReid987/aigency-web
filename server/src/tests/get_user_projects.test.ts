
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, projectSharesTable } from '../db/schema';
import { type GetUserProjectsInput } from '../schema';
import { getUserProjects } from '../handlers/get_user_projects';

describe('getUserProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return projects owned by user', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'owner@test.com',
      name: 'Project Owner'
    });

    // Create owned project
    await db.insert(projectsTable).values({
      id: 'project-1',
      name: 'My Project',
      description: 'A project I own',
      owner_id: 'user-1'
    });

    const input: GetUserProjectsInput = {
      user_id: 'user-1'
    };

    const result = await getUserProjects(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('project-1');
    expect(result[0].name).toEqual('My Project');
    expect(result[0].description).toEqual('A project I own');
    expect(result[0].owner_id).toEqual('user-1');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return projects shared with user', async () => {
    // Create test users
    await db.insert(usersTable).values([
      {
        id: 'owner-1',
        email: 'owner@test.com',
        name: 'Project Owner'
      },
      {
        id: 'user-1',
        email: 'user@test.com',
        name: 'Regular User'
      }
    ]);

    // Create project owned by someone else
    await db.insert(projectsTable).values({
      id: 'shared-project-1',
      name: 'Shared Project',
      description: 'A project shared with me',
      owner_id: 'owner-1'
    });

    // Share project with user
    await db.insert(projectSharesTable).values({
      id: 'share-1',
      project_id: 'shared-project-1',
      shared_with_user_id: 'user-1',
      permission: 'view',
      created_by: 'owner-1'
    });

    const input: GetUserProjectsInput = {
      user_id: 'user-1'
    };

    const result = await getUserProjects(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('shared-project-1');
    expect(result[0].name).toEqual('Shared Project');
    expect(result[0].owner_id).toEqual('owner-1');
  });

  it('should return both owned and shared projects', async () => {
    // Create test users
    await db.insert(usersTable).values([
      {
        id: 'user-1',
        email: 'user@test.com',
        name: 'Test User'
      },
      {
        id: 'owner-2',
        email: 'owner2@test.com',
        name: 'Other Owner'
      }
    ]);

    // Create owned project
    await db.insert(projectsTable).values({
      id: 'owned-project',
      name: 'My Own Project',
      description: 'Project I own',
      owner_id: 'user-1'
    });

    // Create project owned by someone else
    await db.insert(projectsTable).values({
      id: 'shared-project',
      name: 'Shared Project',
      description: 'Project shared with me',
      owner_id: 'owner-2'
    });

    // Share the second project
    await db.insert(projectSharesTable).values({
      id: 'share-1',
      project_id: 'shared-project',
      shared_with_user_id: 'user-1',
      permission: 'edit',
      created_by: 'owner-2'
    });

    const input: GetUserProjectsInput = {
      user_id: 'user-1'
    };

    const result = await getUserProjects(input);

    expect(result).toHaveLength(2);
    
    const ownedProject = result.find(p => p.id === 'owned-project');
    const sharedProject = result.find(p => p.id === 'shared-project');
    
    expect(ownedProject).toBeDefined();
    expect(ownedProject!.name).toEqual('My Own Project');
    expect(ownedProject!.owner_id).toEqual('user-1');
    
    expect(sharedProject).toBeDefined();
    expect(sharedProject!.name).toEqual('Shared Project');
    expect(sharedProject!.owner_id).toEqual('owner-2');
  });

  it('should return empty array when user has no projects', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User'
    });

    const input: GetUserProjectsInput = {
      user_id: 'user-1'
    };

    const result = await getUserProjects(input);

    expect(result).toHaveLength(0);
  });

  it('should handle projects with null descriptions', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User'
    });

    // Create project with null description
    await db.insert(projectsTable).values({
      id: 'project-1',
      name: 'Project Without Description',
      description: null,
      owner_id: 'user-1'
    });

    const input: GetUserProjectsInput = {
      user_id: 'user-1'
    };

    const result = await getUserProjects(input);

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
  });
});

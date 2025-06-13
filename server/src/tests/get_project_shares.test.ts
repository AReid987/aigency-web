
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, projectSharesTable } from '../db/schema';
import { getProjectShares } from '../handlers/get_project_shares';

describe('getProjectShares', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return project shares for a project', async () => {
    // Create test users
    const testUsers = [
      {
        id: 'user-1',
        email: 'owner@example.com',
        name: 'Project Owner',
        avatar_url: null
      },
      {
        id: 'user-2',
        email: 'viewer@example.com',
        name: 'Viewer User',
        avatar_url: null
      },
      {
        id: 'user-3',
        email: 'editor@example.com',
        name: 'Editor User',
        avatar_url: null
      }
    ];

    await db.insert(usersTable).values(testUsers).execute();

    // Create test project
    const testProject = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      owner_id: 'user-1'
    };

    await db.insert(projectsTable).values(testProject).execute();

    // Create test project shares
    const testShares = [
      {
        id: 'share-1',
        project_id: 'project-1',
        shared_with_user_id: 'user-2',
        permission: 'view' as const,
        created_by: 'user-1'
      },
      {
        id: 'share-2',
        project_id: 'project-1',
        shared_with_user_id: 'user-3',
        permission: 'edit' as const,
        created_by: 'user-1'
      }
    ];

    await db.insert(projectSharesTable).values(testShares).execute();

    // Test the handler
    const result = await getProjectShares({ project_id: 'project-1' });

    expect(result).toHaveLength(2);
    
    // Check first share
    const viewShare = result.find(s => s.id === 'share-1');
    expect(viewShare).toBeDefined();
    expect(viewShare!.project_id).toEqual('project-1');
    expect(viewShare!.shared_with_user_id).toEqual('user-2');
    expect(viewShare!.permission).toEqual('view');
    expect(viewShare!.created_by).toEqual('user-1');
    expect(viewShare!.created_at).toBeInstanceOf(Date);

    // Check second share
    const editShare = result.find(s => s.id === 'share-2');
    expect(editShare).toBeDefined();
    expect(editShare!.project_id).toEqual('project-1');
    expect(editShare!.shared_with_user_id).toEqual('user-3');
    expect(editShare!.permission).toEqual('edit');
    expect(editShare!.created_by).toEqual('user-1');
    expect(editShare!.created_at).toBeInstanceOf(Date);
  });

  it('should return empty array for project with no shares', async () => {
    // Create test user and project without shares
    const testUser = {
      id: 'user-1',
      email: 'owner@example.com',
      name: 'Project Owner',
      avatar_url: null
    };

    await db.insert(usersTable).values(testUser).execute();

    const testProject = {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      owner_id: 'user-1'
    };

    await db.insert(projectsTable).values(testProject).execute();

    const result = await getProjectShares({ project_id: 'project-1' });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return empty array for non-existent project', async () => {
    const result = await getProjectShares({ project_id: 'non-existent-project' });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should only return shares for the specified project', async () => {
    // Create test users
    const testUsers = [
      {
        id: 'user-1',
        email: 'owner@example.com',
        name: 'Project Owner',
        avatar_url: null
      },
      {
        id: 'user-2',
        email: 'viewer@example.com',
        name: 'Viewer User',
        avatar_url: null
      }
    ];

    await db.insert(usersTable).values(testUsers).execute();

    // Create two test projects
    const testProjects = [
      {
        id: 'project-1',
        name: 'Test Project 1',
        description: 'First test project',
        owner_id: 'user-1'
      },
      {
        id: 'project-2',
        name: 'Test Project 2',
        description: 'Second test project',
        owner_id: 'user-1'
      }
    ];

    await db.insert(projectsTable).values(testProjects).execute();

    // Create shares for both projects
    const testShares = [
      {
        id: 'share-1',
        project_id: 'project-1',
        shared_with_user_id: 'user-2',
        permission: 'view' as const,
        created_by: 'user-1'
      },
      {
        id: 'share-2',
        project_id: 'project-2',
        shared_with_user_id: 'user-2',
        permission: 'edit' as const,
        created_by: 'user-1'
      }
    ];

    await db.insert(projectSharesTable).values(testShares).execute();

    // Test that we only get shares for project-1
    const result = await getProjectShares({ project_id: 'project-1' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('share-1');
    expect(result[0].project_id).toEqual('project-1');
    expect(result[0].permission).toEqual('view');
  });
});

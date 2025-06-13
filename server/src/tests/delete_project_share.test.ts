
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, projectSharesTable } from '../db/schema';
import { deleteProjectShare } from '../handlers/delete_project_share';
import { eq } from 'drizzle-orm';

describe('deleteProjectShare', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a project share', async () => {
    // Create test users
    const [owner, sharedUser] = await db.insert(usersTable)
      .values([
        {
          id: 'owner-1',
          email: 'owner@test.com',
          name: 'Owner User'
        },
        {
          id: 'shared-1',
          email: 'shared@test.com',
          name: 'Shared User'
        }
      ])
      .returning()
      .execute();

    // Create test project
    const [project] = await db.insert(projectsTable)
      .values({
        id: 'project-1',
        name: 'Test Project',
        owner_id: owner.id
      })
      .returning()
      .execute();

    // Create test project share
    const [projectShare] = await db.insert(projectSharesTable)
      .values({
        id: 'share-1',
        project_id: project.id,
        shared_with_user_id: sharedUser.id,
        permission: 'view',
        created_by: owner.id
      })
      .returning()
      .execute();

    // Delete the project share
    const result = await deleteProjectShare({ id: projectShare.id });

    expect(result.success).toBe(true);

    // Verify the project share was deleted
    const shares = await db.select()
      .from(projectSharesTable)
      .where(eq(projectSharesTable.id, projectShare.id))
      .execute();

    expect(shares).toHaveLength(0);
  });

  it('should return success even for non-existent project share', async () => {
    const result = await deleteProjectShare({ id: 'non-existent-id' });

    expect(result.success).toBe(true);
  });

  it('should not affect other project shares', async () => {
    // Create test users
    const [owner, sharedUser1, sharedUser2] = await db.insert(usersTable)
      .values([
        {
          id: 'owner-1',
          email: 'owner@test.com',
          name: 'Owner User'
        },
        {
          id: 'shared-1',
          email: 'shared1@test.com',
          name: 'Shared User 1'
        },
        {
          id: 'shared-2',
          email: 'shared2@test.com',
          name: 'Shared User 2'
        }
      ])
      .returning()
      .execute();

    // Create test project
    const [project] = await db.insert(projectsTable)
      .values({
        id: 'project-1',
        name: 'Test Project',
        owner_id: owner.id
      })
      .returning()
      .execute();

    // Create multiple project shares
    const [share1, share2] = await db.insert(projectSharesTable)
      .values([
        {
          id: 'share-1',
          project_id: project.id,
          shared_with_user_id: sharedUser1.id,
          permission: 'view',
          created_by: owner.id
        },
        {
          id: 'share-2',
          project_id: project.id,
          shared_with_user_id: sharedUser2.id,
          permission: 'edit',
          created_by: owner.id
        }
      ])
      .returning()
      .execute();

    // Delete only the first share
    const result = await deleteProjectShare({ id: share1.id });

    expect(result.success).toBe(true);

    // Verify only the first share was deleted
    const remainingShares = await db.select()
      .from(projectSharesTable)
      .execute();

    expect(remainingShares).toHaveLength(1);
    expect(remainingShares[0].id).toEqual(share2.id);
    expect(remainingShares[0].shared_with_user_id).toEqual(sharedUser2.id);
    expect(remainingShares[0].permission).toEqual('edit');
  });
});

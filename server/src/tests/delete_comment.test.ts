
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable, commentsTable } from '../db/schema';
import { deleteComment } from '../handlers/delete_comment';
import { eq } from 'drizzle-orm';

describe('deleteComment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a comment', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    });

    await db.insert(projectsTable).values({
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      owner_id: 'user-1'
    });

    await db.insert(commentsTable).values({
      id: 'comment-1',
      project_id: 'project-1',
      content: 'Test comment',
      author_id: 'user-1'
    });

    const result = await deleteComment({ id: 'comment-1' });

    expect(result.success).toBe(true);

    // Verify comment was deleted
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, 'comment-1'))
      .execute();

    expect(comments).toHaveLength(0);
  });

  it('should return success even if comment does not exist', async () => {
    const result = await deleteComment({ id: 'non-existent-comment' });

    expect(result.success).toBe(true);
  });

  it('should delete only the specified comment', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User'
    });

    await db.insert(projectsTable).values({
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      owner_id: 'user-1'
    });

    // Create multiple comments
    await db.insert(commentsTable).values([
      {
        id: 'comment-1',
        project_id: 'project-1',
        content: 'First comment',
        author_id: 'user-1'
      },
      {
        id: 'comment-2',
        project_id: 'project-1',
        content: 'Second comment',
        author_id: 'user-1'
      }
    ]);

    await deleteComment({ id: 'comment-1' });

    // Verify only comment-1 was deleted
    const deletedComment = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, 'comment-1'))
      .execute();

    const remainingComment = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, 'comment-2'))
      .execute();

    expect(deletedComment).toHaveLength(0);
    expect(remainingComment).toHaveLength(1);
    expect(remainingComment[0].content).toEqual('Second comment');
  });
});

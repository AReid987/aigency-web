
import { db } from '../db';
import { commentsTable } from '../db/schema';
import { type Comment } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectComments = async (input: { project_id: string }): Promise<Comment[]> => {
  try {
    const results = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.project_id, input.project_id))
      .execute();

    return results.map(comment => ({
      ...comment,
      position_x: comment.position_x !== null ? comment.position_x : null,
      position_y: comment.position_y !== null ? comment.position_y : null
    }));
  } catch (error) {
    console.error('Failed to get project comments:', error);
    throw error;
  }
};


import { db } from '../db';
import { commentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteComment = async (input: { id: string }): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(commentsTable)
      .where(eq(commentsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Comment deletion failed:', error);
    throw error;
  }
};

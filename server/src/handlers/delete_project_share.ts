
import { db } from '../db';
import { projectSharesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteProjectShare = async (input: { id: string }): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(projectSharesTable)
      .where(eq(projectSharesTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Project share deletion failed:', error);
    throw error;
  }
};

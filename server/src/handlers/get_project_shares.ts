
import { db } from '../db';
import { projectSharesTable } from '../db/schema';
import { type ProjectShare } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectShares = async (input: { project_id: string }): Promise<ProjectShare[]> => {
  try {
    const results = await db.select()
      .from(projectSharesTable)
      .where(eq(projectSharesTable.project_id, input.project_id))
      .execute();

    return results;
  } catch (error) {
    console.error('Get project shares failed:', error);
    throw error;
  }
};

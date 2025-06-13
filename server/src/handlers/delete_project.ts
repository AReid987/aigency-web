
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProject = async (input: GetProjectInput): Promise<{ success: boolean }> => {
  try {
    // Delete the project - cascading deletes will handle related records
    const result = await db.delete(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    // Return success status based on whether any rows were affected
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
};


import { db } from '../db';
import { canvasNodesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteCanvasNode = async (input: { id: string }): Promise<{ success: boolean }> => {
  try {
    // Delete the canvas node by ID
    const result = await db.delete(canvasNodesTable)
      .where(eq(canvasNodesTable.id, input.id))
      .execute();

    // Return success status based on whether any rows were affected
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Canvas node deletion failed:', error);
    throw error;
  }
};


import { db } from '../db';
import { canvasEdgesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteCanvasEdge = async (input: { id: string }): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(canvasEdgesTable)
      .where(eq(canvasEdgesTable.id, input.id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Canvas edge deletion failed:', error);
    throw error;
  }
};


import { db } from '../db';
import { aiDocumentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type AiDocument } from '../schema';

export const getAiDocument = async (input: { node_id: string }): Promise<AiDocument> => {
  try {
    const results = await db.select()
      .from(aiDocumentsTable)
      .where(eq(aiDocumentsTable.node_id, input.node_id))
      .execute();

    if (results.length === 0) {
      throw new Error(`AI document not found for node_id: ${input.node_id}`);
    }

    return results[0];
  } catch (error) {
    console.error('Get AI document failed:', error);
    throw error;
  }
};

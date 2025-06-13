
import { db } from '../db';
import { aiDocumentsTable, canvasNodesTable } from '../db/schema';
import { type CreateAiDocumentInput, type AiDocument } from '../schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const createAiDocument = async (input: CreateAiDocumentInput): Promise<AiDocument> => {
  try {
    // Verify the referenced canvas node exists
    const existingNode = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.id, input.node_id))
      .execute();

    if (existingNode.length === 0) {
      throw new Error(`Canvas node with id ${input.node_id} not found`);
    }

    // Insert AI document record
    const result = await db.insert(aiDocumentsTable)
      .values({
        id: randomUUID(),
        node_id: input.node_id,
        document_type: input.document_type,
        prompt: input.prompt,
        generated_content: '', // Initialize with empty string
        status: 'generating' as const // Use default status
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('AI document creation failed:', error);
    throw error;
  }
};

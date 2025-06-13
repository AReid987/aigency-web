
import { db } from '../db';
import { canvasEdgesTable } from '../db/schema';
import { type CreateCanvasEdgeInput, type CanvasEdge } from '../schema';
import { nanoid } from 'nanoid';

export const createCanvasEdge = async (input: CreateCanvasEdgeInput): Promise<CanvasEdge> => {
  try {
    // Insert canvas edge record
    const result = await db.insert(canvasEdgesTable)
      .values({
        id: nanoid(),
        project_id: input.project_id,
        source_node_id: input.source_node_id,
        target_node_id: input.target_node_id,
        style_data: input.style_data || null
      })
      .returning()
      .execute();

    const edge = result[0];
    return {
      ...edge,
      style_data: edge.style_data as Record<string, any> | null
    };
  } catch (error) {
    console.error('Canvas edge creation failed:', error);
    throw error;
  }
};

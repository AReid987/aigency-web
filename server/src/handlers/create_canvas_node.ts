
import { db } from '../db';
import { canvasNodesTable } from '../db/schema';
import { type CreateCanvasNodeInput, type CanvasNode } from '../schema';
import { nanoid } from 'nanoid';

export const createCanvasNode = async (input: CreateCanvasNodeInput): Promise<CanvasNode> => {
  try {
    // Insert canvas node record
    const result = await db.insert(canvasNodesTable)
      .values({
        id: nanoid(),
        project_id: input.project_id,
        type: input.type,
        title: input.title,
        content: input.content || null,
        position_x: input.position_x,
        position_y: input.position_y,
        width: input.width,
        height: input.height,
        style_data: input.style_data || null,
        metadata: input.metadata || null,
        created_by: input.created_by
      })
      .returning()
      .execute();

    const node = result[0];
    
    // Cast jsonb fields to proper types
    return {
      ...node,
      style_data: node.style_data as Record<string, any> | null,
      metadata: node.metadata as Record<string, any> | null
    };
  } catch (error) {
    console.error('Canvas node creation failed:', error);
    throw error;
  }
};

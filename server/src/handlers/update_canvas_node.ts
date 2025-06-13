
import { db } from '../db';
import { canvasNodesTable } from '../db/schema';
import { type UpdateCanvasNodeInput, type CanvasNode } from '../schema';
import { eq } from 'drizzle-orm';

export const updateCanvasNode = async (input: UpdateCanvasNodeInput): Promise<CanvasNode> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof canvasNodesTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    if (input.position_x !== undefined) {
      updateData.position_x = input.position_x;
    }
    if (input.position_y !== undefined) {
      updateData.position_y = input.position_y;
    }
    if (input.width !== undefined) {
      updateData.width = input.width;
    }
    if (input.height !== undefined) {
      updateData.height = input.height;
    }
    if (input.style_data !== undefined) {
      updateData.style_data = input.style_data;
    }
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata;
    }

    // Update the canvas node
    const result = await db.update(canvasNodesTable)
      .set(updateData)
      .where(eq(canvasNodesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Canvas node with id ${input.id} not found`);
    }

    // Convert real fields back to numbers and handle type conversion
    const node = result[0];
    return {
      ...node,
      position_x: Number(node.position_x),
      position_y: Number(node.position_y),
      width: Number(node.width),
      height: Number(node.height),
      style_data: node.style_data as Record<string, any> | null,
      metadata: node.metadata as Record<string, any> | null
    };
  } catch (error) {
    console.error('Canvas node update failed:', error);
    throw error;
  }
};

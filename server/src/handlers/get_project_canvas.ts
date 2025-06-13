
import { db } from '../db';
import { canvasNodesTable, canvasEdgesTable } from '../db/schema';
import { type GetProjectCanvasInput, type CanvasNode, type CanvasEdge } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectCanvas = async (input: GetProjectCanvasInput): Promise<{
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}> => {
  try {
    // Get all nodes for the project
    const nodes = await db.select()
      .from(canvasNodesTable)
      .where(eq(canvasNodesTable.project_id, input.project_id))
      .execute();

    // Get all edges for the project
    const edges = await db.select()
      .from(canvasEdgesTable)
      .where(eq(canvasEdgesTable.project_id, input.project_id))
      .execute();

    // Convert JSON fields to proper types for nodes
    const convertedNodes: CanvasNode[] = nodes.map(node => ({
      ...node,
      style_data: node.style_data as Record<string, any> | null,
      metadata: node.metadata as Record<string, any> | null
    }));

    // Convert JSON fields to proper types for edges
    const convertedEdges: CanvasEdge[] = edges.map(edge => ({
      ...edge,
      style_data: edge.style_data as Record<string, any> | null
    }));

    return {
      nodes: convertedNodes,
      edges: convertedEdges
    };
  } catch (error) {
    console.error('Get project canvas failed:', error);
    throw error;
  }
};

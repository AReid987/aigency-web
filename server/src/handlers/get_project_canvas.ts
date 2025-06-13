
import { type GetProjectCanvasInput, type CanvasNode, type CanvasEdge } from '../schema';

export declare function getProjectCanvas(input: GetProjectCanvasInput): Promise<{
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}>;

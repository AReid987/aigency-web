
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { CanvasNode } from '@/components/CanvasNode';
import { CanvasToolbar } from '@/components/CanvasToolbar';
import { AddNodeDialog } from '@/components/AddNodeDialog';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, MessageSquare, Zap } from 'lucide-react';
import type { Project, User, CanvasNode as CanvasNodeType, CreateCanvasNodeInput } from '../../../server/src/schema';

interface ProjectCanvasProps {
  project: Project;
  user: User;
}

export function ProjectCanvas({ project }: ProjectCanvasProps) {
  const [nodes, setNodes] = useState<CanvasNodeType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);

  const loadCanvas = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getProjectCanvas.query({ project_id: project.id });
      setNodes(result.nodes);
      // Note: edges will be used for future canvas connections feature
    } catch (error) {
      console.error('Failed to load canvas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadCanvas();
  }, [loadCanvas]);

  const handleCreateNode = async (nodeData: Omit<CreateCanvasNodeInput, 'project_id' | 'created_by'>) => {
    try {
      const newNode = await trpc.createCanvasNode.mutate({
        ...nodeData,
        project_id: project.id
      });
      setNodes((prev: CanvasNodeType[]) => [...prev, newNode]);
      setIsAddNodeDialogOpen(false);
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const handleUpdateNode = async (nodeId: string, updates: Partial<CanvasNodeType>) => {
    try {
      const updatedNode = await trpc.updateCanvasNode.mutate({
        id: nodeId,
        ...updates
      });
      setNodes((prev: CanvasNodeType[]) =>
        prev.map((node: CanvasNodeType) => node.id === nodeId ? updatedNode : node)
      );
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await trpc.deleteCanvasNode.mutate({ id: nodeId });
      setNodes((prev: CanvasNodeType[]) =>
        prev.filter((node: CanvasNodeType) => node.id !== nodeId)
      );
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Canvas Toolbar */}
      <CanvasToolbar
        canvasScale={canvasScale}
        onScaleChange={setCanvasScale}
        onResetView={() => {
          setCanvasPosition({ x: 0, y: 0 });
          setCanvasScale(1);
        }}
      />

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-3 z-10">
        <Button
          onClick={() => setIsAddNodeDialogOpen(true)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg rounded-full w-14 h-14"
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-white shadow-lg rounded-full w-14 h-14"
        >
          <Sparkles className="h-6 w-6 text-purple-600" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-white shadow-lg rounded-full w-14 h-14"
        >
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </Button>
      </div>

      {/* Canvas Area */}
      <div 
        className="w-full h-full bg-gray-50 relative overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * canvasScale}px ${20 * canvasScale}px`,
          backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`
        }}
      >
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Ready to create? ✨
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first node to the canvas. You can create text notes, 
                AI documents, or brainstorm ideas together.
              </p>
              <Button 
                onClick={() => setIsAddNodeDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Node
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="relative"
            style={{
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasScale})`,
              transformOrigin: '0 0'
            }}
          >
            {nodes.map((node: CanvasNodeType) => (
              <CanvasNode
                key={node.id}
                node={node}
                onUpdate={(updates) => handleUpdateNode(node.id, updates)}
                onDelete={() => handleDeleteNode(node.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Node Dialog */}
      <AddNodeDialog
        open={isAddNodeDialogOpen}
        onOpenChange={setIsAddNodeDialogOpen}
        onCreateNode={handleCreateNode}
      />
    </div>
  );
}

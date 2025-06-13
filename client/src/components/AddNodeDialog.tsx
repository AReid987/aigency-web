
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Image, 
  Settings 
} from 'lucide-react';
import type { NodeType, CreateCanvasNodeInput } from '../../../server/src/schema';

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNode: (data: Omit<CreateCanvasNodeInput, 'project_id' | 'created_by'>) => Promise<void>;
}

interface NodeTypeOption {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTypes: NodeTypeOption[] = [
  {
    type: 'text',
    label: 'Text Note',
    description: 'Simple text note or documentation',
    icon: <FileText className="h-6 w-6" />,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    type: 'ai_document',
    label: 'AI Document',
    description: 'Generate structured documents with AI',
    icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  },
  {
    type: 'ai_brainstorm',
    label: 'AI Brainstorm',
    description: 'Brainstorm ideas with AI assistance',
    icon: <MessageSquare className="h-6 w-6 text-green-600" />,
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    type: 'media',
    label: 'Media',
    description: 'Images, videos, or other media files',
    icon: <Image className="h-6 w-6 text-orange-600" />,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  },
  {
    type: 'custom',
    label: 'Custom',
    description: 'Custom node with flexible content',
    icon: <Settings className="h-6 w-6 text-gray-600" />,
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  }
];

export function AddNodeDialog({ open, onOpenChange, onCreateNode }: AddNodeDialogProps) {
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !formData.title.trim()) return;

    setIsLoading(true);
    try {
      await onCreateNode({
        type: selectedType,
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        position_x: Math.random() * 400 + 100, // Random position for now
        position_y: Math.random() * 400 + 100,
        width: 300,
        height: 200,
        style_data: null,
        metadata: null
      });
      
      // Reset form
      setSelectedType(null);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Failed to create node:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedType(null);
      setFormData({ title: '', content: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Node</DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="space-y-4">
            <p className="text-gray-600">Choose the type of node you want to create:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nodeTypes.map((nodeType) => (
                <Card
                  key={nodeType.type}
                  className={`cursor-pointer transition-colors ${nodeType.color}`}
                  onClick={() => setSelectedType(nodeType.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {nodeType.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{nodeType.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {nodeType.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              {nodeTypes.find(nt => nt.type === selectedType)?.icon}
              <span className="font-medium">
                {nodeTypes.find(nt => nt.type === selectedType)?.label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
                className="ml-auto"
              >
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter node title"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData(prev => ({ ...prev, content: e.target.value }))
                }
                placeholder="Enter content (optional)"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? 'Creating...' : 'Create Node'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

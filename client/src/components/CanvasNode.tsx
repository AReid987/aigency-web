
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Image, 
  Settings 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { CanvasNode as CanvasNodeType } from '../../../server/src/schema';

interface CanvasNodeProps {
  node: CanvasNodeType;
  onUpdate: (updates: Partial<CanvasNodeType>) => void;
  onDelete: () => void;
}

export function CanvasNode({ node, onUpdate, onDelete }: CanvasNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editContent, setEditContent] = useState(node.content || '');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const getNodeIcon = () => {
    switch (node.type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'ai_document':
        return <Sparkles className="h-4 w-4" />;
      case 'ai_brainstorm':
        return <MessageSquare className="h-4 w-4" />;
      case 'media':
        return <Image className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getNodeColor = () => {
    switch (node.type) {
      case 'text':
        return 'bg-blue-50 border-blue-200';
      case 'ai_document':
        return 'bg-purple-50 border-purple-200';
      case 'ai_brainstorm':
        return 'bg-green-50 border-green-200';
      case 'media':
        return 'bg-orange-50 border-orange-200';
      case 'custom':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() !== node.title || editContent !== (node.content || '')) {
      onUpdate({
        title: editTitle.trim(),
        content: editContent || null
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(node.title);
    setEditContent(node.content || '');
    setIsEditing(false);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    onUpdate({
      position_x: newX,
      position_y: newY
    });
  }, [isDragging, dragStart.x, dragStart.y, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position_x,
      y: e.clientY - node.position_y
    });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={nodeRef}
      className="absolute"
      style={{
        left: node.position_x,
        top: node.position_y,
        width: node.width,
        minHeight: node.height
      }}
    >
      <Card 
        className={`${getNodeColor()} shadow-lg hover:shadow-xl transition-shadow ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getNodeIcon()}
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                  className="text-sm font-medium h-auto py-1 px-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
              ) : (
                <CardTitle className="text-sm font-medium">{node.title}</CardTitle>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {node.type.replace('_', ' ')}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                placeholder="Add content..."
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <div className="flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {node.content || (
                <span className="text-gray-400 italic">Click to add content...</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

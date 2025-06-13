
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';

interface CanvasToolbarProps {
  canvasScale: number;
  onScaleChange: (scale: number) => void;
  onResetView: () => void;
}

export function CanvasToolbar({ canvasScale, onScaleChange, onResetView }: CanvasToolbarProps) {
  const handleZoomIn = () => {
    const newScale = Math.min(canvasScale * 1.2, 3);
    onScaleChange(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(canvasScale / 1.2, 0.1);
    onScaleChange(newScale);
  };

  const handleFitToScreen = () => {
    onScaleChange(1);
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border flex items-center px-2 py-1 z-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="h-8 w-8 p-0"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <span className="text-sm font-medium px-2 min-w-[60px] text-center">
        {Math.round(canvasScale * 100)}%
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="h-8 w-8 p-0"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-2 h-6" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFitToScreen}
        className="h-8 w-8 p-0"
      >
        <Maximize className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onResetView}
        className="h-8 w-8 p-0"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

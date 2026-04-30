import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UploadedImage } from '../types';
import { Move, Maximize2, Trash2 } from 'lucide-react';

interface Props {
  image: UploadedImage;
  parentRef: React.RefObject<HTMLDivElement>;
  onUpdate: (id: string, data: Partial<UploadedImage>) => void;
  onRemove: (id: string) => void;
  isEditing: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const DraggableResizable: React.FC<Props> = ({ 
    image, 
    parentRef, 
    onUpdate, 
    onRemove, 
    isEditing,
    isSelected,
    onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const initialDims = useRef({ w: 0, h: 0, x: 0, y: 0 });

  // Generate unique filter ID for this instance
  const filterId = useMemo(() => `stamp-filter-${image.id}`, [image.id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelect) onSelect(image.id);
    
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialDims.current = { w: image.width, h: image.height, x: image.x, y: image.y };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialDims.current = { w: image.width, h: image.height, x: image.x, y: image.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!parentRef.current) return;

      if (isDragging) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        onUpdate(image.id, { 
          x: initialDims.current.x + deltaX, 
          y: initialDims.current.y + deltaY 
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x;
        const newWidth = Math.max(30, initialDims.current.w + deltaX);
        const aspectRatio = initialDims.current.w / initialDims.current.h;
        const newHeight = newWidth / aspectRatio;
        onUpdate(image.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, image.id, onUpdate, parentRef]);

  // Dynamic filter parameters based on noise (0 to 1)
  const noiseVal = image.noise ?? 0;
  const turbFreq = 0.5 + noiseVal * 0.4; // High frequency for grain
  const displaceScale = noiseVal * 4;    // Edges roughness
  const matrixVal = 1 - (noiseVal * 0.4); // For light skipping effect

  return (
    <div
      className={`absolute group z-50 ${isSelected ? 'ring-2 ring-blue-500 rounded' : ''}`}
      style={{
        left: image.x,
        top: image.y,
        width: image.width,
        height: image.height,
        cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none'
      }}
      onClick={(e) => {
          if (isEditing && onSelect) {
              e.stopPropagation();
              onSelect(image.id);
          }
      }}
    >
      {/* Dynamic SVG Filter for realistic Stamp effect */}
      {image.type === 'stamp' && (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            {/* Grain/Ink skipping texture */}
            <feTurbulence type="fractalNoise" baseFrequency={turbFreq} numOctaves="3" result="noise" />
            <feColorMatrix in="noise" type="matrix" values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${matrixVal} 0`} result="noise-masked" />
            <feComposite in="SourceGraphic" in2="noise-masked" operator="out" result="textured-ink" />
            
            {/* Rough edges / ink bleed */}
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="distort-noise" />
            <feDisplacementMap in="textured-ink" in2="distort-noise" scale={displaceScale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}

      <div 
        className="w-full h-full relative"
        onMouseDown={handleMouseDown}
      >
        <img 
          src={image.src} 
          alt="Uploaded" 
          crossOrigin="anonymous"
          className="w-full h-full object-contain pointer-events-none select-none transition-all"
          style={{
              opacity: image.opacity ?? 0.85,
              filter: image.type === 'stamp' && noiseVal > 0 ? `url(#${filterId})` : 'none',
          }}
        />
        
        {isEditing && (
          <div className={`resize-controls absolute inset-0 border-2 border-blue-400 border-dashed rounded transition-opacity ${isDragging || isResizing || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded-full shadow-lg pointer-events-none">
                <Move size={16} />
            </div>

            <div
              className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center rounded-tl shadow-lg z-10"
              onMouseDown={handleResizeMouseDown}
            >
              <Maximize2 size={12} className="text-white transform rotate-90" />
            </div>

            <div
                className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 cursor-pointer flex items-center justify-center rounded-full shadow-lg z-10 hover:bg-red-600"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(image.id);
                }}
            >
                <Trash2 size={12} className="text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableResizable;
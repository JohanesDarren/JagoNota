import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, TextElement, ImageElement, ShapeElement, TableElement } from '../types';
import { Move, Maximize2, Trash2 } from 'lucide-react';

interface Props {
  element: CanvasElement;
  isSelected?: boolean;
  isLocked?: boolean;
  onSelect?: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onRemove: (id: string) => void;
}

export default function ElementNode({ element, isSelected, isLocked, onSelect, onUpdate, onRemove }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [tableResizeType, setTableResizeType] = useState<'col' | 'row' | null>(null);
  const [tableResizeIndex, setTableResizeIndex] = useState<number>(-1);

  const nodeRef = useRef<HTMLDivElement>(null);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const initialDims = useRef({ w: 0, h: 0, x: 0, y: 0 });
  const tableResizeStartDims = useRef<{ left: number, right: number, all: number[] }>({ left: 0, right: 0, all: [] });
  const tableResizeDragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) onSelect(element.id);
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialDims.current = { w: element.width, h: element.height, x: element.x, y: element.y };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialDims.current = { w: element.width, h: element.height, x: element.x, y: element.y };
  };

  const handleColResizeStart = (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      const tb = element as TableElement;
      
      const totalFlex = tb.columns.reduce((sum, c) => sum + (c.width || 1), 0);
      const pixelWidths = tb.columns.map(c => ((c.width || 1) / totalFlex) * element.width);

      tableResizeStartDims.current = {
          left: pixelWidths[colIndex],
          right: pixelWidths[colIndex + 1],
          all: pixelWidths
      };
      tableResizeDragStart.current = { x: e.clientX, y: e.clientY };
      setTableResizeType('col');
      setTableResizeIndex(colIndex);
  };

  const handleRowResizeStart = (e: React.MouseEvent, rowIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      const tb = element as TableElement;
      const currentHeights = tb.rowHeights || new Array(tb.rows.length).fill(1);
      const totalFlex = currentHeights.reduce((sum, h) => sum + (h || 1), 0);
      
      const pixelHeights = currentHeights.map(h => ((h || 1) / totalFlex) * element.height);

      tableResizeStartDims.current = {
          left: pixelHeights[rowIndex],  
          right: pixelHeights[rowIndex + 1], 
          all: pixelHeights
      };
      tableResizeDragStart.current = { x: e.clientX, y: e.clientY };
      setTableResizeType('row');
      setTableResizeIndex(rowIndex);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        onUpdate(element.id, { 
          x: initialDims.current.x + deltaX, 
          y: initialDims.current.y + deltaY 
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        
        let newWidth = Math.max(20, initialDims.current.w + deltaX);
        let newHeight = Math.max(20, initialDims.current.h + deltaY);
        
        if (element.type === 'image') {
            const aspectRatio = initialDims.current.w / initialDims.current.h;
            newHeight = newWidth / aspectRatio;
        }

        onUpdate(element.id, { width: newWidth, height: newHeight });
      } else if (tableResizeType === 'col') {
          const deltaX = e.clientX - tableResizeDragStart.current.x;
          const dims = tableResizeStartDims.current;
          const newLeft = Math.max(10, Math.round(dims.left + deltaX));
          const newRight = Math.max(10, Math.round(dims.right - deltaX));
          
          const newWidths = [...dims.all];
          newWidths[tableResizeIndex] = newLeft;
          newWidths[tableResizeIndex + 1] = newRight;
          
          const tb = element as TableElement;
          const newCols = tb.columns.map((c, i) => ({ ...c, width: newWidths[i] }));
          onUpdate(element.id, { columns: newCols });
      } else if (tableResizeType === 'row') {
          const deltaY = e.clientY - tableResizeDragStart.current.y;
          const dims = tableResizeStartDims.current;
          const newTop = Math.max(5, Math.round(dims.left + deltaY)); 
          const newBottom = Math.max(5, Math.round(dims.right - deltaY)); 
          
          const newHeights = [...dims.all];
          newHeights[tableResizeIndex] = newTop;
          newHeights[tableResizeIndex + 1] = newBottom;
          
          onUpdate(element.id, { rowHeights: newHeights });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setTableResizeType(null);
    };

    if (isDragging || isResizing || tableResizeType) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, tableResizeType, tableResizeIndex, element.id, element.type, onUpdate, element]);

  const renderContent = () => {
      switch (element.type) {
          case 'text':
              const t = element as TextElement;
              const isCustomFont = t.fontFamily.startsWith('custom-font-');
              const roughness = t.roughness ?? 0;
              const textShadow = roughness > 0 ? `0 ${Math.min(roughness * 0.2, 1.2)}px ${Math.min(roughness * 0.8, 2.4)}px rgba(0,0,0,0.15)` : undefined;
              const filter = roughness > 0 ? `blur(${Math.min(roughness * 0.08, 1.2)}px)` : undefined;
              return (
                  <div className={isCustomFont ? t.fontFamily : ''} style={{
                      width: '100%', height: '100%',
                      fontFamily: !isCustomFont ? t.fontFamily : undefined,
                      fontSize: t.fontSize,
                      color: t.color,
                      textAlign: t.textAlign,
                      fontWeight: t.fontWeight,
                      fontStyle: t.fontStyle,
                      textDecoration: t.textDecoration,
                      lineHeight: t.lineSpacing !== undefined ? t.lineSpacing : undefined,
                      letterSpacing: t.letterSpacing !== undefined ? `${t.letterSpacing}px` : undefined,
                      filter,
                      textShadow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: t.textAlign === 'center' ? 'center' : t.textAlign === 'right' ? 'flex-end' : 'flex-start'
                  }}>
                      {t.content}
                  </div>
              );
          case 'image':
              const i = element as ImageElement;
              const filterId = `stamp-filter-${i.id}`;
              const noiseVal = i.noise ?? 0;
              const turbFreq = 0.5 + noiseVal * 0.4;
              const matrixVal = 1 - (noiseVal * 0.4);
              
              return (
                  <>
                      {noiseVal > 0 && (
                          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                              <filter id={filterId}>
                                  <feTurbulence type="fractalNoise" baseFrequency={turbFreq} numOctaves="3" result="noise" />
                                  <feColorMatrix in="noise" type="matrix" values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${matrixVal} 0`} result="noise-masked" />
                                  <feComposite in="SourceGraphic" in2="noise-masked" operator="out" result="stamped" />
                              </filter>
                          </svg>
                      )}
                      <img 
                          src={i.src} 
                          alt="" 
                          className="w-full h-full object-contain pointer-events-none select-none transition-all" 
                          style={{ filter: noiseVal > 0 ? `url(#${filterId})` : 'none' }}
                      />
                  </>
              );
          case 'shape':
              const s = element as ShapeElement;
              if (s.shapeType === 'line') {
                  return (
                      <div className="w-full h-full flex items-center justify-center">
                          <div style={{ width: '100%', height: s.strokeWidth || 1, backgroundColor: s.strokeColor || '#000' }}></div>
                      </div>
                  );
              }
              return (
                  <div style={{
                      width: '100%', height: '100%',
                      backgroundColor: s.fillColor,
                      border: s.strokeWidth ? `${s.strokeWidth}px solid ${s.strokeColor}` : 'none'
                  }}></div>
              );
          case 'table':
              const tb = element as TableElement;
              return (
                  <div style={{ width: '100%', height: '100%', border: `1px solid ${tb.borderColor || '#000'}`, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
                      <div style={{ display: 'flex', backgroundColor: tb.headerBgColor || '#f9fafb', borderBottom: `1px solid ${tb.borderColor || '#000'}`, fontWeight: 'bold' }}>
                          {tb.columns.map((c, i) => (
                              <div key={c.id} style={{ position: 'relative', flex: c.width, padding: '4px 8px', borderRight: i < tb.columns.length - 1 ? `1px solid ${tb.borderColor || '#000'}` : 'none', color: tb.textColor || '#000', fontSize: tb.fontSize || 12, fontFamily: tb.fontFamily }}>
                                  {c.header}
                                  {isSelected && !isLocked && i < tb.columns.length - 1 && (
                                      <div 
                                          className="absolute top-0 right-0 h-full w-2 -mr-1 cursor-col-resize z-20 hover:bg-[#1800ad]/30 touch-none pointer-events-auto"
                                          onMouseDown={(e) => handleColResizeStart(e, i)}
                                      />
                                  )}
                              </div>
                          ))}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {tb.rows.map((r, ri) => (
                              <div key={ri} style={{ position: 'relative', display: 'flex', flex: tb.rowHeights?.[ri] ?? 1, borderBottom: ri < tb.rows.length - 1 ? `1px solid ${tb.borderColor || '#000'}` : 'none' }}>
                                  {r.map((cell, ci) => (
                                      <div key={ci} style={{ position: 'relative', flex: tb.columns[ci].width, padding: '4px 8px', borderRight: ci < tb.columns.length - 1 ? `1px solid ${tb.borderColor || '#000'}` : 'none', color: tb.textColor || '#000', fontSize: tb.fontSize || 12, fontFamily: tb.fontFamily }}>
                                          {cell}
                                          {isSelected && !isLocked && ci < tb.columns.length - 1 && (
                                              <div 
                                                  className="absolute top-0 right-0 h-full w-2 -mr-1 cursor-col-resize z-20 hover:bg-[#1800ad]/30 touch-none pointer-events-auto"
                                                  onMouseDown={(e) => handleColResizeStart(e, ci)}
                                              />
                                          )}
                                      </div>
                                  ))}
                                  {isSelected && !isLocked && ri < tb.rows.length - 1 && (
                                      <div 
                                          className="absolute bottom-0 left-0 w-full h-2 -mb-1 cursor-row-resize z-20 hover:bg-[#1800ad]/30 touch-none pointer-events-auto"
                                          onMouseDown={(e) => handleRowResizeStart(e, ri)}
                                      />
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'signature':
              const sig = element as any;
              return (
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', opacity: sig.opacity ?? 1 }}>
                      {sig.roughness > 0 && (
                          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                              <defs>
                                  <filter id={`rough-${element.id}`}>
                                      <feTurbulence type="fractalNoise" baseFrequency={0.05 + (sig.roughness * 0.1)} numOctaves="2" result="noise" />
                                      <feDisplacementMap in="SourceGraphic" in2="noise" scale={sig.roughness * 5} xChannelSelector="R" yChannelSelector="G" />
                                  </filter>
                              </defs>
                          </svg>
                      )}
                      <img 
                          src={sig.src} 
                          alt="Signature"
                          style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain', 
                              filter: sig.roughness > 0 ? `url(#rough-${element.id})` : 'none'
                          }} 
                      />
                  </div>
              );
      }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute group z-50 ${isSelected ? 'ring-2 ring-[#1800ad]/50 outline outline-1 outline-[#1800ad]' : 'hover:outline hover:outline-1 hover:outline-gray-300'}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        opacity: element.opacity ?? 1,
        zIndex: element.zIndex ?? 1,
        cursor: isLocked ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(element.id);
      }}
    >
      <div className="w-full h-full relative pointer-events-none">
          {renderContent()}
      </div>

      {isSelected && (
          <div className="absolute inset-0 pointer-events-none">
              {!isLocked && (
                <>
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-[#1800ad] cursor-se-resize rounded-full z-10 pointer-events-auto hover:scale-125 transition-transform"
                    onMouseDown={handleResizeMouseDown}
                  />
                  <div
                      className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 cursor-pointer flex items-center justify-center rounded-full shadow-lg z-10 hover:bg-red-600 pointer-events-auto"
                      onClick={(e) => {
                          e.stopPropagation();
                          onRemove(element.id);
                      }}
                  >
                      <Trash2 size={12} className="text-white" />
                  </div>
                </>
              )}
          </div>
      )}
    </div>
  );
}

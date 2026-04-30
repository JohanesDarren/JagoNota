import React, { useState, useRef } from 'react';
import { DocumentTemplate, CanvasElement } from '../types';
import SidebarPropertyPanel from './SidebarPropertyPanel';
import ElementNode from './ElementNode';

interface Props {
  template: DocumentTemplate;
  onUpdateTemplate: (t: DocumentTemplate) => void;
  onBack: () => void;
}

export default function CanvasEditor({ template, onUpdateTemplate, onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    onUpdateTemplate({
      ...template,
      elements: template.elements.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el)
    });
  };

  const removeElement = (id: string) => {
    onUpdateTemplate({
      ...template,
      elements: template.elements.filter(el => el.id !== id)
    });
    if (selectedId === id) setSelectedId(null);
  };

  const addElement = (newEl: CanvasElement) => {
      onUpdateTemplate({
          ...template,
          elements: [...template.elements, newEl]
      });
      setSelectedId(newEl.id);
  };

  const selectedElement = template.elements.find(e => e.id === selectedId) || null;

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
       <SidebarPropertyPanel 
           selectedElement={selectedElement} 
           onUpdateElement={updateElement}
           template={template}
           onUpdateTemplate={onUpdateTemplate}
           onBack={onBack}
           onAddElement={addElement}
       />
       
       <div 
           className="flex-1 overflow-auto p-10 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200 dark:bg-gray-800"
           onClick={() => setSelectedId(null)}
       >
            <div 
                ref={canvasRef}
                className="relative bg-white shadow-2xl transition-all origin-center ring-1 ring-gray-300 dark:ring-gray-700 overflow-hidden"
                style={{ 
                    width: template.width, 
                    height: template.height, 
                    backgroundColor: template.backgroundColor 
                }}
            >
                {template.elements.map(el => (
                    <ElementNode 
                        key={el.id}
                        element={el}
                        isSelected={selectedId === el.id}
                        onSelect={(id) => setSelectedId(id)}
                        onUpdate={(id, updates) => updateElement(id, updates)}
                        onRemove={removeElement}
                    />
                ))}
            </div>
       </div>
    </div>
  );
}

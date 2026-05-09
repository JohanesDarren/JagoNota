import React, { useState, useRef } from 'react';
import { DocumentTemplate, CanvasElement } from '../types';
import SidebarPropertyPanel from './SidebarPropertyPanel';
import ElementNode from './ElementNode';
import { supabase } from '../utils';

interface Props {
  template: DocumentTemplate;
  onUpdateTemplate: (t: DocumentTemplate) => void;
  onBack: () => void;
}

export default function CanvasEditor({ template, onUpdateTemplate, onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  React.useEffect(() => {
      const checkLockStatus = async () => {
          const { data, error } = await supabase
              .from('projects')
              .select('id')
              .eq('template_id', template.id)
              .limit(1);
          
          if (!error && data && data.length > 0) {
              setIsLocked(true);
          }
      };
      if (template.db_id) {
          checkLockStatus();
      }
  }, [template.id, template.db_id]);

  const handleSaveTemplate = async () => {
      try {
          setSaving(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
              alert('Anda harus login terlebih dahulu!');
              return;
          }

          if (template.db_id && template.user_id === user.id) {
              // Update existing (only if user owns the template)
              const { error } = await supabase.from('templates').update({
                  name: template.name.trim(),
                  layout_data: template
              }).eq('id', template.db_id);
              
              if (error) throw error;
              alert('Template berhasil diperbarui!');
          } else {
              // Insert as new (for new templates or when editing app templates)
              // Keep the same template.id to avoid duplicate in App state
              const newTemplate = { ...template, user_id: user.id };
              delete newTemplate.db_id;
              delete newTemplate.is_default;

              const { data, error } = await supabase.from('templates').insert([
                  {
                      name: newTemplate.name.trim(),
                      layout_data: newTemplate,
                      user_id: user.id
                  }
              ]).select();

              if (error) throw error;
              if (data && data.length > 0) {
                  // Only update db_id so App state finds the same template by its id
                  onUpdateTemplate({ ...newTemplate, db_id: data[0].id });
              }
              alert(template.db_id ? 'Template aplikasi berhasil disimpan sebagai template baru!' : 'Template berhasil disimpan!');
          }
      } catch (err: any) {
          alert('Gagal menyimpan template: ' + err.message);
      } finally {
          setSaving(false);
      }
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    if (isLocked) return;
    onUpdateTemplate({
      ...template,
      elements: template.elements.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el)
    });
  };

  const removeElement = (id: string) => {
    if (isLocked) return;
    onUpdateTemplate({
      ...template,
      elements: template.elements.filter(el => el.id !== id)
    });
    if (selectedId === id) setSelectedId(null);
  };

  const addElement = (newEl: CanvasElement) => {
      if (isLocked) return;
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
           onSave={handleSaveTemplate}
           isSaving={saving}
           isLocked={isLocked}
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
                {isLocked && (
                  <div className="absolute inset-x-0 top-0 z-20 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 border-b border-red-200 dark:border-red-700 text-sm font-semibold text-center">
                    Template terkunci karena sudah digunakan dalam project.
                  </div>
                )}
                {template.elements.map(el => (
                    <ElementNode 
                        key={el.id}
                        element={el}
                        isSelected={selectedId === el.id}
                        isLocked={isLocked}
                        onSelect={(id) => !isLocked && setSelectedId(id)}
                        onUpdate={(id, updates) => updateElement(id, updates)}
                        onRemove={removeElement}
                    />
                ))}
            </div>
       </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FolderKanban, Plus, X, Edit3, Trash2 } from 'lucide-react';
import { DocumentProject, DocumentTemplate } from '../types';

interface Props {
  projects: DocumentProject[];
  templates: DocumentTemplate[];
  onStartProject: (project: DocumentProject, isNew?: boolean) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onBack: () => void;
}

const StaticPreview = ({ template }: { template: DocumentTemplate }) => {
    // scale to fit into the 160px height container with some padding
    const scale = Math.min(130 / template.width, 130 / template.height);
    
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: template.width,
            height: template.height,
            backgroundColor: template.backgroundColor,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
            overflow: 'hidden',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            {template.elements.map(el => {
                let content = null;
                if (el.type === 'text') {
                    content = <div style={{ fontSize: el.fontSize, fontWeight: el.fontWeight, color: el.color, textAlign: el.textAlign, width: '100%', height: '100%', overflow: 'hidden' }}>{el.content}</div>;
                } else if (el.type === 'shape') {
                    if (el.shapeType === 'rectangle') {
                        content = <div style={{ width: '100%', height: '100%', backgroundColor: el.fillColor, border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none' }}></div>;
                    } else if (el.shapeType === 'circle') {
                        content = <div style={{ width: '100%', height: '100%', backgroundColor: el.fillColor, border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none', borderRadius: '50%' }}></div>;
                    } else if (el.shapeType === 'line') {
                        content = <div style={{ width: '100%', height: '100%', borderTop: `${el.strokeWidth}px solid ${el.strokeColor}` }}></div>;
                    }
                } else if (el.type === 'image') {
                    content = <img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
                } else if (el.type === 'table') {
                    content = <div style={{ width: '100%', height: '100%', border: `1px solid ${el.borderColor || '#000'}` }}></div>;
                }
                
                return (
                    <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height }}>
                        {content}
                    </div>
                );
            })}
        </div>
    );
};

export default function ProjectManager({ projects, templates, onStartProject, onDeleteProject, onRenameProject, onBack }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedType, setSelectedType] = useState<'nota' | 'kwitansi' | null>(null);
  
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  const submitRename = (id: string) => {
      if (editingNameValue.trim()) {
          onRenameProject(id, editingNameValue.trim());
      }
      setEditingNameId(null);
  };

  const handleCreateProject = (template: DocumentTemplate) => {
      const newProject: DocumentProject = {
          id: 'proj_' + Date.now(),
          name: newProjectName || 'Project Baru',
          templateId: template.id,
          type: template.type,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          document: JSON.parse(JSON.stringify(template)), // clone template
          projectElements: []
      };
      setShowModal(false);
      onStartProject(newProject, true);
      setNewProjectName('');
      setSelectedType(null);
  }

  const filteredTemplates = templates.filter(t => t.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-10 font-sans relative transition-colors duration-300 z-0">
        {/* Decorative Background Blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/5 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/5 blur-[120px]"></div>
        </div>

       <div className="max-w-6xl mx-auto relative z-10">
           <div className="flex justify-between items-center mb-12">
               <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 flex items-center gap-2 uppercase tracking-widest transition-colors">← Kembali</button>
               <button onClick={() => setShowModal(true)} className="bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors">
                   <Plus size={18} /> Buat Project Baru
               </button>
           </div>
           
           <div className="mb-12">
               <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
                       <FolderKanban size={32} />
                   </div>
                   <div>
                       <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Kumpulan <span className="text-[#1800ad] dark:text-blue-400">Project</span></h1>
                       <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg mt-2">Buat dokumen nyata berdasarkan template yang telah Anda siapkan, lalu modifikasi tanpa mengubah template asli.</p>
                   </div>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map(proj => (
                    <div key={proj.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 overflow-hidden hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full">
                        <div className="h-48 bg-gray-50 dark:bg-gray-700 flex items-center justify-center relative p-4 relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
                            <StaticPreview template={proj.document} />
                            
                            <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-600 shadow-sm z-10">
                                {proj.type}
                            </div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteProject(proj.id); }}
                                className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg border border-gray-100 dark:border-gray-600 z-10 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                title="Hapus Project"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="mb-6">
                                {editingNameId === proj.id ? (
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            type="text" 
                                            value={editingNameValue} 
                                            onChange={e => setEditingNameValue(e.target.value)} 
                                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#1800ad] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#1800ad] dark:focus:ring-blue-400"
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && submitRename(proj.id)}
                                            onBlur={() => submitRename(proj.id)}
                                        />
                                    </div>
                                ) : (
                                    <div className="group/title flex items-start justify-between cursor-pointer mb-2" onClick={() => { setEditingNameId(proj.id); setEditingNameValue(proj.name); }}>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg decoration-gray-300 dark:decoration-gray-600 group-hover/title:underline underline-offset-4">{proj.name}</h3>
                                        <Edit3 size={14} className="text-gray-300 dark:text-gray-500 opacity-0 group-hover/title:opacity-100 transition-opacity mt-1.5 flex-shrink-0 ml-2" />
                                    </div>
                                )}
                                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{proj.date}</p>
                            </div>
                            <button 
                               onClick={() => onStartProject(proj, false)}
                               className="w-full bg-gray-50 dark:bg-gray-700 hover:bg-[#1800ad] dark:hover:bg-blue-600 text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <FolderKanban size={18} /> Buka Project
                            </button>
                        </div>
                    </div>
                ))}
                
                {projects.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                        <FolderKanban size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-400">Belum ada project</h3>
                        <p className="text-gray-500 dark:text-gray-500">Klik "Buat Project Baru" untuk memulai</p>
                    </div>
                )}
           </div>
           
           {/* Modal Buat Project Baru */}
           {showModal && (
           <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700">
                   <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shrink-0">
                       <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight">Project Baru</h3>
                       <button onClick={() => { setShowModal(false); setSelectedType(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"><X size={18}/></button>
                   </div>
                   
                   <div className="p-8 flex-1 overflow-y-auto">
                       <div className="w-full max-w-md mx-auto mb-10">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-3">Nama Project</label>
                           <input 
                               type="text" 
                               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-[#1800ad] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1800ad] dark:focus:ring-blue-500 transition-all" 
                               placeholder="Contoh: Transaksi PT Bintang" 
                               value={newProjectName}
                               onChange={(e) => setNewProjectName(e.target.value)}
                           />
                       </div>
                       
                       {!selectedType ? (
                           <div className="space-y-6">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block text-center">Pilih Jenis Dokumen</label>
                               <div className="flex justify-center gap-6">
                                   <button 
                                      onClick={() => setSelectedType('nota')}
                                      className="flex flex-col items-center justify-center w-64 p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-[#1800ad] dark:hover:border-blue-500 hover:bg-[#1800ad]/5 dark:hover:bg-blue-500/10 rounded-2xl transition-all group"
                                   >
                                       <span className="font-black text-gray-900 dark:text-white group-hover:text-[#1800ad] dark:group-hover:text-blue-400 text-xl">Nota</span>
                                   </button>
                                   <button 
                                      onClick={() => setSelectedType('kwitansi')}
                                      className="flex flex-col items-center justify-center w-64 p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-[#1800ad] dark:hover:border-blue-500 hover:bg-[#1800ad]/5 dark:hover:bg-blue-500/10 rounded-2xl transition-all group"
                                   >
                                       <span className="font-black text-gray-900 dark:text-white group-hover:text-[#1800ad] dark:group-hover:text-blue-400 text-xl">Kwitansi</span>
                                   </button>
                               </div>
                           </div>
                       ) : (
                           <div>
                               <div className="flex items-center justify-between mb-6">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">Pilih Template {selectedType}</label>
                                   <button onClick={() => setSelectedType(null)} className="text-xs font-bold text-[#1800ad] dark:text-blue-400 hover:text-[#120085] dark:hover:text-blue-300 uppercase tracking-widest">← Ubah Jenis Dokumen</button>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                   {filteredTemplates.map(tmpl => (
                                       <div 
                                           key={tmpl.id} 
                                           className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-[#1800ad] dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all group flex flex-col"
                                           onClick={() => handleCreateProject(tmpl)}
                                       >
                                           <div className="h-40 bg-gray-50 dark:bg-gray-700 relative overflow-hidden flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
                                               <StaticPreview template={tmpl} />
                                           </div>
                                           <div className="p-3 bg-white dark:bg-gray-800 flex-1">
                                               <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{tmpl.name}</h4>
                                           </div>
                                       </div>
                                   ))}
                                   
                                   {filteredTemplates.length === 0 && (
                                       <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                                           Belum ada template untuk jenis dokumen ini.
                                       </div>
                                   )}
                               </div>
                           </div>
                       )}
                   </div>
               </div>
           </div>
           )}

       </div>
    </div>
  );
}

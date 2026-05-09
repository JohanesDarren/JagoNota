import React, { useState } from 'react';
import { DocumentTemplate, TableElement } from '../types';
import { FileSignature, Palette, Plus, X, FileText, Receipt, Edit3, Trash2 } from 'lucide-react';

interface Props {
  templates: DocumentTemplate[];
  currentUserId?: string | null;
  onStartEditor: (template: DocumentTemplate, isNew?: boolean) => void;
  onDeleteTemplate: (id: string) => void;
  onRenameTemplate: (id: string, newName: string) => void;
  onBack: () => void;
}

function createId() {
  return Math.random().toString(36).substr(2, 9);
}

function createStandardNota(name: string, userId: string): DocumentTemplate {
  return {
    id: 'nota_' + Date.now(),
    name: name || 'Template Nota Standar',
    type: 'nota',
    width: 600,
    height: 800,
    backgroundColor: '#ffffff',
    user_id: userId,
    elements: [
      { id: createId(), type: 'text', content: 'NOTA PENJUALAN', x: 200, y: 30, width: 200, height: 30, fontFamily: 'font-sans', fontSize: 20, color: '#000000', textAlign: 'center', fontWeight: 'bold' },
      { id: createId(), type: 'text', content: 'NAMA TOKO', x: 20, y: 70, width: 200, height: 30, fontFamily: 'font-sans', fontSize: 18, color: '#000000', textAlign: 'left', fontWeight: 'bold' },
      { id: createId(), type: 'text', content: 'Jalan Raya No. 123, Kota', x: 20, y: 100, width: 200, height: 30, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: 'Tgl:               ', x: 400, y: 70, width: 180, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: 'Kepada Yth.', x: 400, y: 95, width: 180, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: '................................................', x: 400, y: 115, width: 180, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'left' },
      { 
        id: createId(), 
        type: 'table', 
        x: 20, 
        y: 160, 
        width: 560, 
        height: 480, 
        columns: [
          { id: 'c1', header: 'Banyaknya', width: 2 },
          { id: 'c2', header: 'Nama Barang', width: 4 },
          { id: 'c3', header: 'Harga', width: 2 },
          { id: 'c4', header: 'Jumlah', width: 2 }
        ],
        rows: [
          ['', '', '', ''],
          ['', '', '', ''],
          ['', '', '', ''],
          ['', '', '', ''],
          ['', '', '', '']
        ],
        borderColor: '#000000',
        headerBgColor: 'transparent',
        textColor: '#000000',
        fontSize: 12,
        fontFamily: 'font-sans'
      } as TableElement,
      { id: createId(), type: 'text', content: 'Total', x: 380, y: 650, width: 50, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left', fontWeight: 'bold' },
      { id: createId(), type: 'shape', shapeType: 'rectangle', x: 440, y: 645, width: 140, height: 30, fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
      { id: createId(), type: 'text', content: 'Tanda Terima,', x: 50, y: 700, width: 100, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'center' },
      { id: createId(), type: 'text', content: '(........................)', x: 30, y: 760, width: 140, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'center' },
      { id: createId(), type: 'text', content: 'Hormat Kami,', x: 450, y: 700, width: 100, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'center' },
      { id: createId(), type: 'text', content: '(........................)', x: 430, y: 760, width: 140, height: 20, fontFamily: 'font-sans', fontSize: 12, color: '#000000', textAlign: 'center' }
    ]
  };
}

function createStandardKwitansi(name: string, userId: string): DocumentTemplate {
  return {
    id: 'kwitansi_' + Date.now(),
    name: name || 'Template Kwitansi Standar',
    type: 'kwitansi',
    width: 800,
    height: 350,
    backgroundColor: '#ffffff',
    user_id: userId,
    elements: [
      { id: createId(), type: 'text', content: 'KWITANSI', x: 350, y: 20, width: 100, height: 30, fontFamily: 'font-serif', fontSize: 24, color: '#000000', textAlign: 'center', fontWeight: 'bold' },
      { id: createId(), type: 'shape', shapeType: 'line', x: 20, y: 60, width: 760, height: 2, strokeColor: '#000000', strokeWidth: 2 },
      { id: createId(), type: 'text', content: 'No.', x: 20, y: 70, width: 40, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: '...................', x: 50, y: 70, width: 150, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: 'Telah Terima Dari', x: 20, y: 110, width: 160, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: ':', x: 180, y: 110, width: 10, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'shape', shapeType: 'rectangle', x: 200, y: 110, width: 560, height: 25, fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
      { id: createId(), type: 'text', content: 'Uang Sebanyak', x: 20, y: 150, width: 160, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: ':', x: 180, y: 150, width: 10, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'shape', shapeType: 'rectangle', x: 200, y: 150, width: 560, height: 25, fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
      { id: createId(), type: 'text', content: 'Untuk Pembayaran', x: 20, y: 190, width: 160, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'text', content: ':', x: 180, y: 190, width: 10, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'left' },
      { id: createId(), type: 'shape', shapeType: 'rectangle', x: 200, y: 190, width: 560, height: 25, fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
      { id: createId(), type: 'shape', shapeType: 'rectangle', x: 200, y: 220, width: 560, height: 25, fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
      { id: createId(), type: 'text', content: 'Rp.', x: 20, y: 280, width: 40, height: 30, fontFamily: 'font-sans', fontSize: 20, color: '#000000', textAlign: 'left', fontWeight: 'bold' },
      { id: createId(), type: 'shape', shapeType: 'rectangle', x: 70, y: 275, width: 300, height: 40, fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
      { id: createId(), type: 'text', content: 'Kota, Tanggal', x: 550, y: 260, width: 200, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'center' },
      { id: createId(), type: 'text', content: '(........................................)', x: 550, y: 310, width: 200, height: 20, fontFamily: 'font-sans', fontSize: 14, color: '#000000', textAlign: 'center' }
    ]
  };
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

export default function TemplateManager({ templates, currentUserId, onStartEditor, onDeleteTemplate, onRenameTemplate, onBack }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [activeTab, setActiveTab] = useState<'my-templates' | 'app-templates'>('my-templates');
  
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  const submitRename = (id: string) => {
      if (editingNameValue.trim()) {
          onRenameTemplate(id, editingNameValue.trim());
      }
      setEditingNameId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-10 font-sans relative transition-colors duration-300 z-0">
        {/* Decorative Background Blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/5 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/5 blur-[120px]"></div>
        </div>

       <div className="max-w-6xl mx-auto relative z-10">
           <div className="flex justify-between items-center mb-12">
               <button type="button" onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 flex items-center gap-2 uppercase tracking-widest transition-colors">← Kembali</button>
               <button type="button" onClick={() => setShowModal(true)} className="bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors">
                   <Plus size={18} /> Buat Template Baru
               </button>
           </div>
           
           <div className="mb-12">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest mb-4">
                   <Palette size={14}/> TEMPLATE MANAGER
               </div>
               <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                   Desain <span className="text-[#1800ad] dark:text-blue-400">Template</span>
               </h1>
               <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg mt-4">Buat template nota dan kwitansi Anda sendiri dengan kanvas dinamis yang fleksibel dan mudah digunakan.</p>
           </div>
           
           <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 pb-px">
               <button 
                   onClick={() => setActiveTab('my-templates')}
                   className={`pb-4 text-sm font-bold tracking-wide transition-colors border-b-2 ${activeTab === 'my-templates' ? 'border-[#1800ad] dark:border-blue-400 text-[#1800ad] dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
               >
                   Template Saya
               </button>
               <button 
                   onClick={() => setActiveTab('app-templates')}
                   className={`pb-4 text-sm font-bold tracking-wide transition-colors border-b-2 ${activeTab === 'app-templates' ? 'border-[#1800ad] dark:border-blue-400 text-[#1800ad] dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
               >
                   Template Aplikasi
               </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.filter(t => activeTab === 'my-templates' ? t.user_id === currentUserId : t.user_id == null || t.is_default).map(tmpl => (
                    <div key={tmpl.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 overflow-hidden hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full">
                        <div className="h-48 bg-gray-50 dark:bg-gray-700 flex items-center justify-center relative p-4 relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
                            <StaticPreview template={tmpl} />
                            
                            <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-600 shadow-sm z-10">
                                {tmpl.type}
                            </div>
                            
                            {tmpl.user_id === currentUserId && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTemplate(tmpl.id); }}
                                    className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg border border-gray-100 dark:border-gray-600 z-10 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    title="Hapus Template"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="mb-6">
                                {editingNameId === tmpl.id ? (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={editingNameValue} 
                                            onChange={e => setEditingNameValue(e.target.value)} 
                                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#1800ad] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#1800ad] dark:focus:ring-blue-400"
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && submitRename(tmpl.id)}
                                            onBlur={() => submitRename(tmpl.id)}
                                        />
                                    </div>
                                ) : (
                                    <div className={`group/title flex items-start justify-between ${tmpl.user_id === currentUserId ? 'cursor-pointer' : ''} mb-2`} onClick={() => { if (tmpl.user_id === currentUserId) { setEditingNameId(tmpl.id); setEditingNameValue(tmpl.name); } }}>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg decoration-gray-300 dark:decoration-gray-600 group-hover/title:underline underline-offset-4">{tmpl.name}</h3>
                                        {tmpl.user_id === currentUserId && <Edit3 size={14} className="text-gray-300 dark:text-gray-500 opacity-0 group-hover/title:opacity-100 transition-opacity mt-1.5 flex-shrink-0 ml-2" />}
                                    </div>
                                )}
                                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{tmpl.elements.length} Elemen Terdaftar</p>
                            </div>
                            <button 
                               type="button"
                               onClick={(e) => { e.preventDefault(); onStartEditor(tmpl, false); }}
                               className="w-full bg-gray-50 dark:bg-gray-700 hover:bg-[#1800ad] dark:hover:bg-blue-600 text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <FileSignature size={18} /> Buka Editor
                            </button>
                        </div>
                    </div>
                ))}
           </div>
       </div>

       {showModal && (
           <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all">
                   <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                       <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight">Template Baru</h3>
                       <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"><X size={18}/></button>
                   </div>
                   <div className="p-8">
                       <div className="mb-8">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-3">Nama Template</label>
                           <input 
                               type="text" 
                               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-[#1800ad] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1800ad] dark:focus:ring-blue-500 transition-all" 
                               placeholder="Contoh: Nota Toko Jaya" 
                               value={newTemplateName}
                               onChange={(e) => setNewTemplateName(e.target.value)}
                           />
                       </div>
                       
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-3">Pilih Pola Dasar (Preset)</label>
                       <div className="grid grid-cols-2 gap-4">
                           <button 
                              onClick={() => {
                                  setShowModal(false);
                                  onStartEditor(createStandardNota(newTemplateName, currentUserId || ''), true);
                                  setNewTemplateName('');
                              }}
                              className="flex flex-col items-start justify-center p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-[#1800ad] dark:hover:border-blue-500 hover:bg-[#1800ad]/5 dark:hover:bg-blue-500/10 rounded-2xl transition-all group text-left"
                           >
                               <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                                   <FileText size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-[#1800ad] dark:group-hover:text-blue-400" />
                               </div>
                               <span className="font-black text-gray-900 dark:text-white group-hover:text-[#1800ad] dark:group-hover:text-blue-400 text-lg mb-1">Nota</span>
                               <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pola standar dengan tabel dan total.</span>
                           </button>
                           <button 
                              onClick={() => {
                                  setShowModal(false);
                                  onStartEditor(createStandardKwitansi(newTemplateName, currentUserId || ''), true);
                                  setNewTemplateName('');
                              }}
                              className="flex flex-col items-start justify-center p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-[#1800ad] dark:hover:border-blue-500 hover:bg-[#1800ad]/5 dark:hover:bg-blue-500/10 rounded-2xl transition-all group text-left"
                           >
                               <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                                   <Receipt size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-[#1800ad] dark:group-hover:text-blue-400" />
                               </div>
                               <span className="font-black text-gray-900 dark:text-white group-hover:text-[#1800ad] dark:group-hover:text-blue-400 text-lg mb-1">Kwitansi</span>
                               <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pola standar penerimaan uang pembayaran.</span>
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}

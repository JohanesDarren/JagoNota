import React, { useState, useEffect } from 'react';
import { CanvasElement, DocumentTemplate, TextElement, ImageElement, ShapeElement, TableElement, FontOption } from '../types';

interface Props {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  template: DocumentTemplate;
  onUpdateTemplate: (t: DocumentTemplate) => void;
  onBack: () => void;
  onAddElement?: (el: CanvasElement) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isLocked?: boolean;
}

export default function SidebarPropertyPanel({ selectedElement, onUpdateElement, template, onUpdateTemplate, onBack, onAddElement, onSave, isSaving, isLocked }: Props) {
  const [customFonts, setCustomFonts] = useState<FontOption[]>(() => {
    try {
      const saved = localStorage.getItem('jagonota_custom_fonts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Reload custom fonts from localStorage and re-inject CSS whenever the panel is active
  useEffect(() => {
    const loadAndInjectFonts = () => {
      try {
        const saved = localStorage.getItem('jagonota_custom_fonts');
        const fonts: FontOption[] = saved ? JSON.parse(saved) : [];
        setCustomFonts(fonts);

        // Re-inject @font-face CSS so custom fonts render on the canvas
        const existing = document.getElementById('jagonota-custom-fonts-style');
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.id = 'jagonota-custom-fonts-style';
        style.textContent = fonts.map((f: FontOption) => {
          const spacing = `letter-spacing: ${f.letterSpacing ?? 0}px; line-height: ${f.lineSpacing ?? 1};`;
          if (f.font_url) {
            const format = f.font_url.endsWith('.woff2') ? 'woff2' : f.font_url.endsWith('.woff') ? 'woff' : f.font_url.endsWith('.ttf') ? 'truetype' : f.font_url.endsWith('.otf') ? 'opentype' : 'woff2';
            return `@font-face { font-family: '${f.value}'; src: url('${f.font_url}') format('${format}'); font-weight: normal; font-style: normal; }\n.${f.value} { font-family: '${f.value}', sans-serif; ${spacing} display: inline-block; }`;
          }
          if (f.cssText) {
            return `.${f.value} { ${f.cssText} ${spacing} display: inline-block; }`;
          }
          return `.${f.value} { ${spacing} display: inline-block; }`;
        }).join('\n');
        document.head.appendChild(style);

        // Load Google Fonts for AI-generated CSS fonts
        fonts.forEach((f: FontOption) => {
          if (f.fontFamilyName && !f.font_url && !document.getElementById('gf-' + f.value)) {
            const link = document.createElement('link');
            link.id = 'gf-' + f.value;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${f.fontFamilyName.replace(/\s+/g, '+')}&display=swap`;
            document.head.appendChild(link);
          }
        });
      } catch (e) {
        console.error('Error loading custom fonts in sidebar:', e);
      }
    };

    loadAndInjectFonts();
    // Also listen for storage changes (when FontManager saves a new font)
    window.addEventListener('storage', loadAndInjectFonts);
    return () => window.removeEventListener('storage', loadAndInjectFonts);
  }, []);
  
  const handleAddText = () => {
      if(!onAddElement) return;
      const newText: TextElement = {
          id: 'text_' + Date.now(),
          type: 'text',
          content: 'Teks Baru',
          x: template.width / 2 - 50,
          y: template.height / 2 - 20,
          width: 150,
          height: 40,
          fontFamily: 'font-sans',
          fontSize: 16,
          color: '#000000',
          textAlign: 'left'
      };
      onAddElement(newText);
  };

  const handleAddShape = () => {
      if(!onAddElement) return;
      const newShape: ShapeElement = {
          id: 'shape_' + Date.now(),
          type: 'shape',
          shapeType: 'rectangle',
          x: template.width / 2 - 50,
          y: template.height / 2 - 50,
          width: 100,
          height: 100,
          fillColor: '#cbd5e1',
          strokeColor: '#475569',
          strokeWidth: 0
      };
      onAddElement(newShape);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onAddElement) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const src = ev.target?.result as string;
              const imgObj = new Image();
              imgObj.onload = () => {
                  const newImg: ImageElement = {
                      id: 'img_' + Date.now(),
                      type: 'image',
                      src,
                      x: template.width / 2 - 50,
                      y: template.height / 2 - 50,
                      width: 100,
                      height: 100 * (imgObj.height / imgObj.width)
                  };
                  onAddElement(newImg);
              };
              imgObj.src = src;
          };
          reader.readAsDataURL(file);
      }
  };
  const handleAddTable = () => {
      if(!onAddElement) return;
      const newTable: TableElement = {
          id: 'table_' + Date.now(),
          type: 'table',
          x: template.width / 2 - 150,
          y: template.height / 2 - 100,
          width: 300,
          height: 200,
          columns: [
              { id: 'c1', header: 'Item', width: 2 },
              { id: 'c2', header: 'Harga', width: 1 }
          ],
          rows: [
              ['', ''],
              ['', '']
          ],
          borderColor: '#000000',
          headerBgColor: 'transparent',
          textColor: '#000000',
          fontSize: 12,
          fontFamily: 'font-sans'
      };
      onAddElement(newTable);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 shadow-xl z-20 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 shrink-0 transition-colors duration-300">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
            <button onClick={onBack} className="text-[#1800ad] dark:text-blue-400 hover:text-[#120085] dark:hover:text-blue-300 text-sm font-bold flex items-center gap-2 uppercase tracking-widest transition-colors">← Kembali</button>
            <span className="font-bold text-gray-800 dark:text-gray-200 truncate px-2">{template.name}</span>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative">
            {isLocked && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col items-start justify-start p-6 text-center pt-20">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center mb-4 mx-auto border border-red-100 dark:border-red-800">
                        <span className="text-xl">🔒</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 mx-auto">Read-Only Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Template ini sudah digunakan dalam Project dan tata letaknya telah dikunci untuk menjaga konsistensi dokumen.</p>
                </div>
            )}

            {!selectedElement ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider uppercase border-b border-gray-200 dark:border-gray-700 pb-2">Properti Kanvas</h3>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Warna Background</label>
                            <input 
                                type="color" 
                                value={template.backgroundColor} 
                                onChange={e => onUpdateTemplate({ ...template, backgroundColor: e.target.value })} 
                                className="w-full h-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider uppercase border-b border-gray-200 dark:border-gray-700 pb-2">Tambahkan Elemen</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleAddText} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2">
                                <span>T</span>
                                <span>Teks</span>
                            </button>
                            <label className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2 cursor-pointer">
                                <span>🖼️</span>
                                <span>Gambar</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleAddImage} />
                            </label>
                            <button onClick={handleAddShape} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2">
                                <span>🟩</span>
                                <span>Shape</span>
                            </button>
                            <button onClick={handleAddTable} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2">
                                <span>📋</span>
                                <span>Tabel</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-[#1800ad] dark:text-blue-400 tracking-wider uppercase border-b border-gray-200 dark:border-gray-700 pb-2">
                        Properti {selectedElement.type}
                    </h3>
                    
                    {/* Basic Properties for Any Element */}
                    <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-3">
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">X Pos</label>
                                 <input type="number" value={selectedElement.x} onChange={e => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none" />
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Y Pos</label>
                                 <input type="number" value={selectedElement.y} onChange={e => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none" />
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Width</label>
                                 <input type="number" value={selectedElement.width} onChange={e => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none" />
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Height</label>
                                 <input type="number" value={selectedElement.height} onChange={e => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none" />
                             </div>
                         </div>
                    </div>

                    {/* Specific Properties */}
                    {selectedElement.type === 'text' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Text Content</label>
                                <textarea 
                                    value={selectedElement.content} 
                                    onChange={e => onUpdateElement(selectedElement.id, { content: e.target.value })} 
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded p-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none h-20 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Font Size</label>
                                    <input type="number" value={selectedElement.fontSize} onChange={e => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Color</label>
                                    <input type="color" value={selectedElement.color} onChange={e => onUpdateElement(selectedElement.id, { color: e.target.value })} className="w-full h-8 cursor-pointer rounded border border-gray-200 dark:border-gray-600 p-0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Font Family</label>
                                <select 
                                    value={selectedElement.fontFamily} 
                                    onChange={e => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })} 
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
                                >
                                    <option value="font-sans">Default Sans</option>
                                    <option value="font-serif">Default Serif</option>
                                    <option value="sys-font-kalam">Kalam (Santai &amp; Natural)</option>
                                    <option value="sys-font-dancing">Dancing Script (Elegan Bersambung)</option>
                                    <option value="sys-font-pacifico">Pacifico (Bulat &amp; Retro)</option>
                                    <option value="sys-font-marker">Permanent Marker (Spidol Tebal)</option>
                                    <option value="sys-font-amatic">Amatic SC (Artistik Papan Kapur)</option>
                                    <option value="sys-font-rocksalt">Rock Salt (Berantakan / Grunge)</option>
                                    <option value="sys-font-caveat">Caveat (Coretan Tebal)</option>
                                    <option value="sys-font-gloria">Gloria Hallelujah (Bouncy &amp; Komik)</option>
                                    {customFonts.map((f: FontOption) => (
                                        <option key={f.value} value={f.value}>{f.label} (Custom)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Letter Spacing</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={selectedElement.letterSpacing ?? 0}
                                        onChange={e => onUpdateElement(selectedElement.id, { letterSpacing: parseFloat(e.target.value) })}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Line Spacing</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={selectedElement.lineSpacing ?? 1}
                                        onChange={e => onUpdateElement(selectedElement.id, { lineSpacing: parseFloat(e.target.value) })}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Alignment</label>
                                <div className="flex bg-gray-50 dark:bg-gray-900 rounded-lg p-1 gap-1 border border-gray-200 dark:border-gray-700">
                                    {['left', 'center', 'right'].map(align => (
                                        <button 
                                            key={align} 
                                            onClick={() => onUpdateElement(selectedElement.id, { textAlign: align as any })}
                                            className={`flex-1 py-1.5 text-[10px] rounded uppercase font-bold transition-all ${selectedElement.textAlign === align ? 'bg-white dark:bg-gray-700 shadow text-[#1800ad] dark:text-blue-400' : 'text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300'}`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedElement.type === 'image' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Opacity (%)</label>
                                <input 
                                   type="range" min="0.1" max="1" step="0.1" 
                                   value={selectedElement.opacity ?? 1} 
                                   onChange={e => onUpdateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                                   className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Efek Stempel (Noise)</label>
                                <input 
                                   type="range" min="0" max="1" step="0.1" 
                                   value={selectedElement.noise ?? 0} 
                                   onChange={e => onUpdateElement(selectedElement.id, { noise: parseFloat(e.target.value) })} 
                                   className="w-full"
                                />
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Geser untuk menambah efek pudar transparan pada logo/stempel.</p>
                            </div>
                        </div>
                    )}

                    {selectedElement.type === 'shape' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Fill Color</label>
                                <input type="color" value={selectedElement.fillColor || '#000000'} onChange={e => onUpdateElement(selectedElement.id, { fillColor: e.target.value })} className="w-full h-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0" />
                            </div>
                        </div>
                    )}

                    {selectedElement.type === 'table' && (() => {
                        const tb = selectedElement as TableElement;
                        return (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Ukuran Tabel</label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button 
                                        onClick={() => {
                                            const newCols = [...tb.columns, { id: 'c' + Date.now(), header: 'Baru', width: 2 }];
                                            const newRows = tb.rows.map(r => [...r, '']);
                                            onUpdateElement(tb.id, { columns: newCols, rows: newRows });
                                        }}
                                        className="bg-gray-50 dark:bg-gray-800 hover:bg-[#1800ad]/10 hover:text-[#1800ad] dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 text-[10px] uppercase font-black tracking-wider py-2 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                                    >+ Kolom</button>
                                    <button 
                                        onClick={() => {
                                            if (tb.columns.length <= 1) return;
                                            const newCols = tb.columns.slice(0, -1);
                                            const newRows = tb.rows.map(r => r.slice(0, -1));
                                            onUpdateElement(tb.id, { columns: newCols, rows: newRows });
                                        }}
                                        className="bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 text-[10px] uppercase font-black tracking-wider py-2 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                                    >- Kolom</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button 
                                        onClick={() => {
                                            const newRows = [...tb.rows, new Array(tb.columns.length).fill('')];
                                            onUpdateElement(tb.id, { rows: newRows });
                                        }}
                                        className="bg-gray-50 dark:bg-gray-800 hover:bg-[#1800ad]/10 hover:text-[#1800ad] dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 text-[10px] uppercase font-black tracking-wider py-2 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                                    >+ Baris</button>
                                    <button 
                                        onClick={() => {
                                            if (tb.rows.length <= 1) return;
                                            onUpdateElement(tb.id, { rows: tb.rows.slice(0, -1) });
                                        }}
                                        className="bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 text-[10px] uppercase font-black tracking-wider py-2 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                                    >- Baris</button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Isi Tabel</label>
                                <div className="max-h-[250px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                                    {/* Header Row */}
                                    <div className="flex gap-1 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                            {tb.columns.map((col, cIdx) => (
                                                <input 
                                                    key={col.id}
                                                    value={col.header}
                                                    onChange={e => {
                                                        const newCols = [...tb.columns];
                                                        newCols[cIdx] = { ...newCols[cIdx], header: e.target.value };
                                                        onUpdateElement(tb.id, { columns: newCols });
                                                    }}
                                                    className="w-full border border-[#1800ad]/20 dark:border-blue-500/20 rounded-md px-2 py-1.5 text-[10px] font-bold bg-[#1800ad]/5 dark:bg-blue-500/10 text-[#1800ad] dark:text-blue-400 min-w-[50px] outline-none focus:ring-1 focus:ring-[#1800ad] dark:focus:ring-blue-500"
                                                    placeholder="Header"
                                                />
                                            ))}
                                    </div>
                                    
                                    {/* Body Rows */}
                                    {tb.rows.map((row, rIdx) => (
                                        <div key={rIdx} className="flex gap-1 group">
                                            {row.map((cell, cIdx) => (
                                                <input 
                                                    key={cIdx}
                                                    value={cell}
                                                    onChange={e => {
                                                        const newRows = [...tb.rows];
                                                        newRows[rIdx] = [...newRows[rIdx]];
                                                        newRows[rIdx][cIdx] = e.target.value;
                                                        onUpdateElement(tb.id, { rows: newRows });
                                                    }}
                                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 text-[10px] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 min-w-[50px] outline-none focus:border-[#1800ad] focus:ring-1 focus:ring-[#1800ad] dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                                    placeholder={`Isi..`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Gunakan Kursor untuk Mengatur Ukuran</label>
                                <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-2">Tarik garis pembatas antara kolom atau baris pada kanvas untuk mengatur ukuran.</p>
                            </div>
                        </div>
                        );
                    })()}
                </div>
            )}
        </div>
        
        {onSave && !isLocked && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full bg-[#1800ad] dark:bg-blue-600 hover:bg-[#120085] dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-lg">💾</span> {isSaving ? 'Menyimpan...' : 'Simpan Template'}
                </button>
            </div>
        )}
    </div>
  );
}

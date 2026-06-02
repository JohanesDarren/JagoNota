import React, { useState, useRef, useEffect } from 'react';
import { DocumentProject, CanvasElement, TextElement, SignatureElement, FontOption } from '../types';
import ElementNode from './ElementNode';
import { Download, Type, PenTool, X, ImageIcon, FileText } from 'lucide-react';
import { supabase } from '../utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  project: DocumentProject;
  onUpdateProject: (updated: DocumentProject) => void;
  onBack: () => void;
}

export default function ProjectEditor({ project, onUpdateProject, onBack }: Props) {
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [customFonts, setCustomFontsState] = useState<FontOption[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState<'pdf' | 'png' | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

  const handleSaveProject = async () => {
       try {
           setSaving(true);
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) {
               alert('Anda harus login terlebih dahulu!');
               return;
           }

           const { error } = await supabase.from('projects').insert([
               {
                   title: project.name.trim(),
                   content: project,
                   template_id: project.document.id,
                   user_id: user.id
               }
           ]);

           if (error) throw error;
           alert('Project berhasil disimpan!');
       } catch (err: any) {
           alert('Gagal menyimpan project: ' + err.message);
       } finally {
           setSaving(false);
       }
   };

   // Load custom fonts from Supabase and localStorage, then inject CSS for canvas rendering
   useEffect(() => {
      const loadAndInjectFonts = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          let customFonts: FontOption[] = [];
          
          // Load from Supabase if user is logged in
          if (user) {
            const { data, error } = await supabase
              .from('fonts')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: true });
              
            if (!error && data) {
              customFonts = data.map((font: any) => ({
                id: font.id,
                label: font.name,
                value: `custom-font-${font.id}`,
                isCustom: true,
                cssText: font.cssText || '',
                fontFamilyName: font.name,
                font_url: font.font_url,
                lineSpacing: font.line_spacing,
                letterSpacing: font.letter_spacing,
                user_id: font.user_id,
                created_at: font.created_at
              }));
            }
          }
          
          // Also load from localStorage as fallback/supplement
          const saved = localStorage.getItem('jagonota_custom_fonts');
          if (saved) {
            const localFonts: FontOption[] = JSON.parse(saved);
            // Merge, preferring Supabase versions if there are conflicts by id
            const supabaseIds = new Set(customFonts.map(f => f.id));
            const mergedFonts = [
              ...customFonts,
              ...localFonts.filter(f => !supabaseIds.has(f.id))
            ];
            customFonts = mergedFonts;
          }
          
          // Update state
          setCustomFontsState(customFonts);
          
          // Re-inject @font-face CSS so custom fonts render on the canvas
          const existing = document.getElementById('jagonota-custom-fonts-style');
          if (existing) existing.remove();
          const style = document.createElement('style');
          style.id = 'jagonota-custom-fonts-style';
          style.textContent = customFonts.map((f: FontOption) => {
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
          customFonts.forEach((f: FontOption) => {
            if (f.fontFamilyName && !f.font_url && !document.getElementById('gf-' + f.value)) {
              const link = document.createElement('link');
              link.id = 'gf-' + f.value;
              link.rel = 'stylesheet';
              link.href = `https://fonts.googleapis.com/css2?family=${f.fontFamilyName.replace(/\s+/g, '+')}&display=swap`;
              document.head.appendChild(link);
            }
          });
          
          // Update localStorage with merged fonts for other components
          localStorage.setItem('jagonota_custom_fonts', JSON.stringify(customFonts.filter(f => f.isCustom)));
        } catch (e) {
          console.error('Error loading custom fonts in project editor:', e);
        }
      };

      loadAndInjectFonts();
      window.addEventListener('storage', (e) => {
        if (e.key === 'jagonota_custom_fonts') {
          loadAndInjectFonts();
        }
      });
      return () => window.removeEventListener('storage', (e) => {
        if (e.key === 'jagonota_custom_fonts') {
          loadAndInjectFonts();
        }
      });
    }, []);

    const handleDownload = async (format: 'pdf' | 'png') => {
        if (!canvasRef.current) return;
        
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Sesi Anda telah habis. Silakan login kembali.');
                return;
            }

            // Simulasikan delay konfirmasi pembayaran & proses render
            await new Promise(r => setTimeout(r, 1500));
            
            const canvas = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${project.name}.png`;
                link.href = imgData;
                link.click();
            } else {
                const pdf = new jsPDF({
                    orientation: project.document.width > project.document.height ? 'l' : 'p',
                    unit: 'px',
                    format: [project.document.width, project.document.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, project.document.width, project.document.height);
                pdf.save(`${project.name}.pdf`);
            }

            // Catat transaksi dengan link hasil render PDF/PNG (disimpan di database)
            await supabase.from('transactions').insert([{
                user_id: user.id,
                document_id: project.id,
                amount: 2000,
                status: 'success',
                payment_method: 'qris'
            }]);

        } catch (error) {
            console.error('Download error:', error);
            alert('Gagal mengunduh dokumen.');
        } finally {
            setSaving(false);
        }
    };

  const selectedElement = project.projectElements.find(e => e.id === selectedElementId) || null;

  const handleUpdateElements = (elements: CanvasElement[]) => {
      onUpdateProject({ ...project, projectElements: elements });
  };

  const onUpdateElement = (id: string, partial: Partial<CanvasElement>) => {
      handleUpdateElements(project.projectElements.map(e => e.id === id ? { ...e, ...partial } as CanvasElement : e));
  };
  
  const onRemoveElement = (id: string) => {
      handleUpdateElements(project.projectElements.filter(e => e.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleAddText = () => {
      const newText: TextElement = {
          id: 'text_' + Date.now(),
          type: 'text',
          x: project.document.width / 2 - 50,
          y: project.document.height / 2 - 15,
          width: 150,
          height: 30,
          content: 'Isi teks...',
          fontFamily: 'font-sans',
          fontSize: 16,
          color: '#000000',
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          opacity: 1,
          roughness: 0
      };
      handleUpdateElements([...project.projectElements, newText]);
      setSelectedElementId(newText.id);
  };

  const handleAddSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const newSig: SignatureElement = {
                  id: 'sig_' + Date.now(),
                  type: 'signature',
                  x: project.document.width / 2 - 100,
                  y: project.document.height / 2 - 50,
                  width: 200,
                  height: 100,
                  src: event.target?.result as string,
                  opacity: 1,
                  roughness: 0
              };
              handleUpdateElements([...project.projectElements, newSig]);
              setSelectedElementId(newSig.id);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // Reset
  };

  const canvasScale = Math.min((window.innerHeight - 150) / project.document.height, 1);

  // Background template elements (locked) — preserves ALL template settings faithfully
  const templateNodes = project.document.elements.map(el => {
      let content = null;

      if (el.type === 'text') {
          // Preserve: fontFamily, fontSize, fontWeight, fontStyle, textDecoration,
          //           color, textAlign, letterSpacing, lineSpacing, roughness
          const roughness = el.roughness ?? 0;
          const textShadow = roughness > 0 ? `0 ${Math.min(roughness * 0.2, 1.2)}px ${Math.min(roughness * 0.8, 2.4)}px rgba(0,0,0,0.15)` : undefined;
          const textFilter = roughness > 0 ? `blur(${Math.min(roughness * 0.08, 1.2)}px)` : undefined;
          const isSystemFont = el.fontFamily.startsWith('sys-font-') || el.fontFamily.startsWith('font-hand') || el.fontFamily.startsWith('font-');
          const isCustomFont = el.fontFamily.startsWith('custom-font-');
          content = (
              <div
                  className={isSystemFont || isCustomFont ? el.fontFamily : ''}
                  style={{
                      width: '100%', height: '100%',
                      fontSize: el.fontSize,
                      fontWeight: el.fontWeight,
                      fontStyle: el.fontStyle,
                      textDecoration: el.textDecoration,
                      color: el.color,
                      textAlign: el.textAlign,
                      letterSpacing: el.letterSpacing != null ? `${el.letterSpacing}px` : undefined,
                      lineHeight: el.lineSpacing != null ? el.lineSpacing : undefined,
                      filter: textFilter,
                      textShadow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  }}
              >
                  {el.content}
              </div>
          );

      } else if (el.type === 'shape') {
          // Preserve: fillColor, strokeColor, strokeWidth
          if (el.shapeType === 'line') {
              content = (
                  <div className="w-full h-full flex items-center justify-center">
                      <div style={{ width: '100%', height: el.strokeWidth || 1, backgroundColor: el.strokeColor || '#000' }} />
                  </div>
              );
          } else {
              content = (
                  <div style={{
                      width: '100%', height: '100%',
                      backgroundColor: el.fillColor,
                      border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none',
                      borderRadius: el.shapeType === 'circle' ? '50%' : undefined,
                  }} />
              );
          }

      } else if (el.type === 'image') {
          // Preserve: opacity, noise (stamp/stempel effect)
          const noiseVal = el.noise ?? 0;
          const filterId = `tmpl-img-filter-${el.id}`;
          const turbFreq = 0.5 + noiseVal * 0.4;
          const matrixVal = 1 - noiseVal * 0.4;
          content = (
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
                      src={el.src}
                      alt=""
                      className="w-full h-full object-contain pointer-events-none select-none"
                      style={{ filter: noiseVal > 0 ? `url(#${filterId})` : 'none' }}
                  />
              </>
          );

      } else if (el.type === 'table') {
          // Preserve: borderColor, headerBgColor, textColor, fontSize, fontFamily, rowHeights, column widths
          content = (
              <div style={{ width: '100%', height: '100%', border: `1px solid ${el.borderColor || '#000'}`, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', backgroundColor: el.headerBgColor || '#f9fafb', borderBottom: `1px solid ${el.borderColor || '#000'}`, fontWeight: 'bold' }}>
                      {el.columns.map((c, i) => (
                          <div key={c.id} style={{ flex: c.width, padding: '4px 8px', borderRight: i < el.columns.length - 1 ? `1px solid ${el.borderColor || '#000'}` : 'none', fontSize: el.fontSize || 12, color: el.textColor || '#000', fontFamily: el.fontFamily }}>
                              {c.header}
                          </div>
                      ))}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {el.rows.map((r, ri) => (
                          <div key={ri} style={{ display: 'flex', flex: el.rowHeights?.[ri] ?? 1, borderBottom: ri < el.rows.length - 1 ? `1px solid ${el.borderColor || '#000'}` : 'none' }}>
                              {r.map((cell, ci) => (
                                  <div key={ci} style={{ flex: el.columns[ci].width, padding: '4px 8px', borderRight: ci < el.columns.length - 1 ? `1px solid ${el.borderColor || '#000'}` : 'none', fontSize: el.fontSize || 12, color: el.textColor || '#000', fontFamily: el.fontFamily }}>
                                      {cell}
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>
          );

      } else if (el.type === 'signature') {
          // Preserve: opacity, roughness
          const sig = el as any;
          const roughSigId = `tmpl-sig-${el.id}`;
          content = (
              <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', opacity: sig.opacity ?? 1 }}>
                  {sig.roughness > 0 && (
                      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                          <defs>
                              <filter id={roughSigId}>
                                  <feTurbulence type="fractalNoise" baseFrequency={0.05 + sig.roughness * 0.1} numOctaves="2" result="noise" />
                                  <feDisplacementMap in="SourceGraphic" in2="noise" scale={sig.roughness * 5} xChannelSelector="R" yChannelSelector="G" />
                              </filter>
                          </defs>
                      </svg>
                  )}
                  <img
                      src={sig.src}
                      alt="Signature"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', filter: sig.roughness > 0 ? `url(#${roughSigId})` : 'none' }}
                  />
              </div>
          );
      }

      return (
          // Use element's own opacity — not hardcoded 0.8
          <div key={`bg-${el.id}`} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, pointerEvents: 'none', opacity: el.opacity ?? 1 }}>
              {content}
          </div>
      );
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-xl z-20 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <button onClick={onBack} className="text-[#1800ad] dark:text-blue-400 hover:text-[#120085] dark:hover:text-blue-300 text-sm font-bold flex items-center gap-2 uppercase tracking-widest transition-colors">
                    ← Kembali
                </button>
                <div className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg uppercase tracking-wider">Mode Project</div>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-gray-800 dark:text-gray-100">{project.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Template dikunci saat di project.</p>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {!selectedElement ? (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider uppercase border-b border-gray-200 dark:border-gray-700 pb-2">Tambahkan Input</h3>
                            <button onClick={handleAddText} className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-[#1800ad] dark:hover:border-blue-500 hover:shadow-md transition-all font-bold text-gray-700 dark:text-gray-200 hover:text-[#1800ad] dark:hover:text-blue-400 flex items-center gap-4 group">
                                <span className="bg-gray-50 dark:bg-gray-700 p-2.5 rounded-lg group-hover:bg-[#1800ad]/10 dark:group-hover:bg-blue-500/10 transition-colors"><Type size={18} /></span>
                                Input Tulisan / Teks
                            </button>
                            <label className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-[#1800ad] dark:hover:border-blue-500 hover:shadow-md transition-all font-bold text-gray-700 dark:text-gray-200 hover:text-[#1800ad] dark:hover:text-blue-400 flex items-center gap-4 cursor-pointer group">
                                <span className="bg-gray-50 dark:bg-gray-700 p-2.5 rounded-lg group-hover:bg-[#1800ad]/10 dark:group-hover:bg-blue-500/10 transition-colors"><PenTool size={18} /></span>
                                Tanda Tangan (PNG)
                                <input type="file" className="hidden" accept="image/png" onChange={handleAddSignature} />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg capitalize">{selectedElement.type} Settings</h3>
                            <button onClick={() => setSelectedElementId(null)} className="text-[10px] font-black tracking-wider uppercase text-[#1800ad] dark:text-blue-400 hover:text-[#120085] dark:hover:text-blue-300 bg-[#1800ad]/10 dark:bg-blue-500/10 hover:bg-[#1800ad]/20 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors">Selesai</button>
                        </div>

                        {selectedElement.type === 'text' && (() => {
                            const txt = selectedElement as TextElement;
                            return (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Isi Teks</label>
                                        <textarea 
                                            value={txt.content} 
                                            onChange={e => onUpdateElement(txt.id, { content: e.target.value })} 
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                            rows={3} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                         <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Font Family</label>
                                             <select 
                                                 value={txt.fontFamily} 
                                                 onChange={e => onUpdateElement(txt.id, { fontFamily: e.target.value })} 
                                                 className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                                             >
                                                 <option value="font-sans">Jakarta Sans</option>
                                                 <option value="font-serif">Lora Serif</option>
                                                 <option value="font-mono">Menlo Mono</option>
                                                 <option value="font-hand-1">Indie Flower</option>
                                                 <option value="font-hand-2">Caveat</option>
                                                 <option value="font-hand-3">Patrick Hand</option>
                                                 {customFonts.length > 0 ? (
                                                   customFonts.map((f: FontOption) => (
                                                     <option key={f.value} value={f.value}>{f.label} (Custom)</option>
                                                   ))
                                                 ) : null}
                                             </select>
                                         </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Ukuran Font ({txt.fontSize}px)</label>
                                            <input 
                                                type="number" 
                                                value={txt.fontSize} 
                                                onChange={e => onUpdateElement(txt.id, { fontSize: parseInt(e.target.value) || 12 })} 
                                                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => onUpdateElement(txt.id, { fontWeight: txt.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                            className={`w-full py-2 rounded-lg border text-xs font-bold transition ${txt.fontWeight === 'bold' ? 'bg-[#1800ad] text-white border-[#1800ad]' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-[#1800ad] dark:hover:border-blue-500'}`}
                                        >
                                            Bold
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateElement(txt.id, { fontStyle: txt.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                            className={`w-full py-2 rounded-lg border text-xs font-bold transition ${txt.fontStyle === 'italic' ? 'bg-[#1800ad] text-white border-[#1800ad]' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-[#1800ad] dark:hover:border-blue-500'}`}
                                        >
                                            Italic
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateElement(txt.id, { textDecoration: txt.textDecoration === 'underline' ? 'none' : 'underline' })}
                                            className={`w-full py-2 rounded-lg border text-xs font-bold transition ${txt.textDecoration === 'underline' ? 'bg-[#1800ad] text-white border-[#1800ad]' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-[#1800ad] dark:hover:border-blue-500'}`}
                                        >
                                            Underline
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Opacity ({Math.round((txt.opacity ?? 1) * 100)}%)</label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1"
                                                step="0.05"
                                                value={txt.opacity ?? 1}
                                                onChange={e => onUpdateElement(txt.id, { opacity: parseFloat(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Roughness ({txt.roughness ?? 0})</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={txt.roughness ?? 0}
                                                onChange={e => onUpdateElement(txt.id, { roughness: parseFloat(e.target.value) })}
                                                className="w-full"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Buat teks tampak lebih natural seperti tinta pulpen.</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {selectedElement.type === 'signature' && (() => {
                            const sig = selectedElement as SignatureElement;
                            return (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Opacity ({sig.opacity})</label>
                                        <input 
                                            type="range" 
                                            min="0.1" max="1" 
                                            step="0.1"
                                            value={sig.opacity} 
                                            onChange={e => onUpdateElement(sig.id, { opacity: parseFloat(e.target.value) })} 
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Kasar & Halus Gambar ({sig.roughness})</label>
                                        <input 
                                            type="range" 
                                            min="0" max="5" 
                                            step="0.5"
                                            value={sig.roughness} 
                                            onChange={e => onUpdateElement(sig.id, { roughness: parseFloat(e.target.value) })} 
                                            className="w-full"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Mengatur tekstur gambar menjadi kasar atau bersih.</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-y-3">
                <button 
                    onClick={handleSaveProject}
                    disabled={saving}
                    className="w-full bg-[#1800ad] dark:bg-blue-600 hover:bg-[#120085] dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-lg">💾</span> {saving ? 'Menyimpan...' : 'Simpan Project'}
                </button>
                <button onClick={() => setShowPaymentModal('pdf')} className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                    <FileText size={18} /> Ekspor PDF (Rp 2.000)
                </button>
                <button onClick={() => setShowPaymentModal('png')} className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                    <ImageIcon size={18} /> Ekspor PNG (Rp 2.000)
                </button>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 flex justify-center items-start p-10 relative custom-scrollbar" onClick={() => setSelectedElementId(null)}>
            <div 
                ref={canvasRef}
                className="bg-white shadow-xl relative"
                style={{ 
                    width: project.document.width, 
                    height: project.document.height,
                    backgroundColor: project.document.backgroundColor,
                    transform: `scale(${canvasScale})`,
                    transformOrigin: 'top center',
                    cursor: 'default'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(null);
                }}
            >
                {/* Background Template Layer (Locked) — each element uses its own opacity */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    {templateNodes}
                </div>

                {/* Project Elements Layer */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    {project.projectElements.map(el => (
                        <ElementNode 
                            key={el.id}
                            element={el}
                            isSelected={selectedElementId === el.id}
                            onSelect={() => setSelectedElementId(el.id)}
                            onUpdate={onUpdateElement}
                            onRemove={onRemoveElement}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center border border-gray-100 dark:border-gray-700">
                    <button onClick={() => setShowPaymentModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                    <h3 className="text-2xl font-black mb-2">Pembayaran QRIS</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Bayar Rp 2.000 untuk mengunduh dokumen Anda.</p>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border-2 border-dashed border-gray-200">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY_JAGONOTA_${project.id}`} alt="QRIS" className="w-48 h-48 mx-auto" />
                    </div>

                    <button 
                        onClick={() => {
                            const format = showPaymentModal;
                            setShowPaymentModal(null);
                            handleDownload(format);
                        }}
                        className="w-full bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg"
                    >
                        Saya Sudah Bayar
                    </button>
                </div>
            </div>
        )}

    </div>
  );
}

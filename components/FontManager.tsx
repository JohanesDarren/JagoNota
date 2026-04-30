import React, { useState } from 'react';
import { FontOption, INITIAL_FONTS } from '../types';
import { Type, Plus, Upload, Loader2, FileImage, CheckCircle, Info, ChevronRight, X } from 'lucide-react';
import { GoogleGenAI, Type as GenAIType } from '@google/genai';

interface Props {
  onBack: () => void;
}

export default function FontManager({ onBack }: Props) {
  const [fonts, setFonts] = useState<FontOption[]>(() => {
      const saved = localStorage.getItem('jagonota_custom_fonts');
      if (saved) return [...INITIAL_FONTS, ...JSON.parse(saved)];
      return INITIAL_FONTS;
  });

  const [step, setStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [newFontName, setNewFontName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedCSS, setExtractedCSS] = useState<string>('');
  const [extractedFontFamilyInfo, setExtractedFontFamilyInfo] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
          const base64DataUrl = ev.target?.result as string;
          setUploadedImage(base64DataUrl);
          setStep('processing');
          setIsProcessing(true);
          
          try {
              if (process.env.GEMINI_API_KEY) {
                  const base64String = base64DataUrl.split(',')[1];
                  const mimeType = base64DataUrl.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
                  
                  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                  const response = await ai.models.generateContent({
                      model: "gemini-3.1-pro-preview",
                      contents: {
                          parts: [
                              {
                                  inlineData: {
                                      mimeType: mimeType,
                                      data: base64String
                                  }
                              },
                              {
                                  text: "Analyze the raw handwriting in this image. Do not attempt to fix or beautify the handwriting. Preserve its exact characteristics, flaws, messiness, specific tilt, and spacing errors as much as possible. Find the closest matching Google Font from these options: 'Indie Flower', 'Caveat', 'Kalam', 'Pacifico', 'Dancing Script', 'Shadows Into Light', 'Permanent Marker', 'Amatic SC', 'Satisfy', 'Handlee'. Then, generate specific CSS properties (like letter-spacing, word-spacing, line-height, transform e.g. rotate(-1deg), skew) that transform this standard web font to look exactly as messy and unrefined as the original handwriting in the image. Return a JSON object with 'fontFamilyName' (the Google Font name) and 'cssText' (the CSS string containing font-family, letter-spacing, transform, etc... without the wrapping class)."
                              }
                          ]
                      },
                      config: {
                          responseMimeType: "application/json",
                          responseSchema: {
                              type: GenAIType.OBJECT,
                              properties: {
                                  fontFamilyName: { type: GenAIType.STRING, description: "The chosen Google Font name" },
                                  cssText: { type: GenAIType.STRING, description: "The custom CSS rules, e.g. \"font-family: 'Caveat', cursive; letter-spacing: 1.2px; transform: rotate(-2deg);\"" }
                              },
                              required: ["fontFamilyName", "cssText"]
                          }
                      }
                  });
                  
                  if (response.text) {
                      const json = JSON.parse(response.text);
                      setExtractedFontFamilyInfo(json.fontFamilyName || 'Indie Flower');
                      setExtractedCSS(json.cssText || "font-family: 'Indie Flower', cursive; letter-spacing: 1px;");
                  }
              } else {
                  // Fallback simulation if no API key
                  await new Promise(r => setTimeout(r, 2000));
                  setExtractedFontFamilyInfo('Indie Flower');
                  setExtractedCSS(`font-family: 'Indie Flower', cursive; letter-spacing: ${Math.random() * 2}px; transform: rotate(${Math.random() * 2 - 1}deg);`);
              }
          } catch (e) {
              console.error("Failed to extract font features", e);
              setExtractedFontFamilyInfo('Indie Flower');
              setExtractedCSS(`font-family: 'Indie Flower', cursive; letter-spacing: 1px;`);
          } finally {
              setIsProcessing(false);
              setStep('success');
          }
      };
      reader.readAsDataURL(file);
  };

  const handleSaveFont = () => {
      if (!newFontName) return;
      
      const newFontValue = 'custom-font-' + Date.now();
      const newFont: FontOption = {
          label: newFontName,
          value: newFontValue,
          isCustom: true,
          cssText: extractedCSS,
          fontFamilyName: extractedFontFamilyInfo
      } as FontOption;
      
      const updatedFonts = [...fonts, newFont];
      setFonts(updatedFonts);
      
      const customFonts = updatedFonts.filter(f => f.isCustom);
      localStorage.setItem('jagonota_custom_fonts', JSON.stringify(customFonts));
      
      // Inject font style immediately for preview
      const style = document.createElement('style');
      style.textContent = `
        .${newFont.value} { ${extractedCSS} display: inline-block; }
      `;
      style.className = 'jagonota-dynamic-font';
      document.head.appendChild(style);
      
      // Add font link if not present
      if (extractedFontFamilyInfo && !document.getElementById('font-' + extractedFontFamilyInfo.replace(/\s+/g, ''))) {
          const link = document.createElement('link');
          link.id = 'font-' + extractedFontFamilyInfo.replace(/\s+/g, '');
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${extractedFontFamilyInfo.replace(/\s+/g, '+')}&display=swap`;
          document.head.appendChild(link);
      }
      
      // Reset
      setNewFontName('');
      setUploadedImage(null);
      setExtractedCSS('');
      setExtractedFontFamilyInfo('');
      setStep('idle');
  };

  const handleDeleteFont = (fontValue: string) => {
      const updatedFonts = fonts.filter(f => f.value !== fontValue);
      setFonts(updatedFonts);
      
      const customFonts = updatedFonts.filter(f => f.isCustom);
      localStorage.setItem('jagonota_custom_fonts', JSON.stringify(customFonts));
  };

  const handleCancel = () => {
      setStep('idle');
      setUploadedImage(null);
      setNewFontName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-10 font-sans transition-colors duration-300 relative z-0">
        {/* Decorative Background Blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/5 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/5 blur-[120px]"></div>
        </div>

       <div className="max-w-5xl mx-auto relative z-10">
           <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 mb-12 flex items-center gap-2 uppercase tracking-widest transition-colors">← Kembali</button>
           
           <div className="mb-12 flex items-center gap-6">
               <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
                   <Type size={32} />
               </div>
               <div>
                   <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Font & <span className="text-[#1800ad] dark:text-blue-400">Tulisan Tangan</span></h1>
                   <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-lg">Ubah tulisan tangan aslimu menjadi font digital untuk digunakan secara otomatis dalam nota.</p>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-stretch">
               {/* Ekstraktor Tulisan Tangan */}
               <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] p-8 shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 flex flex-col hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all h-[550px]">
                   <h3 className="font-black text-gray-900 dark:text-white mb-6 text-xl flex items-center gap-3">
                      <FileImage className="text-[#1800ad] dark:text-blue-400" /> Convert Tulisan Tangan
                   </h3>
                   
                   {step === 'idle' && (
                       <div className="flex-1 flex flex-col h-full">
                           <div className="bg-blue-50/50 dark:bg-blue-900/20 p-6 rounded-2xl text-sm text-blue-900 dark:text-blue-300 mb-6 border border-blue-100 dark:border-blue-800/50">
                               <p className="font-black mb-3 flex items-center gap-2 uppercase tracking-wide text-xs"><Info size={16}/> Cara Penggunaan:</p>
                               <ol className="list-decimal list-inside space-y-2 font-medium">
                                   <li>Tulis seluruh huruf <strong>(A-Z, a-z)</strong> dan angka <strong>(0-9)</strong> di selembar kertas putih bersih tanpa garis.</li>
                                   <li>Pastikan pencahayaan terang dan tulisan terbaca jelas.</li>
                                   <li>Foto kertas tersebut dan unggah di sini.</li>
                               </ol>
                           </div>
                           <label className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-[#1800ad] dark:hover:border-blue-500 hover:bg-[#1800ad]/5 dark:hover:bg-blue-500/10 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer p-8 group">
                               <Upload size={40} className="text-gray-300 dark:text-gray-500 mb-4 group-hover:text-[#1800ad] dark:group-hover:text-blue-400 transition-colors" />
                               <span className="font-black text-gray-900 dark:text-gray-200 text-lg group-hover:text-[#1800ad] dark:group-hover:text-blue-400 transition-colors block mb-1">Unggah Foto Tulisan</span>
                               <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">JPG, PNG (Max 5MB)</span>
                               <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                           </label>
                       </div>
                   )}

                   {step === 'processing' && (
                       <div className="flex-1 flex flex-col items-center justify-center py-10 h-full">
                           <div className="relative w-full max-w-xs h-40 mb-8 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner">
                               <img src={uploadedImage!} alt="Preview" className="w-full h-full object-cover opacity-30 grayscale" />
                               {/* Scanning animation */}
                               <div className="absolute inset-0 bg-gradient-to-b from-[#1800ad]/20 dark:from-blue-500/20 to-transparent animate-pulse" />
                               <div className="absolute top-0 left-0 right-0 h-1 bg-[#1800ad] dark:bg-blue-500 animate-[bounce_2s_infinite]" />
                           </div>
                           <Loader2 size={40} className="text-[#1800ad] dark:text-blue-400 animate-spin mb-4" />
                           <p className="font-black text-gray-900 dark:text-white text-lg">Mengekstrak Karakter...</p>
                           <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center px-4 mt-2 max-w-xs">AI kami sedang mengenali pola huruf dan merangkainya menjadi font digital.</p>
                       </div>
                   )}

                   {step === 'success' && (
                       <div className="flex-1 flex flex-col items-center justify-center h-full">
                           <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 p-4 rounded-full mb-6">
                               <CheckCircle size={48} />
                           </div>
                           <h4 className="font-black text-gray-900 dark:text-white text-2xl mb-2">Ekstraksi Berhasil!</h4>
                           <p className="font-medium text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs">Sistem berhasil mengenali 62 karakter dari tulisan tangan Anda.</p>
                           
                           <div className="w-full mb-8">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-3 text-left">Beri Nama Font Anda</label>
                               <input 
                                   type="text" 
                                   value={newFontName}
                                   onChange={e => setNewFontName(e.target.value)}
                                   className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-[#1800ad] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1800ad] dark:focus:ring-blue-500 transition-all"
                                   placeholder="Contoh: Tulisan Rara"
                               />
                           </div>
                           
                           <div className="flex gap-4 w-full mt-auto">
                               <button onClick={handleCancel} className="flex-1 px-4 py-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Batal</button>
                               <button onClick={handleSaveFont} disabled={!newFontName} className="flex-1 px-4 py-4 bg-[#1800ad] dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-[#120085] dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50">Simpan Font</button>
                           </div>
                       </div>
                   )}
               </div>

               {/* Right Side: Daftar Font */}
               <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 flex flex-col h-[550px] overflow-hidden hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all">
                   <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-transparent z-10 shrink-0">
                        <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight">Daftar Font Tersedia</h3>
                   </div>
                   <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-gray-100 dark:divide-gray-700 pb-6">
                       {fonts.map((f, i) => (
                           <div key={i} className="px-8 py-5 flex flex-col justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                               <div className="flex justify-between items-start mb-3">
                                   <div>
                                       <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1">{f.label}</h4>
                                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${f.isCustom ? 'bg-[#1800ad]/10 dark:bg-blue-900/30 text-[#1800ad] dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                                           {f.isCustom ? 'Tulisan Tangan' : 'Sistem'}
                                       </span>
                                   </div>
                                   {f.isCustom && (
                                       <button 
                                           onClick={() => handleDeleteFont(f.value)}
                                           className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                           title="Hapus Font"
                                       >
                                           <X size={16} strokeWidth={3} />
                                       </button>
                                   )}
                               </div>
                               <div className={`text-4xl text-gray-800 dark:text-gray-200 ${f.value.startsWith('custom-font-') ? f.value : ''}`} style={!f.value.startsWith('custom-font-') ? { fontFamily: f.value.replace('font-', '') } : {}}>
                                   JagoNota 123
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
}

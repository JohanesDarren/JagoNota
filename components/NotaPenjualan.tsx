import React from 'react';
import { NotaData, UploadedImage, HandwritingFont, TemplateCustomization } from '../types';
import DraggableResizable from './DraggableResizable';
import { formatCurrency } from '../utils';

interface Props {
  data: NotaData;
  images: UploadedImage[];
  font: HandwritingFont;
  parentRef: React.RefObject<HTMLDivElement>;
  onUpdateImage: (id: string, data: Partial<UploadedImage>) => void;
  onRemoveImage: (id: string) => void;
  isEditing: boolean;
  selectedImageId?: string | null;
  onSelectImage?: (id: string) => void;
  customization?: TemplateCustomization;
}

const NotaPenjualan: React.FC<Props> = ({ 
  data, 
  images, 
  font, 
  parentRef, 
  onUpdateImage, 
  onRemoveImage, 
  isEditing,
  selectedImageId,
  onSelectImage,
  customization
}) => {
  const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Helper to adjust font size based on text length
  const getDynamicFontSize = (text: string, baseSize: string = 'text-lg') => {
    if (text.length > 50) return 'text-sm';
    if (text.length > 30) return 'text-base';
    return baseSize;
  };

  const c = customization || {};
  const bgStyle = c.background ? { backgroundImage: `url(${c.background})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: c.backgroundOpacity ?? 0.1 } : {};

  return (
    <div 
      ref={parentRef}
      className={`p-8 w-[165mm] min-h-[215mm] leading-normal relative mx-auto overflow-hidden paper-container print:shadow-none print:border-none print:m-0
        ${c.layoutStyle === 'minimalist' ? 'bg-white border' : 
          c.layoutStyle === 'modern' ? 'bg-gray-50 rounded-xl shadow-lg border border-gray-100' : 
          'paper-scanned'}
      `}
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Background Watermark */}
      {c.background && (
        <div className="absolute inset-0 pointer-events-none z-0" style={bgStyle} />
      )}

      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header Layout Khusus Nota Penjualan */}
        {c.headerAlignment === 'center' && (
             <div className="flex flex-col items-center justify-center w-full mb-6">
                 {c.logo && <img src={c.logo} alt="Logo" className="h-16 object-contain mb-4" />}
             </div>
        )}
        
        <div className={`flex justify-between items-start mb-4 ${c.headerAlignment !== 'center' ? 'mt-8' : ''} ${c.logoAlignment === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
            
            {/* Left: Nota No */}
            <div className={`w-1/3 pt-10 ${c.logoAlignment === 'right' ? 'text-right' : 'text-left'}`}>
               <div className={`flex items-center gap-1 font-bold text-sm ${c.logoAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                   <span className="uppercase">NOTA NO.</span>
                   <span className={`border-b min-w-[100px] px-2 ${font} text-lg leading-none pb-1`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor} : {borderBottomStyle: 'dotted', borderBottomColor: 'black', color: '#1e3a8a'}}>
                       {data.notaNumber}
                   </span>
               </div>
            </div>

            {/* Right: Kepada (Indented style like image) */}
            <div className={`w-1/2`}>
                {c.logo && c.headerAlignment !== 'center' ? (
                  <div className={`flex ${c.logoAlignment === 'right' ? 'justify-start' : 'justify-end'} mb-4`}>
                    <img src={c.logo} alt="Logo" className="h-16 object-contain" />
                  </div>
                ) : null}
                <div className="flex items-end mb-1">
                    <span className="text-sm w-16 text-right mr-2 font-bold">Kepada</span>
                    <div className="border-b flex-1 h-5" style={c.primaryColor ? {borderColor: c.primaryColor, borderBottomStyle: 'solid'} : {borderColor: '#9ca3af', borderBottomStyle: 'dotted'}}></div>
                </div>
                <div className="flex flex-col pl-[4.5rem] relative">
                    {/* Customer Name placed over the lines with dynamic sizing */}
                     <div className={`absolute top-[-1.6rem] left-[4.5rem] w-full ${font} ${getDynamicFontSize(data.customerName, 'text-xl')} break-words leading-[1.6rem] pr-4 z-10`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                        {data.customerName}
                     </div>
                     
                     {/* Extra dotted lines with subtle shadow */}
                     <div className="border-b w-full h-6 row-scanned" style={c.primaryColor ? {borderColor: c.primaryColor, borderBottomStyle: 'solid'} : {borderColor: '#9ca3af', borderBottomStyle: 'dotted'}}></div>
                     <div className="border-b w-full h-6 row-scanned" style={c.primaryColor ? {borderColor: c.primaryColor, borderBottomStyle: 'solid'} : {borderColor: '#9ca3af', borderBottomStyle: 'dotted'}}></div>
                     <div className="border-b w-full h-6 row-scanned flex justify-end items-end" style={c.primaryColor ? {borderColor: c.primaryColor, borderBottomStyle: 'solid'} : {borderColor: '#9ca3af', borderBottomStyle: 'dotted'}}>
                          <span className={`text-xs ${font} pr-1 pb-1`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#4b5563'}}>{data.date}</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Table Sederhana dengan Garis Berbayang */}
        <div className="w-full border-t-2 border-b-2 mt-2" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}>
          {/* Table Header */}
          <div className="flex border-b font-bold text-center text-[10px] sm:text-xs uppercase" style={c.primaryColor ? {borderColor: c.primaryColor, backgroundColor: c.secondaryColor || '#f9fafb'} : {borderColor: 'rgba(0,0,0,0.6)', backgroundColor: 'rgba(249, 250, 251, 0.3)'}}>
            <div className="w-[12%] border-r py-1 shrink-0" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}>BANYAKNYA</div>
            <div className="w-[48%] border-r py-1 shrink-0" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}>NAMA PRODUK</div>
            <div className="w-[20%] border-r py-1 shrink-0" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}>HARGA</div>
            <div className="w-[20%] py-1 shrink-0">JUMLAH</div>
          </div>

          {/* Items */}
          {data.items.map((item, idx) => (
            <div key={item.id || idx} className="flex border-b text-sm relative min-h-[2.4rem] py-0 row-scanned items-stretch" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}>
              <div className={`w-[12%] border-r px-1 flex items-center justify-center ${font} text-xl shrink-0`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)', color: '#1e3a8a'}}>
                  {item.qty}
              </div>
              <div className={`w-[48%] border-r px-2 py-1 flex items-center ${font} ${getDynamicFontSize(item.name, 'text-xl')} shrink-0 break-words leading-tight tracking-tight`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)', color: '#1e3a8a'}}>
                  {item.name}
              </div>
              <div className={`w-[20%] border-r px-2 flex items-center justify-end ${font} text-xl shrink-0`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)', color: '#1e3a8a'}}>
                  {formatCurrency(item.price).replace('Rp', '').trim()}
              </div>
              <div className={`w-[20%] px-2 flex items-center justify-end ${font} text-xl shrink-0`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                  {formatCurrency(item.price * item.qty).replace('Rp', '').trim()}
              </div>
            </div>
          ))}

          {/* Empty rows filler */}
          {Array.from({ length: Math.max(0, 14 - data.items.length) }).map((_, i) => (
               <div key={`empty-${i}`} className="flex border-b text-sm h-8 row-scanned" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}>
                  <div className="w-[12%] border-r shrink-0" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}></div>
                  <div className="w-[48%] border-r shrink-0" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}></div>
                  <div className="w-[20%] border-r shrink-0" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}></div>
                  <div className="w-[20%] shrink-0"></div>
               </div>
          ))}
        </div>
          
        {/* Footer Total */}
        <div className="flex h-12 w-full items-center">
             <div className="w-[60%] shrink-0"></div>
             <div className="w-[20%] flex items-center justify-end font-bold text-sm pr-2 shrink-0">
                 Jumlah Rp.
             </div>
             <div className={`w-[20%] border-b-2 border-double flex items-center justify-end px-2 font-bold ${font} text-2xl shrink-0 h-full`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)', color: '#1e3a8a'}}>
                  {formatCurrency(totalAmount).replace('Rp', '').trim()}
             </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between mt-12 px-8 text-sm">
            <div className="text-center">
                <p className="mb-16 font-bold">Tanda Terima</p>
                <div className="border-t w-32" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}></div>
            </div>
            
            <div className="text-center">
                <p className="mb-12 font-bold">Hormat Kami,</p>
                <div className="relative min-h-[1.5rem] flex flex-col items-center">
                    <p className={`font-bold ${font} text-2xl relative z-10 -mb-1`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>{data.signerName}</p>
                    <div className="border-t w-32 mt-1" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(0,0,0,0.6)'}}></div>
                </div>
            </div>
        </div>
      </div>

      {images.map(img => (
        <DraggableResizable 
            key={img.id} 
            image={img} 
            parentRef={parentRef} 
            onUpdate={onUpdateImage} 
            onRemove={onRemoveImage} 
            isEditing={isEditing}
            isSelected={img.id === selectedImageId}
            onSelect={onSelectImage}
        />
      ))}

    </div>
  );
};

export default NotaPenjualan;
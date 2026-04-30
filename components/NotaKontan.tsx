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

const NotaKontan: React.FC<Props> = ({ 
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
  const remaining = totalAmount - data.downPayment;

  // Helper to adjust font size based on text length
  const getDynamicFontSize = (text: string, baseSize: string = 'text-lg') => {
    if (text.length > 40) return 'text-sm';
    if (text.length > 25) return 'text-base';
    return baseSize;
  };

  const c = customization || {};
  const primaryStyle = c.primaryColor ? { borderColor: c.primaryColor, color: c.primaryColor } : {};
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

      {/* Content wrapper to stay above background */}
      <div className="relative z-10 w-full h-full flex flex-col">
          {/* Header Toko */}
          <div className={`flex flex-col sm:flex-row justify-between w-full mb-6 gap-4 border-b pb-4 ${c.layoutStyle === 'minimalist' ? 'border-gray-200' : 'border-transparent'}`} style={c.primaryColor && c.layoutStyle === 'minimalist' ? {borderBottomColor: c.primaryColor} : {}}>
            <div className={`w-full sm:w-1/2 flex flex-col ${c.headerAlignment === 'center' ? 'items-center text-center mx-auto' : c.headerAlignment === 'right' ? 'items-end text-right ml-auto' : 'items-start text-left'}`}>
              <div className={`flex w-full ${c.headerAlignment === 'center' ? 'justify-center' : c.headerAlignment === 'right' ? 'justify-end' : 'justify-start'} ${c.logoAlignment === 'right' ? 'flex-row-reverse' : 'flex-row'} items-center gap-4 mb-2`}>
                  {c.logo && (
                    <img src={c.logo} alt="Logo" className="h-16 object-contain" />
                  )}
                  {(!c.logo || c.layoutStyle !== 'minimalist') && (
                    <div className={`flex flex-col ${c.headerAlignment === 'center' ? 'items-center' : c.headerAlignment === 'right' ? 'items-end' : 'items-start'}`}>
                        <h1 className="text-2xl font-bold uppercase tracking-wider text-blue-900 leading-tight" style={c.primaryColor ? {color: c.primaryColor} : {}}>{data.companyName}</h1>
                        <p className="text-xs font-bold text-gray-500 tracking-widest">{data.companySubtitle}</p>
                    </div>
                  )}
              </div>
              <p className="text-sm border-t border-gray-200 pt-1 whitespace-pre-line text-gray-700 leading-tight w-full" style={c.primaryColor ? {borderTopColor: c.primaryColor + '40'} : {}}>{data.companyAddress}</p>
            </div>
            
            {c.headerAlignment !== 'center' && (
                <div className="w-full sm:w-1/2 text-right flex flex-col items-end justify-start">
                   <div className="flex justify-between sm:justify-end items-center mb-2 w-full">
                     <span className="mr-2 text-sm font-bold text-gray-600">Tgl.</span>
                     <span className={`border-b border-dotted border-gray-400 min-w-[120px] text-right sm:text-center px-2 ${font} text-lg text-blue-800 pb-1 flex-1 sm:flex-none`} style={c.primaryColor ? {color: c.primaryColor} : {}}>
                        {data.date}
                     </span>
                   </div>
                   <div className="flex justify-between sm:justify-end items-center mb-2 w-full">
                     <span className="mr-2 text-sm font-bold text-gray-600">Kepada Yth.</span>
                     <div className={`border-b border-dotted border-gray-400 min-w-[150px] text-right sm:text-center px-2 ${font} ${getDynamicFontSize(data.customerName)} text-blue-800 break-words leading-tight max-w-[200px] pb-1 flex-1 sm:flex-none`} style={c.primaryColor ? {color: c.primaryColor} : {}}>
                       {data.customerName}
                     </div>
                   </div>
                </div>
            )}
          </div>
          
          {c.headerAlignment === 'center' && (
              <div className="flex justify-between border-b pb-4 mb-4 gap-4" style={c.primaryColor ? {borderBottomColor: c.primaryColor + '40'} : {}}>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-gray-600">Tgl.</span>
                     <span className={`border-b border-dotted border-gray-400 min-w-[120px] text-center px-2 ${font} text-lg text-blue-800 pb-1`} style={c.primaryColor ? {color: c.primaryColor} : {}}>
                        {data.date}
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-gray-600">Kepada Yth.</span>
                     <div className={`border-b border-dotted border-gray-400 min-w-[150px] text-center px-2 ${font} ${getDynamicFontSize(data.customerName)} text-blue-800 pb-1`} style={c.primaryColor ? {color: c.primaryColor} : {}}>
                       {data.customerName}
                     </div>
                   </div>
              </div>
          )}

          {/* Judul Tengah */}
          <div className="text-center mb-4">
            <div className="inline-block px-4 pb-1 border-b-4 border-double border-gray-800" style={c.primaryColor ? {borderBottomColor: c.primaryColor} : {}}>
               <h2 className="text-xl font-bold uppercase leading-none text-gray-900">NOTA KONTAN</h2>
            </div>
          </div>

          {/* Table */}
          <div className={`w-full border-2 mt-2 flex-grow flex flex-col ${c.layoutStyle === 'minimalist' ? 'border-gray-300' : 'border-scanned border-gray-800'}`} style={c.primaryColor ? {borderColor: c.primaryColor} : {}}>
            {/* Table Header */}
            <div className="flex border-b-2 font-bold text-center bg-gray-100/50 text-sm uppercase shrink-0" style={c.primaryColor ? {borderBottomColor: c.primaryColor} : c.layoutStyle === 'minimalist' ? {borderBottomColor: '#d1d5db'} : {borderBottomColor: 'rgba(0,0,0,0.6)'}}>
              <div className="w-[12%] border-r p-2 shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : c.layoutStyle === 'minimalist' ? {borderRightColor: '#d1d5db'} : {borderRightColor: 'rgba(0,0,0,0.6)'}}>Banyak</div>
              <div className="w-[48%] border-r p-2 shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : c.layoutStyle === 'minimalist' ? {borderRightColor: '#d1d5db'} : {borderRightColor: 'rgba(0,0,0,0.6)'}}>Nama Barang</div>
              <div className="w-[20%] border-r p-2 shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : c.layoutStyle === 'minimalist' ? {borderRightColor: '#d1d5db'} : {borderRightColor: 'rgba(0,0,0,0.6)'}}>Harga</div>
              <div className="w-[20%] p-2 shrink-0">Jumlah</div>
            </div>

            {/* Items */}
            {data.items.map((item, idx) => (
              <div key={item.id || idx} className="flex border-b border-gray-400 text-sm relative hover:bg-gray-50/50 row-scanned items-stretch min-h-[2.6rem] py-0 shrink-0">
                <div className={`w-[12%] border-r px-1 text-center flex items-center justify-center ${font} text-xl shrink-0`} style={c.primaryColor ? {color: c.primaryColor, borderRightColor: c.primaryColor} : {color: '#1e3a8a', borderRightColor: 'rgba(0,0,0,0.6)'}}>
                    {item.qty}
                </div>
                <div className={`w-[48%] border-r px-3 py-1 flex items-center ${font} ${getDynamicFontSize(item.name, 'text-xl')} shrink-0 break-words leading-tight tracking-tight`} style={c.primaryColor ? {color: c.primaryColor, borderRightColor: c.primaryColor} : {color: '#1e3a8a', borderRightColor: 'rgba(0,0,0,0.6)'}}>
                    {item.name}
                </div>
                <div className={`w-[20%] border-r px-2 flex items-center justify-end ${font} text-xl shrink-0`} style={c.primaryColor ? {color: c.primaryColor, borderRightColor: c.primaryColor} : {color: '#1e3a8a', borderRightColor: 'rgba(0,0,0,0.6)'}}>
                    {formatCurrency(item.price).replace('Rp', '').trim()}
                </div>
                <div className={`w-[20%] px-2 flex items-center justify-end ${font} text-xl shrink-0`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                    {formatCurrency(item.price * item.qty).replace('Rp', '').trim()}
                </div>
              </div>
            ))}

            {/* Empty rows filler */}
            {Array.from({ length: Math.max(0, 10 - data.items.length) }).map((_, i) => (
                 <div key={`empty-${i}`} className="flex border-b border-gray-300 text-sm h-10 row-scanned shrink-0">
                    <div className="w-[12%] border-r shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : {borderRightColor: 'rgba(0,0,0,0.6)'}}></div>
                    <div className="w-[48%] border-r shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : {borderRightColor: 'rgba(0,0,0,0.6)'}}></div>
                    <div className="w-[20%] border-r shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : {borderRightColor: 'rgba(0,0,0,0.6)'}}></div>
                    <div className="w-[20%] shrink-0"></div>
                 </div>
            ))}
            
            {/* Footer Rows */}
            <div className="flex border-t-2 mt-auto" style={c.primaryColor ? {borderTopColor: c.primaryColor} : c.layoutStyle === 'minimalist' ? {borderTopColor: '#d1d5db'} : {borderTopColor: 'rgba(0,0,0,0.6)'}}>
               {/* Left Info Box */}
               <div className="w-[60%] border-r p-2 flex flex-col justify-between relative shrink-0" style={c.primaryColor ? {borderRightColor: c.primaryColor} : c.layoutStyle === 'minimalist' ? {borderRightColor: '#d1d5db'} : {borderRightColor: 'rgba(0,0,0,0.6)'}}>
                    <div className="flex justify-between items-end mt-4 px-4">
                        <div className="text-center w-2/5 relative">
                            <p className="mb-12 text-sm">Hormat Kami,</p>
                            <p className={`border-t w-full font-bold text-center pt-1 ${font} text-2xl`} style={c.primaryColor ? {color: c.primaryColor, borderTopColor: c.primaryColor} : {borderTopColor: 'rgba(0,0,0,0.6)', color: '#1e3a8a'}}>{data.signerName}</p>
                        </div>
                        <div className="w-3/5 pl-6">
                             <div className="border border-gray-400 bg-gray-50/50 p-2 text-[9px] leading-tight text-gray-500 italic shadow-inner">
                                <span className="font-bold not-italic text-black">PERHATIAN :</span><br/>
                                Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan kecuali ada perjanjian terlebih dahulu.
                            </div>
                        </div>
                    </div>
               </div>

               {/* Right Totals */}
               <div className="w-[40%] flex flex-col text-sm shrink-0">
                  <div className="flex border-b border-scanned border-gray-600 h-10 items-center bg-gray-50/30">
                      <div className="w-1/3 pl-2 font-bold">Total</div>
                      <div className="w-1/6 text-right pr-1 text-xs">Rp</div>
                      <div className={`w-1/2 text-right pr-2 font-bold ${font} text-2xl`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                        {formatCurrency(totalAmount).replace('Rp', '').trim()}
                      </div>
                  </div>
                  <div className="flex border-b border-scanned border-gray-600 h-10 items-center">
                      <div className="w-1/3 pl-2">DP</div>
                      <div className="w-1/6 text-right pr-1 text-xs">Rp</div>
                      <div className={`w-1/2 text-right pr-2 ${font} text-2xl`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                        {data.downPayment > 0 ? formatCurrency(data.downPayment).replace('Rp', '').trim() : '-'}
                      </div>
                  </div>
                  <div className="flex h-10 items-center font-bold" style={c.secondaryColor ? {backgroundColor: c.secondaryColor} : {backgroundColor: 'rgba(219, 234, 254, 0.3)'}}>
                      <div className="w-1/3 pl-2">Sisa</div>
                      <div className="w-1/6 text-right pr-1 text-xs">Rp</div>
                      <div className={`w-1/2 text-right pr-2 ${font} text-2xl`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                        {remaining > 0 ? formatCurrency(remaining).replace('Rp', '').trim() : '-'}
                      </div>
                  </div>
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

export default NotaKontan;
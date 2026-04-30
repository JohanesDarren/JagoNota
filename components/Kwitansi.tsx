import React from 'react';
import { KwitansiData, UploadedImage, HandwritingFont, TemplateCustomization } from '../types';
import DraggableResizable from './DraggableResizable';
import { formatCurrency } from '../utils';

interface Props {
  data: KwitansiData;
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

const Kwitansi: React.FC<Props> = ({ 
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
  const c = customization || {};
  const bgStyle = c.background ? { backgroundImage: `url(${c.background})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: c.backgroundOpacity ?? 0.1 } : {};

  return (
    <div 
      ref={parentRef}
      className={`relative w-[240mm] min-h-[95mm] shadow-lg mx-auto overflow-hidden paper-container flex print:shadow-none print:border-none print:m-0
        ${c.layoutStyle === 'minimalist' ? 'bg-white border border-gray-200' : 
          c.layoutStyle === 'modern' ? 'bg-blue-50 rounded-xl overflow-hidden shadow-xl' : 
          'bg-kwitansi-blue'}`}
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      {/* Background Watermark */}
      {c.background && (
        <div className="absolute inset-0 pointer-events-none z-0" style={bgStyle} />
      )}

      {/* Bonggol Left Side */}
      <div className={`w-[12%] relative border-r-2 border-dotted z-10 flex flex-col justify-between items-center py-4 px-2 shrink-0 ${c.layoutStyle === 'minimalist' ? 'bg-gray-50 border-gray-300' : 'bg-bonggol border-blue-400'}`} style={c.primaryColor ? {borderColor: c.primaryColor} : {}}>
         <div className="w-16 h-16 rounded-full border-[3px] border-double flex items-center justify-center mb-2" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(96, 165, 250, 0.5)'}}>
            <div className="w-10 h-10 rounded-full border" style={c.primaryColor ? {borderColor: c.primaryColor, backgroundColor: c.secondaryColor || 'rgba(96, 165, 250, 0.1)'} : {borderColor: '#93c5fd', backgroundColor: 'rgba(219, 234, 254, 0.3)'}}></div>
         </div>
         <div className="w-16 h-16 rounded-full border-[3px] border-double flex items-center justify-center mb-2" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(96, 165, 250, 0.5)'}}>
            <div className="w-10 h-10 rounded-full border" style={c.primaryColor ? {borderColor: c.primaryColor, backgroundColor: c.secondaryColor || 'rgba(96, 165, 250, 0.1)'} : {borderColor: '#93c5fd', backgroundColor: 'rgba(219, 234, 254, 0.3)'}}></div>
         </div>
         <div className="w-16 h-16 rounded-full border-[3px] border-double flex items-center justify-center" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: 'rgba(96, 165, 250, 0.5)'}}>
            <div className="w-10 h-10 rounded-full border" style={c.primaryColor ? {borderColor: c.primaryColor, backgroundColor: c.secondaryColor || 'rgba(96, 165, 250, 0.1)'} : {borderColor: '#93c5fd', backgroundColor: 'rgba(219, 234, 254, 0.3)'}}></div>
         </div>
      </div>

      <div className="w-[88%] p-5 relative flex flex-col justify-between z-10 shrink-0">
          
          {c.headerAlignment === 'center' && c.logo && (
              <div className="flex justify-center w-full mb-2">
                  <img src={c.logo} alt="Logo" className="h-12 object-contain" />
              </div>
          )}

          <div className={`flex justify-between items-start mb-2 ${c.logoAlignment === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex items-end mb-2 ${c.headerAlignment === 'right' ? 'w-full justify-end' : c.headerAlignment === 'center' ? 'w-full justify-center' : 'justify-start'}`}>
                <span className="font-bold text-black text-sm w-12 whitespace-nowrap">No.</span>
                <div className={`border-b min-w-[120px] px-2 ${font} text-lg leading-none`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor, borderBottomStyle: 'solid'} : {borderBottomStyle: 'dotted', borderBottomColor: 'black', color: '#1e3a8a'}}>
                    {data.no}
                </div>
            </div>
            {c.logo && c.headerAlignment !== 'center' && (
                <div className={`flex ${c.logoAlignment === 'left' ? 'justify-start' : 'justify-end'}`}>
                    <img src={c.logo} alt="Logo" className="h-12 object-contain" />
                </div>
            )}
          </div>

          <div className="space-y-1">
              <div className="flex items-end">
                  <span className="font-bold text-black text-sm w-36 whitespace-nowrap shrink-0">Sudah terima dari</span>
                  <div className={`border-b w-full px-2 ${font} text-lg leading-none z-10`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor, borderBottomStyle: 'solid'} : {borderBottomStyle: 'dotted', borderBottomColor: 'black', color: '#1e3a8a'}}>
                      {data.receivedFrom}
                  </div>
              </div>

              <div className="flex items-center my-2">
                  <span className="font-bold text-black text-sm w-36 whitespace-nowrap shrink-0">Banyaknya uang</span>
                  <div className="w-full relative h-10">
                       <div className="absolute inset-0 bg-security-box opacity-50 transform skew-x-12 border" style={c.primaryColor ? {borderColor: c.primaryColor, backgroundColor: c.secondaryColor || '#e5e7eb'} : {borderColor: '#6b7280'}}></div>
                       <div className={`relative w-full h-full flex items-center px-4 ${font} text-xl text-black font-bold italic tracking-wide`}>
                           {data.amountInWords}
                       </div>
                  </div>
              </div>

              <div className="flex items-end">
                  <span className="font-bold text-black text-sm w-36 whitespace-nowrap shrink-0">Untuk pembayaran</span>
                  <div className={`border-b w-full px-2 ${font} text-lg leading-none z-10`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor, borderBottomStyle: 'solid'} : {borderBottomStyle: 'dotted', borderBottomColor: 'black', color: '#1e3a8a'}}>
                      {data.forPayment}
                  </div>
              </div>
              <div className="border-b w-full h-6" style={c.primaryColor ? {borderColor: c.primaryColor, borderBottomStyle: 'solid'} : {borderBottomStyle: 'dotted', borderBottomColor: 'black'}}></div>

          </div>

          <div className="flex justify-between items-end mt-4">
              <div className="flex items-center">
                  <span className="font-bold text-black text-sm mr-2 whitespace-nowrap">Jumlah Rp.</span>
                   <div className="relative h-10 w-48">
                       <div className="absolute inset-0 bg-security-box opacity-50 transform skew-x-12 border" style={c.primaryColor ? {borderColor: c.primaryColor, backgroundColor: c.secondaryColor || '#e5e7eb'} : {borderColor: '#6b7280'}}></div>
                       <div className={`relative w-full h-full flex items-center justify-start px-4 ${font} text-2xl text-black font-bold z-10`}>
                           {formatCurrency(data.amountInNumbers).replace('Rp', '').trim()}
                       </div>
                  </div>
              </div>

              <div className="flex flex-col items-center mr-8">
                  <div className={`mb-12 ${font} text-lg`} style={c.primaryColor ? {color: c.primaryColor} : {color: '#1e3a8a'}}>
                      {data.date}
                  </div>
                  <div className="flex flex-col items-center">
                       <div className={`border-b min-w-[150px] text-center ${font} text-lg font-bold z-10`} style={c.primaryColor ? {borderColor: c.primaryColor, color: c.primaryColor, borderBottomStyle: 'solid'} : {borderBottomStyle: 'dotted', borderBottomColor: 'black', color: '#1e3a8a'}}>
                           {data.signerName}
                       </div>
                  </div>
              </div>
          </div>

           <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-20 overflow-hidden z-0">
               <div className="w-[300px] h-[300px] border-[20px] rounded-full absolute -top-20 -right-20" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: '#93c5fd'}}></div>
               <div className="w-[200px] h-[200px] border-[20px] rounded-full absolute top-20 right-20" style={c.primaryColor ? {borderColor: c.primaryColor} : {borderColor: '#93c5fd'}}></div>
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
    </div>
  );
};

export default Kwitansi;
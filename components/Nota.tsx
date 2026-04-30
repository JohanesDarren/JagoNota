import React from 'react';
import { NotaData, UploadedImage, HandwritingFont, TemplateCustomization } from '../types';
import NotaKontan from './NotaKontan';
import NotaPenjualan from './NotaPenjualan';

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

const Nota: React.FC<Props> = (props) => {
  if (props.data.notaType === 'Nota Kontan') {
    return <NotaKontan {...props} />;
  }
  return <NotaPenjualan {...props} />;
};

export default Nota;
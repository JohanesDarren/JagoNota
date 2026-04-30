export type ElementType = 'text' | 'image' | 'shape' | 'table' | 'signature';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  noise?: number; // Effect property
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'line';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface TableColumn {
  id: string;
  header: string;
  width: number; // percentage
}

export interface TableElement extends BaseElement {
  type: 'table';
  columns: TableColumn[];
  rows: string[][];
  rowHeights?: number[];
  borderColor?: string;
  headerBgColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface SignatureElement extends BaseElement {
  type: 'signature';
  src: string;
  opacity: number;
  roughness: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | TableElement | SignatureElement;

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'nota' | 'kwitansi' | 'blank';
  width: number;
  height: number;
  backgroundColor: string;
  elements: CanvasElement[];
}

export interface DocumentProject {
  id: string;
  name: string;
  templateId: string;
  type: 'nota' | 'kwitansi' | 'blank';
  date: string;
  document: DocumentTemplate;
  projectElements: CanvasElement[];
}

export interface FontOption {
  label: string;
  value: string;
  isCustom?: boolean;
  cssText?: string;
  fontFamilyName?: string;
}

export const INITIAL_FONTS: FontOption[] = [
  { label: 'Indie Flower (Standard)', value: 'font-hand-1' },
  { label: 'Delius (Sangat Rapih)', value: 'font-hand-neat' },
  { label: 'Kalam (Biasa / Normal)', value: 'font-hand-normal' },
  { label: 'Caveat (Tebal)', value: 'font-hand-2' },
  { label: 'Patrick Hand (Anak Sekolah)', value: 'font-hand-3' },
  { label: 'Rock Salt (Berantakan)', value: 'font-hand-messy' },
  { label: 'Homemade Apple (Cakar Ayam)', value: 'font-hand-messy-2' },
];

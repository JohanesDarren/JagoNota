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
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  lineSpacing?: number;
  letterSpacing?: number;
  roughness?: number;
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
  db_id?: string;
  user_id?: string | null;
  is_default?: boolean;
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

export interface CustomFont {
  id: string;
  user_id: string;
  name: string;
  font_url: string;
  line_spacing: number;
  letter_spacing: number;
  created_at: string;
  cssText?: string;
  fontFamilyName?: string;
}

export interface FontOption {
  id?: string;
  label: string;
  value: string;
  isCustom?: boolean;
  cssText?: string;
  fontFamilyName?: string;
  font_url?: string;
  lineSpacing?: number;
  letterSpacing?: number;
  user_id?: string;
  created_at?: string;
}

export const INITIAL_FONTS: FontOption[] = [
  { label: 'Kalam (Santai & Natural)', value: 'sys-font-kalam' },
  { label: 'Dancing Script (Elegan Bersambung)', value: 'sys-font-dancing' },
  { label: 'Pacifico (Bulat & Retro)', value: 'sys-font-pacifico' },
  { label: 'Permanent Marker (Spidol Tebal)', value: 'sys-font-marker' },
  { label: 'Amatic SC (Artistik Papan Kapur)', value: 'sys-font-amatic' },
  { label: 'Rock Salt (Berantakan / Grunge)', value: 'sys-font-rocksalt' },
  { label: 'Caveat (Coretan Tebal)', value: 'sys-font-caveat' },
  { label: 'Gloria Hallelujah (Bouncy & Komik)', value: 'sys-font-gloria' },
];
declare module 'imagetracerjs';

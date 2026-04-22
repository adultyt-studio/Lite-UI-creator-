export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'glass-card' | 'glass-button';

export interface UIElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  opacity: number;
  rotation: number;
  glassmorphism?: {
    blur: number;
    backgroundOpacity: number;
    borderOpacity: number;
    glow?: number;
    glowColor?: string;
    lightAngle?: number;
    shadowDistance?: number;
    shadowOpacity?: number;
  };
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  src?: string;
  cornerRadius?: number | number[];
}

export interface Project {
  id: string;
  name: string;
  elements: UIElement[];
  createdAt: number;
  updatedAt: number;
  backgroundColor: string;
  width: number;
  height: number;
}

// Shape types
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text' | 'sticky-note';

export interface Point {
  x: number;
  y: number;
}

export interface BaseShape {
  id: string;
  type: ShapeType;
  position?: Point;
  rotation?: number;
  opacity?: number;
  selected: boolean;
  locked: boolean;
}

export interface Rectangle extends BaseShape {
  type: 'rectangle';
  position: Point;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation?: number;
  opacity?: number;
}

export interface Circle extends BaseShape {
  type: 'circle';
  position: Point;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation?: number;
  opacity?: number;
}

export interface Line extends BaseShape {
  type: 'line';
  points: number[];
  stroke: string;
  strokeWidth: number;
  opacity?: number;
}

export interface Text extends BaseShape {
  type: 'text';
  position: Point;
  text: string;
  fontSize: number;
  fill: string;
  rotation?: number;
  opacity?: number;
}

export interface StickyNote extends BaseShape {
  type: 'sticky-note';
  position: Point;
  text: string;
  width: number;
  height: number;
  fill: string;
  fontSize: number;
  rotation?: number;
  opacity?: number;
}

export type Shape = Rectangle | Circle | Line | Text | StickyNote;

// Tool types
export type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'sticky-note' | 'pan' | 'zoom';

// Canvas state
export interface CanvasState {
  shapes: Shape[];
  selectedShapeIds: string[];
  activeTool: Tool;
  zoom: number;
  panOffset: Point;
}
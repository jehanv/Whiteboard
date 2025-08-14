import { create } from 'zustand';
import type { Shape, Tool, Point } from '../types';

interface CanvasStore {
  // State
  shapes: Shape[];
  selectedShapeIds: string[];
  activeTool: Tool;
  zoom: number;
  panOffset: Point;
  
  // Actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: any) => void;
  deleteShape: (id: string) => void;
  deleteShapes: (ids: string[]) => void;
  selectShape: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: Point) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  // Initial state
  shapes: [],
  selectedShapeIds: [],
  activeTool: 'select',
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  
  // Actions
  addShape: (shape) => 
    set((state) => ({ shapes: [...state.shapes, shape] })),
  
  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    })),
  
  deleteShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedShapeIds: state.selectedShapeIds.filter((selectedId) => selectedId !== id),
    })),
  
  deleteShapes: (ids) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => !ids.includes(shape.id)),
      selectedShapeIds: state.selectedShapeIds.filter((selectedId) => !ids.includes(selectedId)),
    })),
  
  selectShape: (id, multi = false) =>
    set((state) => ({
      selectedShapeIds: multi
        ? state.selectedShapeIds.includes(id)
          ? state.selectedShapeIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedShapeIds, id]
        : [id],
    })),
  
  clearSelection: () =>
    set({ selectedShapeIds: [] }),
  
  setActiveTool: (tool) =>
    set({ activeTool: tool }),
  
  setZoom: (zoom) =>
    set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),
  
  setPanOffset: (panOffset) =>
    set({ panOffset }),
}));
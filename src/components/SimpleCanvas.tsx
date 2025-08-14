import React, { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  fill: string;
  stroke: string;
  selected: boolean;
}

const SimpleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle' | 'circle' | 'line' | 'pan'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  
  // Pan and zoom state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context and apply camera transform
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Draw infinite grid
    const gridSize = 20;
    const startX = Math.floor(-camera.x / camera.zoom / gridSize) * gridSize;
    const endX = Math.ceil((canvas.width - camera.x) / camera.zoom / gridSize) * gridSize;
    const startY = Math.floor(-camera.y / camera.zoom / gridSize) * gridSize;
    const endY = Math.ceil((canvas.height - camera.y) / camera.zoom / gridSize) * gridSize;

    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1 / camera.zoom;
    
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw shapes
    shapes.forEach(shape => {
      ctx.fillStyle = shape.fill;
      ctx.strokeStyle = shape.selected ? '#0066ff' : shape.stroke;
      ctx.lineWidth = (shape.selected ? 3 : 2) / camera.zoom;

      switch (shape.type) {
        case 'rectangle':
          if (shape.width && shape.height) {
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          }
          break;
        case 'circle':
          if (shape.radius) {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          break;
        case 'line':
          if (shape.endX !== undefined && shape.endY !== undefined) {
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
          }
          break;
      }
    });

    // Restore context
    ctx.restore();
  }, [shapes, camera]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: (screenX - camera.x) / camera.zoom,
      y: (screenY - camera.y) / camera.zoom
    };
  }, [camera]);


  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth - 400; // Account for toolbar and properties
      canvas.height = window.innerHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Check for panning (middle mouse, ctrl+click, or pan tool)
    if (e.button === 1 || (e.button === 0 && e.ctrlKey) || activeTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: screenX, y: screenY });
      return;
    }

    const worldPoint = screenToWorld(screenX, screenY);

    if (activeTool === 'select') {
      // Find clicked shape using world coordinates
      const clickedShape = shapes.find(shape => {
        switch (shape.type) {
          case 'rectangle':
            return shape.width && shape.height && 
                   worldPoint.x >= shape.x && worldPoint.x <= shape.x + shape.width &&
                   worldPoint.y >= shape.y && worldPoint.y <= shape.y + shape.height;
          case 'circle':
            return shape.radius && 
                   Math.sqrt((worldPoint.x - shape.x) ** 2 + (worldPoint.y - shape.y) ** 2) <= shape.radius;
          case 'line':
            return shape.endX !== undefined && shape.endY !== undefined &&
                   Math.abs((worldPoint.y - shape.y) * (shape.endX - shape.x) - (worldPoint.x - shape.x) * (shape.endY - shape.y)) / 
                   Math.sqrt((shape.endY - shape.y) ** 2 + (shape.endX - shape.x) ** 2) < 5 / camera.zoom;
          default:
            return false;
        }
      });

      setShapes(prevShapes => 
        prevShapes.map(shape => ({
          ...shape,
          selected: shape.id === clickedShape?.id
        }))
      );
      setSelectedShapeId(clickedShape?.id || null);
    } else {
      setIsDrawing(true);
      setStartPoint(worldPoint);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Handle panning
    if (isPanning && lastPanPoint) {
      const deltaX = screenX - lastPanPoint.x;
      const deltaY = screenY - lastPanPoint.y;
      
      setCamera(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: screenX, y: screenY });
      return;
    }

    if (!isDrawing || !startPoint || activeTool === 'select') return;

    const currentWorld = screenToWorld(screenX, screenY);

    // Create preview shape
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(); // Redraw existing shapes

    // Apply camera transform for preview
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    ctx.strokeStyle = '#0066ff';
    ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
    ctx.lineWidth = 2 / camera.zoom;
    ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);

    switch (activeTool) {
      case 'rectangle':
        const width = currentWorld.x - startPoint.x;
        const height = currentWorld.y - startPoint.y;
        ctx.fillRect(startPoint.x, startPoint.y, width, height);
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        break;
      case 'circle':
        const radius = Math.sqrt((currentWorld.x - startPoint.x) ** 2 + (currentWorld.y - startPoint.y) ** 2);
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentWorld.x, currentWorld.y);
        ctx.stroke();
        break;
    }

    ctx.setLineDash([]);
    ctx.restore();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (!isDrawing || !startPoint || activeTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const endWorld = screenToWorld(screenX, screenY);

    let newShape: Shape | null = null;

    switch (activeTool) {
      case 'rectangle':
        const width = endWorld.x - startPoint.x;
        const height = endWorld.y - startPoint.y;
        if (Math.abs(width) > 5 / camera.zoom && Math.abs(height) > 5 / camera.zoom) {
          newShape = {
            id: uuidv4(),
            type: 'rectangle',
            x: Math.min(startPoint.x, endWorld.x),
            y: Math.min(startPoint.y, endWorld.y),
            width: Math.abs(width),
            height: Math.abs(height),
            fill: '#ffffff',
            stroke: '#000000',
            selected: false
          };
        }
        break;
      case 'circle':
        const radius = Math.sqrt((endWorld.x - startPoint.x) ** 2 + (endWorld.y - startPoint.y) ** 2);
        if (radius > 5 / camera.zoom) {
          newShape = {
            id: uuidv4(),
            type: 'circle',
            x: startPoint.x,
            y: startPoint.y,
            radius,
            fill: '#ffffff',
            stroke: '#000000',
            selected: false
          };
        }
        break;
      case 'line':
        const distance = Math.sqrt((endWorld.x - startPoint.x) ** 2 + (endWorld.y - startPoint.y) ** 2);
        if (distance > 5 / camera.zoom) {
          newShape = {
            id: uuidv4(),
            type: 'line',
            x: startPoint.x,
            y: startPoint.y,
            endX: endWorld.x,
            endY: endWorld.y,
            fill: '#000000',
            stroke: '#000000',
            selected: false
          };
        }
        break;
    }

    if (newShape) {
      setShapes(prevShapes => [...prevShapes, newShape!]);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Get mouse position in world coordinates before zoom
    const worldBeforeZoom = screenToWorld(mouseX, mouseY);

    // Calculate new zoom level
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, camera.zoom * zoomFactor));

    setCamera({
      zoom: newZoom,
      x: mouseX - worldBeforeZoom.x * newZoom,
      y: mouseY - worldBeforeZoom.y * newZoom
    });
  }, [camera, screenToWorld]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedShapeId) {
        setShapes(prevShapes => prevShapes.filter(shape => shape.id !== selectedShapeId));
        setSelectedShapeId(null);
      }
    }
  }, [selectedShapeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, handleWheel]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Toolbar */}
      <div style={{ 
        width: 200, 
        backgroundColor: '#f8f9fa', 
        padding: 16, 
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#333' }}>Tools</h3>
        
        <button
          onClick={() => setActiveTool('select')}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            backgroundColor: activeTool === 'select' ? '#0066ff' : '#fff',
            color: activeTool === 'select' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: 4
          }}
        >
          Select
        </button>
        
        <button
          onClick={() => setActiveTool('pan')}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            backgroundColor: activeTool === 'pan' ? '#0066ff' : '#fff',
            color: activeTool === 'pan' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: 4
          }}
        >
          Pan
        </button>
        
        <button
          onClick={() => setActiveTool('rectangle')}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            backgroundColor: activeTool === 'rectangle' ? '#0066ff' : '#fff',
            color: activeTool === 'rectangle' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: 4
          }}
        >
          Rectangle
        </button>
        
        <button
          onClick={() => setActiveTool('circle')}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            backgroundColor: activeTool === 'circle' ? '#0066ff' : '#fff',
            color: activeTool === 'circle' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: 4
          }}
        >
          Circle
        </button>
        
        <button
          onClick={() => setActiveTool('line')}
          style={{
            padding: 12,
            border: '1px solid #ccc',
            backgroundColor: activeTool === 'line' ? '#0066ff' : '#fff',
            color: activeTool === 'line' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: 4
          }}
        >
          Line
        </button>

        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            Shapes: {shapes.length}
          </p>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            Zoom: {Math.round(camera.zoom * 100)}%
          </p>
          {selectedShapeId && (
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
              Selected: {shapes.find(s => s.id === selectedShapeId)?.type}
            </p>
          )}
          <div style={{ marginTop: 10, fontSize: 10, color: '#999' }}>
            <p style={{ margin: 0 }}>Ctrl+Click: Pan</p>
            <p style={{ margin: 0 }}>Mouse Wheel: Zoom</p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ 
            display: 'block',
            cursor: isPanning ? 'grabbing' : 
                   activeTool === 'select' ? 'default' : 
                   activeTool === 'pan' ? 'grab' : 'crosshair',
            backgroundColor: '#fafafa'
          }}
        />
      </div>

      {/* Properties Panel */}
      <div style={{ 
        width: 200, 
        backgroundColor: '#f8f9fa', 
        padding: 16, 
        borderLeft: '1px solid #e0e0e0' 
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#333' }}>Properties</h3>
        {selectedShapeId ? (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, color: '#666' }}>
              Shape selected: {shapes.find(s => s.id === selectedShapeId)?.type}
            </p>
            <p style={{ fontSize: 12, color: '#999' }}>
              Press Delete to remove
            </p>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#666', marginTop: 16 }}>
            No shape selected
          </p>
        )}
      </div>
    </div>
  );
};

export default SimpleCanvas;
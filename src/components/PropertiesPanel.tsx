import React from 'react';
import { useCanvasStore } from '../store/canvasStore';

const PropertiesPanel: React.FC = () => {
  const { shapes, selectedShapeIds, updateShape } = useCanvasStore();
  
  // Get selected shapes
  const selectedShapes = shapes.filter((shape) => selectedShapeIds.includes(shape.id));
  
  if (selectedShapes.length === 0) {
    return (
      <div className="properties-panel">
        <h3>Properties</h3>
        <p className="no-selection">No shape selected</p>
        <style>{`
          .properties-panel {
            padding: 16px;
            background-color: #f5f5f5;
            border-left: 1px solid #e0e0e0;
            min-width: 250px;
          }
          
          .properties-panel h3 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
          
          .no-selection {
            color: #666;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }
  
  const selectedShape = selectedShapes[0]; // For now, show properties of first selected shape
  
  const handlePropertyChange = (property: string, value: any) => {
    selectedShapes.forEach((shape) => {
      updateShape(shape.id, { [property]: value });
    });
  };
  
  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      
      <div className="property-group">
        <label>Type</label>
        <input type="text" value={selectedShape.type} disabled />
      </div>
      
      {selectedShape.position && (
        <div className="property-group">
          <label>Position</label>
          <div className="property-row">
            <input
              type="number"
              value={selectedShape.position.x}
              onChange={(e) => handlePropertyChange('position', {
                ...selectedShape.position,
                x: parseInt(e.target.value) || 0,
              })}
              placeholder="X"
            />
            <input
              type="number"
              value={selectedShape.position.y}
              onChange={(e) => handlePropertyChange('position', {
                ...selectedShape.position,
                y: parseInt(e.target.value) || 0,
              })}
              placeholder="Y"
            />
          </div>
        </div>
      )}
      
      {selectedShape.type === 'rectangle' && (
        <>
          <div className="property-group">
            <label>Size</label>
            <div className="property-row">
              <input
                type="number"
                value={selectedShape.width}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 0)}
                placeholder="Width"
              />
              <input
                type="number"
                value={selectedShape.height}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 0)}
                placeholder="Height"
              />
            </div>
          </div>
          
          <div className="property-group">
            <label>Fill Color</label>
            <input
              type="color"
              value={selectedShape.fill}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
            />
          </div>
          
          <div className="property-group">
            <label>Stroke Color</label>
            <input
              type="color"
              value={selectedShape.stroke}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
            />
          </div>
          
          <div className="property-group">
            <label>Stroke Width</label>
            <input
              type="number"
              value={selectedShape.strokeWidth}
              onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
              min="0"
              max="20"
            />
          </div>
        </>
      )}
      
      <style>{`
        .properties-panel {
          padding: 16px;
          background-color: #f5f5f5;
          border-left: 1px solid #e0e0e0;
          min-width: 250px;
        }
        
        .properties-panel h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .property-group {
          margin-bottom: 16px;
        }
        
        .property-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #555;
        }
        
        .property-group input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .property-group input[type="color"] {
          height: 32px;
          cursor: pointer;
        }
        
        .property-group input:disabled {
          background-color: #e9e9e9;
          cursor: not-allowed;
        }
        
        .property-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default PropertiesPanel;
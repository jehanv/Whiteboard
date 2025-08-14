import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import type { Tool } from '../types';

interface ToolButton {
  tool: Tool;
  label: string;
  icon?: string;
}

const tools: ToolButton[] = [
  { tool: 'select', label: 'Select' },
  { tool: 'rectangle', label: 'Rectangle' },
  { tool: 'circle', label: 'Circle' },
  { tool: 'line', label: 'Line' },
  { tool: 'text', label: 'Text' },
  { tool: 'sticky-note', label: 'Sticky Note' },
  { tool: 'pan', label: 'Pan' },
  { tool: 'zoom', label: 'Zoom' },
];

const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useCanvasStore();
  
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map((tool) => (
            <button
              key={tool.tool}
              className={`tool-button ${activeTool === tool.tool ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.tool)}
              title={tool.label}
            >
              {tool.icon || tool.label}
            </button>
          ))}
        </div>
      </div>
      
      <style>{`
        .toolbar {
          display: flex;
          flex-direction: column;
          padding: 16px;
          background-color: #f5f5f5;
          border-right: 1px solid #e0e0e0;
          min-width: 200px;
        }
        
        .toolbar-section {
          margin-bottom: 24px;
        }
        
        .toolbar-section h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .tool-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        
        .tool-button {
          padding: 8px 12px;
          border: 1px solid #ccc;
          background-color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .tool-button:hover {
          background-color: #f0f0f0;
          border-color: #999;
        }
        
        .tool-button.active {
          background-color: #0066ff;
          color: white;
          border-color: #0052cc;
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
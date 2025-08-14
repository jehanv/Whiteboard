import React, { useState, useCallback, useEffect } from 'react';

interface ResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onResize: (newBounds: { x: number; y: number; width: number; height: number }) => void;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ x, y, width, height, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startBounds, setStartBounds] = useState({ x, y, width, height });

  const handleSize = 8;
  const handleOffset = handleSize / 2;

  const getHandlePosition = (position: HandlePosition) => {
    switch (position) {
      case 'nw':
        return { x: x - handleOffset, y: y - handleOffset };
      case 'n':
        return { x: x + width / 2 - handleOffset, y: y - handleOffset };
      case 'ne':
        return { x: x + width - handleOffset, y: y - handleOffset };
      case 'e':
        return { x: x + width - handleOffset, y: y + height / 2 - handleOffset };
      case 'se':
        return { x: x + width - handleOffset, y: y + height - handleOffset };
      case 's':
        return { x: x + width / 2 - handleOffset, y: y + height - handleOffset };
      case 'sw':
        return { x: x - handleOffset, y: y + height - handleOffset };
      case 'w':
        return { x: x - handleOffset, y: y + height / 2 - handleOffset };
    }
  };

  const getCursor = (position: HandlePosition) => {
    switch (position) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, position: HandlePosition) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(position);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartBounds({ x, y, width, height });
  }, [x, y, width, height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !activeHandle) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    let newX = startBounds.x;
    let newY = startBounds.y;
    let newWidth = startBounds.width;
    let newHeight = startBounds.height;

    switch (activeHandle) {
      case 'nw':
        newX = startBounds.x + deltaX;
        newY = startBounds.y + deltaY;
        newWidth = startBounds.width - deltaX;
        newHeight = startBounds.height - deltaY;
        break;
      case 'n':
        newY = startBounds.y + deltaY;
        newHeight = startBounds.height - deltaY;
        break;
      case 'ne':
        newY = startBounds.y + deltaY;
        newWidth = startBounds.width + deltaX;
        newHeight = startBounds.height - deltaY;
        break;
      case 'e':
        newWidth = startBounds.width + deltaX;
        break;
      case 'se':
        newWidth = startBounds.width + deltaX;
        newHeight = startBounds.height + deltaY;
        break;
      case 's':
        newHeight = startBounds.height + deltaY;
        break;
      case 'sw':
        newX = startBounds.x + deltaX;
        newWidth = startBounds.width - deltaX;
        newHeight = startBounds.height + deltaY;
        break;
      case 'w':
        newX = startBounds.x + deltaX;
        newWidth = startBounds.width - deltaX;
        break;
    }

    // Ensure minimum size
    const minSize = 20;
    if (newWidth < minSize) {
      if (activeHandle.includes('w')) {
        newX = startBounds.x + startBounds.width - minSize;
      }
      newWidth = minSize;
    }
    if (newHeight < minSize) {
      if (activeHandle.includes('n')) {
        newY = startBounds.y + startBounds.height - minSize;
      }
      newHeight = minSize;
    }

    onResize({ x: newX, y: newY, width: newWidth, height: newHeight });
  }, [isResizing, activeHandle, startPos, startBounds, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handles: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  return (
    <>
      {/* Selection outline */}
      <div
        style={{
          position: 'absolute',
          left: x - 1,
          top: y - 1,
          width: width + 2,
          height: height + 2,
          border: '1px solid #0969da',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      />
      
      {/* Resize handles */}
      {handles.map((position) => {
        const pos = getHandlePosition(position);
        return (
          <div
            key={position}
            onMouseDown={(e) => handleMouseDown(e, position)}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: handleSize,
              height: handleSize,
              backgroundColor: '#0969da',
              border: '1px solid #0860ca',
              borderRadius: 1,
              cursor: getCursor(position),
              transition: 'transform 0.1s ease-out',
              boxSizing: 'border-box',
            }}
            className="resize-handle"
          />
        );
      })}
      
      <style>{`
        .resize-handle:hover {
          transform: scale(1.2);
          background-color: #0860ca;
        }
        .resize-handle:active {
          transform: scale(1.1);
          background-color: #0757b8;
        }
      `}</style>
    </>
  );
};

export default ResizeHandles;
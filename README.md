# FigJam Clone

A collaborative whiteboard application built with React, TypeScript, and Konva.js.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Tools**: Click on toolbar buttons to select different tools
2. **Drawing**: Click and drag to create shapes
3. **Selection**: Use the select tool to manipulate objects
4. **Pan**: Use the pan tool or hold Cmd/Ctrl while dragging
5. **Zoom**: Use mouse wheel to zoom in/out
6. **Delete**: Select objects and press Delete/Backspace

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Canvas**: Konva.js, react-konva
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: Inline styles (CSS-in-JS)

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx         # Main canvas component
│   ├── Toolbar.tsx        # Tool selection
│   └── PropertiesPanel.tsx # Shape properties
├── store/
│   └── canvasStore.ts     # Zustand state management
├── types/
│   └── index.ts          # TypeScript type definitions
└── App.tsx               # Main app component
```

## Next Steps

1. Implement freehand drawing tools
2. Add color picker and styling controls
3. Implement undo/redo functionality
4. Add project save/load
5. Implement real-time collaboration
6. Add export functionality

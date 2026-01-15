# @forestry-pixi/drag

Drag hook and state controller for forestry-pixi.

## Installation

```bash
yarn add @forestry-pixi/drag
```

## Hooks

### useDrag

React hook for adding drag functionality to components.

```tsx
import { useDrag } from '@forestry-pixi/drag';

function DraggableComponent() {
  const { isDragging, position, dragHandlers } = useDrag({
    onDragStart: () => console.log('Started'),
    onDrag: (pos) => console.log('Dragging', pos),
    onDragEnd: () => console.log('Ended')
  });

  return (
    <div 
      {...dragHandlers}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      Drag me!
    </div>
  );
}
```

## Controllers

### DragStore

Forestry4-based state controller for managing drag state.

```typescript
import { DragStore } from '@forestry-pixi/drag';

const dragStore = new DragStore({
  onDragStart: (itemId, x, y) => {
    console.log('Drag started:', itemId, x, y);
  },
  onDrag: (itemId, x, y, deltaX, deltaY) => {
    console.log('Dragging:', itemId, x, y, deltaX, deltaY);
  },
  onDragEnd: (itemId, x, y) => {
    console.log('Drag ended:', itemId, x, y);
  },
});

// Start dragging
dragStore.startDrag('item-1', 100, 100, 50, 50);

// Update drag position
dragStore.updateDrag(150, 150);

// End dragging
dragStore.endDrag();

// Check state
const isDragging = dragStore.value.isDragging;
const isItemDragging = dragStore.isItemDragging('item-1');
const position = dragStore.getCurrentItemPosition();
```

### API

**Methods:**
- `setCallbacks(callbacks)` - Set drag callbacks
- `startDrag(itemId, clientX, clientY, itemX?, itemY?)` - Start dragging
- `updateDrag(clientX, clientY)` - Update drag position
- `endDrag()` - End dragging (triggers onDragEnd)
- `cancelDrag()` - Cancel dragging (no callback)
- `getCurrentItemPosition()` - Get current item position
- `isItemDragging(itemId)` - Check if specific item is dragging

**Types:**
```typescript
interface DragStoreValue {
  isDragging: boolean;
  draggedItemId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  initialItemX: number;
  initialItemY: number;
}

interface DragCallbacks {
  onDragStart?: (itemId: string, x: number, y: number) => void;
  onDrag?: (itemId: string, x: number, y: number, deltaX: number, deltaY: number) => void;
  onDragEnd?: (itemId: string, x: number, y: number) => void;
}
```

## License

MIT


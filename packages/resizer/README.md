# @forestry-pixi/resizer

Interactive resize handles for PixiJS containers with Forestry state management.

## Features

- **Interactive resize handles** - Drag handles to resize containers
- **Counter-scaling** - Handles maintain constant size despite parent container scaling
- **Two modes**:
  - **Persist mode** - Handles remain visible until `deselect()` is called
  - **Release mode** - Handles disappear after one resize operation
- **Configurable handles** - 4 handles (corners only) or 8 handles (corners + edges)
- **Aspect ratio constraint** - Optional constraint to maintain original proportions
- **Forestry state management** - Uses Forestry4 for reactive state
- **TypeScript** - Full type safety with Zod validation

## Installation

```bash
yarn add @forestry-pixi/resizer
```

## Usage

### Basic Example

```typescript
import { Application, Container, Graphics, Rectangle } from 'pixi.js';
import { onResize } from '@forestry-pixi/resizer';

const app = new Application();
await app.init();

// Create a container to resize
const box = new Container();
const graphic = new Graphics();
graphic.rect(0, 0, 100, 100);
graphic.fill({ color: 0xff6b6b });
box.addChild(graphic);
app.stage.addChild(box);

// Add resize handles
const resizer = onResize(box, {
  initialRect: new Rectangle(0, 0, 100, 100),
  onUpdate: (newRect) => {
    // Update the graphic when resizing
    graphic.clear();
    graphic.rect(0, 0, newRect.width, newRect.height);
    graphic.fill({ color: 0xff6b6b });
  },
  persist: true, // Handles remain until deselect() is called
  size: 8, // Handle size in pixels
  color: { r: 0.2, g: 0.6, b: 1 }, // Handle color
  count: 8, // 8 handles (corners + edges)
});

// Later, deselect to remove handles
resizer.deselect();
```

### Persist Mode

Handles remain visible and functional until `deselect()` is called:

```typescript
const resizer = onResize(container, {
  initialRect: new Rectangle(0, 0, 150, 100),
  onUpdate: (newRect) => {
    // Update container
  },
  persist: true, // Handles persist
});

// Handles remain active, user can resize multiple times

// Remove handles when done
resizer.deselect();
```

### Release Mode

Handles disappear after one resize operation:

```typescript
const resizer = onResize(container, {
  initialRect: new Rectangle(0, 0, 150, 100),
  onUpdate: (newRect) => {
    // Update container
  },
  onRelease: (state) => {
    console.log('Resize complete!');
  },
  persist: false, // Handles disappear after resize
});

// After user drags and releases, handles are automatically removed
```

### Constrained Resize (Maintain Aspect Ratio)

```typescript
const resizer = onResize(container, {
  initialRect: new Rectangle(0, 0, 150, 100),
  onUpdate: (newRect) => {
    // Update container
  },
  constrain: true, // Maintain aspect ratio
});
```

### 4 Handles (Corners Only)

```typescript
const resizer = onResize(container, {
  initialRect: new Rectangle(0, 0, 150, 100),
  onUpdate: (newRect) => {
    // Update container
  },
  count: 4, // Only corner handles
});
```

## API

### `onResize(container, config)`

Creates resize handles around a container.

**Parameters:**

- `container: Container` - The PixiJS container to add handles to (must have a parent)
- `config: ResizerConfig` - Configuration object

**Returns:** `ResizerState` - State object with control methods

### ResizerConfig

```typescript
interface ResizerConfig {
  /** Initial rectangle to resize */
  initialRect: Rectangle;
  
  /** Callback when rectangle is updated during drag */
  onUpdate: (newRect: Rectangle) => void;
  
  /** Callback when resize is complete (mouse up) */
  onRelease?: (state: ResizerState) => void;
  
  /** If true, handles persist until deselect(). If false, handles removed after first resize. */
  persist?: boolean; // default: true
  
  /** Size of handles in pixels (constant size despite scaling) */
  size?: number; // default: 8
  
  /** Color of handles (RGB 0..1) */
  color?: Color; // default: { r: 0.2, g: 0.6, b: 1 }
  
  /** If true, constrain resize to maintain original aspect ratio */
  constrain?: boolean; // default: false
  
  /** Number of handles: 4 (corners only) or 8 (corners + edges) */
  count?: 4 | 8; // default: 8
}
```

### ResizerState

```typescript
interface ResizerState {
  /** Deselect and remove handles */
  deselect: () => void;
  
  /** Complete the resize operation (for release mode) */
  complete: () => void;
  
  /** Get current rectangle */
  getRect: () => Rectangle;
  
  /** Update the rectangle programmatically */
  setRect: (rect: Rectangle) => void;
  
  /** Check if state is active */
  isActive: () => boolean;
}
```

## License

MIT


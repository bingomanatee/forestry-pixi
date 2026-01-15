# @forestry-pixi/grid

Grid component and state controller for forestry-pixi.

## Installation

```bash
yarn add @forestry-pixi/grid
```

## Components

### Grid

React component for rendering a CSS grid layout.

```tsx
import { Grid } from '@forestry-pixi/grid';

<Grid rows={3} cols={3} gap={16}>
  <div>Cell 1</div>
  <div>Cell 2</div>
  <div>Cell 3</div>
</Grid>
```

**Props:**
- `rows: number` - Number of rows
- `cols: number` - Number of columns
- `gap?: number` - Gap between cells (default: 10)
- `children?: React.ReactNode` - Grid children
- `style?: CSSProperties` - Additional styles

## Controllers

### GridStore

Forestry4-based state controller for managing grid configuration.

```typescript
import { GridStore } from '@forestry-pixi/grid';

const gridStore = new GridStore({
  rows: 4,
  cols: 4,
  gap: 10,
});

// Update grid
gridStore.setRows(5);
gridStore.setCols(5);
gridStore.setGap(15);

// Set dimensions
gridStore.setDimensions(800, 600);
gridStore.setCellDimensions(100, 100);

// Get cell information
const totalCells = gridStore.getTotalCells(); // 25
const position = gridStore.getCellPosition(12); // { row: 2, col: 2 }
const index = gridStore.getCellIndex(2, 2); // 12
const coords = gridStore.getCellCoordinates(2, 2); 
// { x: 220, y: 220, width: 100, height: 100 }

// Subscribe to changes
gridStore.subscribe((value) => {
  console.log('Grid:', value);
});
```

### API

**Methods:**
- `setRows(rows: number)` - Set number of rows
- `setCols(cols: number)` - Set number of columns
- `setGap(gap: number)` - Set gap between cells
- `setDimensions(width, height)` - Set grid dimensions
- `setCellDimensions(cellWidth, cellHeight)` - Set cell dimensions
- `updateGrid(updates)` - Update multiple properties
- `getTotalCells()` - Get total number of cells
- `getCellPosition(index)` - Get row/col from index
- `getCellIndex(row, col)` - Get index from row/col
- `getCellCoordinates(row, col)` - Get pixel coordinates

**Types:**
```typescript
interface GridStoreValue {
  rows: number;
  cols: number;
  gap: number;
  width?: number;
  height?: number;
  cellWidth?: number;
  cellHeight?: number;
}
```

## License

MIT


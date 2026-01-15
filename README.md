# Forestry Pixi - Yarn Berry Monorepo

A Yarn Berry (v4) monorepo with workspace packages for grid, panel, and drag functionality, plus a Vite React demo application.

## Structure

```
forestry-pixi/
├── packages/
│   ├── grid/          # Grid component with configurable rows/cols
│   ├── panel/         # Panel component with remove functionality
│   └── drag/          # Drag hook utilities
└── apps/
    └── demo/          # Vite React demo application
```

## Features

- **Yarn Berry (v4.0.2)** with `node-modules` linker for traditional node_modules everywhere
- **TypeScript** support across all packages
- **Workspace dependencies** using `workspace:*` protocol
- **Vite** for fast development and building

## Getting Started

### Prerequisites

- Node.js 18+ 
- Corepack enabled (comes with Node.js 16.10+)

### Installation

```bash
# Enable corepack if not already enabled
corepack enable

# Install dependencies
yarn install
```

### Development

```bash
# Start the demo app in development mode
yarn dev

# Build all packages
yarn build

# Clean all build artifacts
yarn clean
```

## Packages

### @forestry-pixi/grid

Grid component with configurable size and Forestry state controller.

**Component:**
```tsx
import { Grid } from '@forestry-pixi/grid';

<Grid rows={3} cols={3} gap={16}>
  {/* children */}
</Grid>
```

**Controller:**
```tsx
import { GridStore } from '@forestry-pixi/grid';

const gridStore = new GridStore({ rows: 4, cols: 4, gap: 10 });
gridStore.setRows(5);
```

### @forestry-pixi/panel

Panel component with optional remove functionality and Forestry state controller for managing collections.

**Component:**
```tsx
import { Panel } from '@forestry-pixi/panel';

<Panel
  id="panel-1"
  title="My Panel"
  onRemove={(id) => console.log('Remove', id)}
>
  {/* content */}
</Panel>
```

**Controller:**
```tsx
import { PanelStore } from '@forestry-pixi/panel';

const panelStore = new PanelStore();
panelStore.addPanel({
  id: 'panel-1',
  order: 0,
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  style: { fill: '#ffffff', stroke: '#cccccc', strokeWidth: 1 }
});
```

### @forestry-pixi/drag

Drag hook and Forestry state controller for drag functionality.

**Hook:**
```tsx
import { useDrag } from '@forestry-pixi/drag';

const { isDragging, position, dragHandlers } = useDrag({
  onDragStart: () => console.log('Started'),
  onDragEnd: () => console.log('Ended')
});
```

**Controller:**
```tsx
import { DragStore } from '@forestry-pixi/drag';

const dragStore = new DragStore({
  onDragStart: (id, x, y) => console.log('Drag started'),
  onDrag: (id, x, y, dx, dy) => console.log('Dragging'),
  onDragEnd: (id, x, y) => console.log('Drag ended')
});
```

## Demo App

The demo app (`apps/demo`) showcases the grid and panel packages:

- Adjust grid size (rows/columns) with input controls
- Add panels to the grid with the "Add Panel" button
- Remove individual panels with the × button
- Responsive grid layout

## Forestry Controllers

All packages include Forestry4-based state controllers for reactive state management:

- **PanelStore** - Manage collections of panels with position, size, and styling
- **GridStore** - Manage grid configuration with rows, columns, and cell calculations
- **DragStore** - Manage drag state with callbacks

See [CONTROLLERS.md](./CONTROLLERS.md) for detailed documentation and examples.

## Scripts

- `yarn dev` - Start the demo app in development mode
- `yarn build` - Build all packages and apps
- `yarn clean` - Remove all dist folders
- `yarn workspace <workspace-name> <command>` - Run commands in specific workspaces

## Configuration

### Yarn Berry

The project uses Yarn Berry with the following configuration (`.yarnrc.yml`):

```yaml
nodeLinker: node-modules
enableGlobalCache: false
```

This ensures traditional `node_modules` folders are created in each workspace.

## License

MIT


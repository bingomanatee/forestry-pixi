# @forestry-pixi/panel

Panel component and state controller for forestry-pixi.

## Installation

```bash
yarn add @forestry-pixi/panel
```

## Components

### Panel

React component for rendering a panel with optional title and remove button.

```tsx
import { Panel } from '@forestry-pixi/panel';

<Panel 
  id="panel-1" 
  title="My Panel"
  onRemove={(id) => console.log('Remove', id)}
>
  <p>Panel content</p>
</Panel>
```

## Controllers

### PanelStore

Forestry4-based state controller for managing a collection of panels.

```typescript
import { PanelStore } from '@forestry-pixi/panel';

const panelStore = new PanelStore();

// Add a panel
panelStore.addPanel({
  id: 'panel-1',
  order: 0,
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  style: {
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: '#cccccc',
    strokeWidth: 1,
    strokeOpacity: 1,
  },
  title: 'My Panel',
  visible: true,
});

// Update panel
panelStore.updatePanelPosition('panel-1', 150, 150);
panelStore.updatePanelStyle('panel-1', { fill: '#ff0000' });

// Get panels
const panels = panelStore.getPanelsArray();

// Subscribe to changes
panelStore.subscribe((value) => {
  console.log('Panels:', value.panels);
});
```

### API

**Methods:**
- `addPanel(panel: PanelData)` - Add a new panel
- `removePanel(id: string)` - Remove a panel
- `updatePanel(id, updates)` - Update panel properties
- `updatePanelPosition(id, x, y)` - Update position
- `updatePanelSize(id, width, height)` - Update size
- `updatePanelStyle(id, style)` - Update style
- `updatePanelOrder(id, order)` - Update order
- `getPanel(id)` - Get a specific panel
- `getPanelsArray()` - Get all panels sorted by order
- `getVisiblePanels()` - Get visible panels
- `clearPanels()` - Remove all panels
- `getPanelCount()` - Get panel count

**Types:**
```typescript
interface PanelData {
  id: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  style: PanelStyle;
  title?: string;
  visible: boolean;
}

interface PanelStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
}
```

## License

MIT


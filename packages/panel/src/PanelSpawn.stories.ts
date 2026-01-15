import type { Meta, StoryObj } from '@storybook/html';
import { Application, Graphics, Container } from 'pixi.js';
import { PanelStore } from './PanelStore';
import type { PanelData } from './types';

interface PanelSpawnArgs {}

const meta: Meta<PanelSpawnArgs> = {
  title: 'Panel/Panel Spawn',
  tags: ['autodocs'],
  render: (args) => {
    const wrapper = document.createElement('div');

    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Click anywhere on the canvas to spawn a panel. Click on an existing panel to delete it. Use the controls below to adjust panel settings.';
    instructions.style.marginBottom = '10px';
    instructions.style.fontFamily = 'sans-serif';
    instructions.style.fontSize = '14px';
    wrapper.appendChild(instructions);

    // Add controls for panel settings
    const controlsContainer = document.createElement('div');
    controlsContainer.style.marginBottom = '10px';
    controlsContainer.style.fontFamily = 'sans-serif';
    controlsContainer.style.fontSize = '14px';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.gap = '15px';
    controlsContainer.style.alignItems = 'center';

    // Panel width control
    const widthLabel = document.createElement('label');
    widthLabel.textContent = 'Width: ';
    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.min = '50';
    widthInput.max = '300';
    widthInput.step = '10';
    widthInput.value = '100';
    widthInput.style.width = '70px';
    widthLabel.appendChild(widthInput);
    controlsContainer.appendChild(widthLabel);

    // Panel height control
    const heightLabel = document.createElement('label');
    heightLabel.textContent = 'Height: ';
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.min = '50';
    heightInput.max = '300';
    heightInput.step = '10';
    heightInput.value = '100';
    heightInput.style.width = '70px';
    heightLabel.appendChild(heightInput);
    controlsContainer.appendChild(heightLabel);

    // Panel color control
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Color: ';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#4a90e2';
    colorLabel.appendChild(colorInput);
    controlsContainer.appendChild(colorLabel);

    wrapper.appendChild(controlsContainer);

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    wrapper.appendChild(container);

    // Create PixiJS application
    const app = new Application();

    // Initialize the app
    app.init({
      resizeTo: container,
      backgroundColor: 0xffffff,
      antialias: true,
    }).then(() => {
      container.appendChild(app.canvas);
      
      // Create panel store
      const panelStore = new PanelStore();
      
      // Container for all panels
      const panelsContainer = new Container();
      app.stage.addChild(panelsContainer);
      
      // Track panel graphics by ID
      const panelGraphics = new Map<string, Graphics>();
      
      // Function to create a panel graphic
      const createPanelGraphic = (panel: PanelData): Graphics => {
        const graphic = new Graphics();

        // Draw background if visible
        if (panel.style.background.isVisible) {
          const bg = panel.style.background;
          graphic.rect(0, 0, panel.width, panel.height);
          graphic.fill({
            color: {
              r: bg.fill.r * 255,
              g: bg.fill.g * 255,
              b: bg.fill.b * 255,
            },
            alpha: bg.opacity,
          });
        }

        // Draw stroke if visible
        if (panel.style.stroke.isVisible) {
          const stroke = panel.style.stroke;
          graphic.rect(0, 0, panel.width, panel.height);
          graphic.stroke({
            color: {
              r: stroke.color.r * 255,
              g: stroke.color.g * 255,
              b: stroke.color.b * 255,
            },
            width: stroke.width,
            alpha: stroke.opacity,
          });
        }

        graphic.x = panel.x;
        graphic.y = panel.y;
        graphic.zIndex = panel.order;
        graphic.label = panel.id;

        // Make interactive for click detection
        graphic.eventMode = 'static';
        graphic.cursor = 'pointer';

        // Click handler to delete panel
        graphic.on('pointerdown', (event) => {
          event.stopPropagation();
          panelStore.removePanel(panel.id);
        });

        return graphic;
      };
      
      // Ticker to sync panels from store to stage
      app.ticker.add(() => {
        // Get all non-deleted panels
        const allPanels = panelStore.getPanelsArray().filter(p => !panelStore.isDeleted(p.id));
        const stageIds = new Set(panelsContainer.children.map(child => child.label));
        const panelIds = new Set(allPanels.map(panel => panel.id));

        // Add new panels that are clean (newly added panels start as clean)
        const cleanPanels = panelStore.getCleanPanels();
        cleanPanels.forEach(panel => {
          if (!stageIds.has(panel.id) && panel.isVisible) {
            const graphic = createPanelGraphic(panel);
            panelGraphics.set(panel.id, graphic);
            panelsContainer.addChild(graphic);
          }
        });

        // Remove panels that are deleted
        const deletedPanels = panelStore.getDeletedPanels();
        deletedPanels.forEach(panel => {
          const graphic = panelGraphics.get(panel.id);
          if (graphic) {
            panelsContainer.removeChild(graphic);
            panelGraphics.delete(panel.id);
          }
        });

        // Clean up deleted panels from store
        panelStore.purgeDeletedPanels();

        // Sort children by zIndex
        panelsContainer.sortChildren();
      });
      
      // Click handler to spawn panels
      let panelCounter = 0;
      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;
      app.stage.on('pointerdown', (event) => {
        const x = event.global.x;
        const y = event.global.y;

        panelCounter++;
        const id = `panel-${panelCounter}`;

        // Get current values from controls
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const colorHex = colorInput.value.replace('#', '');
        const r = parseInt(colorHex.substring(0, 2), 16) / 255;
        const g = parseInt(colorHex.substring(2, 4), 16) / 255;
        const b = parseInt(colorHex.substring(4, 6), 16) / 255;

        panelStore.addPanel({
          id,
          x,
          y,
          width,
          height,
          order: panelCounter,
          style: {
            background: {
              isVisible: true,
              fill: { r, g, b },
              opacity: 0.8,
            },
            stroke: {
              isVisible: true,
              color: { r: 0.2, g: 0.2, b: 0.2 },
              width: 2,
              opacity: 1,
            },
          },
        });
      });
    });

    return wrapper;
  },
};

export default meta;
type Story = StoryObj<PanelSpawnArgs>;

export const Default: Story = {};


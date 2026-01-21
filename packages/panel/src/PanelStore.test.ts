import { describe, it, expect, beforeEach } from 'vitest';
import { PanelStore } from './PanelStore';
import { PanelDataSchema, type PanelData } from './types';
import { PANEL_STATUS } from './constants';

describe('PanelStore', () => {
  let store: PanelStore;

  beforeEach(() => {
    store = new PanelStore();
  });

  describe('initialization', () => {
    it('should initialize with empty panels map', () => {
      expect(store.value.panels.size).toBe(0);
    });

    it('should initialize with provided panels map', () => {
      const panels = new Map<string, PanelData>([
        ['panel-1', {
          id: 'panel-1',
          order: 0,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          style: {
            background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
            stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
          },
          isVisible: true,
          status: PANEL_STATUS.CLEAN,
        }],
      ]);

      const storeWithPanels = new PanelStore(panels);
      expect(storeWithPanels.value.panels.size).toBe(1);
      expect(storeWithPanels.value.panels.get('panel-1')).toBeDefined();
    });

    it('should validate panels on initialization', () => {
      const invalidPanels = new Map<string, any>([
        ['panel-1', {
          id: 'panel-1',
          width: -100, // Invalid: negative width
        }],
      ]);

      expect(() => {
        new PanelStore(invalidPanels);
      }).toThrow();
    });
  });

  describe('addPanel', () => {
    it('should add a panel to the store', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: {
            isVisible: true,
            fill: { r: 1, g: 1, b: 1 },
            opacity: 1,
          },
          stroke: {
            isVisible: true,
            color: { r: 0.8, g: 0.8, b: 0.8 },
            width: 1,
            opacity: 1,
          },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      expect(store.value.panels.size).toBe(1);
      expect(store.value.panels.get('panel-1')).toEqual(panel);
    });

    it('should add multiple panels', () => {
      const panel1: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      const panel2: PanelData = {
        id: 'panel-2',
        order: 1,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel1);
      store.addPanel(panel2);
      expect(store.value.panels.size).toBe(2);
    });
  });

  describe('removePanel', () => {
    it('should mark a panel as deleted', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      expect(store.value.panels.size).toBe(1);

      store.removePanel('panel-1');
      expect(store.value.panels.size).toBe(1);
      expect(store.value.panels.get('panel-1')?.status).toBe(PANEL_STATUS.DELETED);
    });
  });

  describe('updatePanel', () => {
    it('should update panel properties', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      store.updatePanel('panel-1', { x: 200, y: 200 });

      const updated = store.value.panels.get('panel-1');
      expect(updated?.x).toBe(200);
      expect(updated?.y).toBe(200);
      expect(updated?.width).toBe(200);
      expect(updated?.height).toBe(150);
    });

    it('should throw error if panel not found', () => {
      expect(() => {
        store.updatePanel('non-existent', { x: 100 });
      }).toThrow('Panel with id "non-existent" not found');
    });
  });

  describe('updatePanelPosition', () => {
    it('should update panel position', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      store.updatePanelPosition('panel-1', 300, 400);

      const updated = store.value.panels.get('panel-1');
      expect(updated?.x).toBe(300);
      expect(updated?.y).toBe(400);
    });

    it('should throw error if panel not found', () => {
      expect(() => {
        store.updatePanelPosition('non-existent', 100, 100);
      }).toThrow('Panel with id "non-existent" not found');
    });
  });

  describe('updatePanelSize', () => {
    it('should update panel size', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      store.updatePanelSize('panel-1', 300, 250);

      const updated = store.value.panels.get('panel-1');
      expect(updated?.width).toBe(300);
      expect(updated?.height).toBe(250);
    });

    it('should throw error if panel not found', () => {
      expect(() => {
        store.updatePanelSize('non-existent', 100, 100);
      }).toThrow('Panel with id "non-existent" not found');
    });
  });

  describe('updatePanelBackground', () => {
    it('should update panel background', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      store.updatePanelBackground('panel-1', {
        fill: { r: 1, g: 0, b: 0 },
        opacity: 0.5,
      });

      const updated = store.value.panels.get('panel-1');
      expect(updated?.style.background.fill).toEqual({ r: 1, g: 0, b: 0 });
      expect(updated?.style.background.opacity).toBe(0.5);
    });

    it('should throw error if panel not found', () => {
      expect(() => {
        store.updatePanelBackground('non-existent', {});
      }).toThrow('Panel with id "non-existent" not found');
    });
  });

  describe('updatePanelOrder', () => {
    it('should update panel order', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      store.updatePanelOrder('panel-1', 5);

      const updated = store.value.panels.get('panel-1');
      expect(updated?.order).toBe(5);
    });

    it('should throw error if panel not found', () => {
      expect(() => {
        store.updatePanelOrder('non-existent', 1);
      }).toThrow('Panel with id "non-existent" not found');
    });
  });

  describe('getPanel', () => {
    it('should get a panel by id', () => {
      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
        status: PANEL_STATUS.CLEAN,
      };

      store.addPanel(panel);
      const retrieved = store.getPanel('panel-1');
      // Note: addPanel will set status to CLEAN via the schema default
      expect(retrieved?.id).toBe(panel.id);
    });

    it('should return undefined for non-existent panel', () => {
      const retrieved = store.getPanel('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getPanelsArray', () => {
    it('should return panels sorted by order', () => {
      const panel1: PanelData = {
        id: 'panel-1',
        order: 2,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      const panel2: PanelData = {
        id: 'panel-2',
        order: 0,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      const panel3: PanelData = {
        id: 'panel-3',
        order: 1,
        x: 200,
        y: 200,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      store.addPanel(panel1);
      store.addPanel(panel2);
      store.addPanel(panel3);

      const panels = store.getPanelsArray();
      expect(panels).toHaveLength(3);
      expect(panels[0].id).toBe('panel-2');
      expect(panels[1].id).toBe('panel-3');
      expect(panels[2].id).toBe('panel-1');
    });
  });

  describe('getVisiblePanels', () => {
    it('should return only visible panels', () => {
      const panel1: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      const panel2: PanelData = {
        id: 'panel-2',
        order: 1,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: false,
      };

      store.addPanel(panel1);
      store.addPanel(panel2);

      const visiblePanels = store.getVisiblePanels();
      expect(visiblePanels).toHaveLength(1);
      expect(visiblePanels[0].id).toBe('panel-1');
    });
  });

  describe('clearPanels', () => {
    it('should remove all panels', () => {
      const panel1: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      const panel2: PanelData = {
        id: 'panel-2',
        order: 1,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      store.addPanel(panel1);
      store.addPanel(panel2);
      expect(store.value.panels.size).toBe(2);

      store.clearPanels();
      expect(store.value.panels.size).toBe(0);
    });
  });

  describe('getPanelCount', () => {
    it('should return the number of panels', () => {
      expect(store.getPanelCount()).toBe(0);

      const panel: PanelData = {
        id: 'panel-1',
        order: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: { isVisible: true, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 },
        },
        isVisible: true,
      };

      store.addPanel(panel);
      expect(store.getPanelCount()).toBe(1);
    });
  });

  describe('style with false values', () => {
    it('should accept false for background', () => {
      const panelData = PanelDataSchema.parse({
        id: 'panel-1',
        style: {
          background: false,
          stroke: { isVisible: true, color: { r: 0, g: 0, b: 0 }, width: 1, opacity: 1 },
        },
      });

      expect(panelData.style.background.isVisible).toBe(false);
    });

    it('should accept false for stroke', () => {
      const panelData = PanelDataSchema.parse({
        id: 'panel-1',
        style: {
          background: { isVisible: true, fill: { r: 1, g: 1, b: 1 }, opacity: 1 },
          stroke: false,
        },
      });

      expect(panelData.style.stroke.isVisible).toBe(false);
    });

    it('should accept false for both background and stroke', () => {
      const panelData = PanelDataSchema.parse({
        id: 'panel-1',
        style: {
          background: false,
          stroke: false,
        },
      });

      expect(panelData.style.background.isVisible).toBe(false);
      expect(panelData.style.stroke.isVisible).toBe(false);
    });
  });
});

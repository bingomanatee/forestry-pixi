import { Forest } from '@wonderlandlabs/forestry4';
import { PanelDataSchema } from './types';
import type {
  PanelData,
  PanelStyle,
  PanelStoreValue,
  PanelStatus,
  BackgroundStyleIF,
  StrokeStyleIF
} from './types';
import { PANEL_STATUS } from './constants';

export class PanelStore extends Forest<PanelStoreValue> {
  constructor(panels?: Map<string, PanelData>) {
    // Validate all panels if provided
    const validatedPanels = new Map<string, PanelData>();
    panels?.forEach((panel, id) => {
      validatedPanels.set(id, PanelDataSchema.parse(panel));
    });

    super({
      value: {
        panels: validatedPanels,
      },
    });
  }

  /**
   * Add a new panel (validates with Zod)
   */
  addPanel(panel: Partial<PanelData> & { id: string }) {
    const validatedPanel = PanelDataSchema.parse(panel);
    this.set(['panels', validatedPanel.id], validatedPanel);
  }

  /**
   * Remove a panel by ID (marks as deleted)
   */
  removePanel(id: string) {
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const updatedPanel = PanelDataSchema.parse({ ...panel, status: PANEL_STATUS.DELETED });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Update a panel (validates merged result with Zod)
   */
  updatePanel(id: string, updates: Partial<PanelData>) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const updatedPanel = PanelDataSchema.parse({ ...panel, ...updates, status: PANEL_STATUS.DIRTY });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Update panel position (validates with Zod)
   */
  updatePanelPosition(id: string, x: number, y: number) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const updatedPanel = PanelDataSchema.parse({ ...panel, x, y, status: PANEL_STATUS.DIRTY });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Update panel size (validates with Zod)
   */
  updatePanelSize(id: string, width: number, height: number) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const updatedPanel = PanelDataSchema.parse({ ...panel, width, height, status: PANEL_STATUS.DIRTY });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Update panel background style (validates with Zod)
   */
  updatePanelBackground(id: string, background: Partial<BackgroundStyleIF> | false) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const newBackground = background === false
      ? false
      : { ...panel.style.background, ...background };
    const updatedPanel = PanelDataSchema.parse({
      ...panel,
      style: { ...panel.style, background: newBackground },
      status: PANEL_STATUS.DIRTY
    });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Update panel stroke style (validates with Zod)
   */
  updatePanelStroke(id: string, stroke: Partial<StrokeStyleIF> | false) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const newStroke = stroke === false
      ? false
      : { ...panel.style.stroke, ...stroke };
    const updatedPanel = PanelDataSchema.parse({
      ...panel,
      style: { ...panel.style, stroke: newStroke },
      status: PANEL_STATUS.DIRTY
    });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Update panel order (validates with Zod)
   */
  updatePanelOrder(id: string, order: number) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const updatedPanel = PanelDataSchema.parse({ ...panel, order, status: PANEL_STATUS.DIRTY });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Get a panel by ID
   */
  getPanel(id: string): PanelData | undefined {
    return this.value.panels.get(id);
  }

  /**
   * Get all panels as an array, sorted by order
   */
  getPanelsArray(): PanelData[] {
    return Array.from(this.value.panels.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get visible panels as an array, sorted by order
   */
  getVisiblePanels(): PanelData[] {
    return this.getPanelsArray().filter(panel => panel.isVisible);
  }

  /**
   * Clear all panels (marks all as deleted)
   */
  clearPanels() {
    this.mutate(draft => {
      draft.panels.forEach((panel: PanelData, id: string) => {
        draft.panels.set(id, { ...panel, status: PANEL_STATUS.DELETED });
      });
    });
  }

  /**
   * Get panel count
   */
  getPanelCount(): number {
    return this.value.panels.size;
  }

  /**
   * Check if a panel is deleted
   */
  isDeleted(id: string): boolean {
    const panel = this.value.panels.get(id);
    return panel?.status === PANEL_STATUS.DELETED;
  }

  /**
   * Set custom data property on a panel
   */
  setPanelData(id: string, key: string, value: any) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel) {
      throw new Error(`Panel with id "${id}" not found`);
    }
    const data = panel.data ? new Map(panel.data) : new Map();
    data.set(key, value);
    const updatedPanel = PanelDataSchema.parse({ ...panel, data, status: PANEL_STATUS.DIRTY });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Get custom data property from a panel
   */
  getPanelData(id: string, key: string): any {
    const panel = this.value.panels.get(id);
    return panel?.data?.get(key);
  }

  /**
   * Remove custom data property from a panel
   */
  removePanelData(id: string, key: string) {
    if (this.isDeleted(id)) return;
    const panel = this.value.panels.get(id);
    if (!panel || !panel.data) {
      return;
    }
    const data = new Map(panel.data);
    data.delete(key);
    const updatedPanel = PanelDataSchema.parse({ ...panel, data, status: PANEL_STATUS.DIRTY });
    this.set(['panels', id], updatedPanel);
  }

  /**
   * Get panels by status
   */
  getPanelsByStatus(status: PanelStatus): PanelData[] {
    return Array.from(this.value.panels.values()).filter(panel => panel.status === status);
  }

  /**
   * Get all clean panels (for change detection in pre())
   */
  getCleanPanels(): PanelData[] {
    return this.getPanelsByStatus(PANEL_STATUS.CLEAN);
  }

  /**
   * Get all dirty panels (panels that need redrawing)
   */
  getDirtyPanels(): PanelData[] {
    return this.getPanelsByStatus(PANEL_STATUS.DIRTY);
  }

  /**
   * Get all deleted panels
   */
  getDeletedPanels(): PanelData[] {
    return this.getPanelsByStatus(PANEL_STATUS.DELETED);
  }

  /**
   * Mark all panels as clean
   */
  markAllPanelsClean() {
    this.mutate(draft => {
      draft.panels.forEach((panel: PanelData, id: string) => {
        if (panel.status !== PANEL_STATUS.DELETED) {
          draft.panels.set(id, { ...panel, status: PANEL_STATUS.CLEAN });
        }
      });
    });
  }

  /**
   * Remove all deleted panels from the store
   */
  purgeDeletedPanels() {
    this.mutate(draft => {
      draft.panels.forEach((panel: PanelData, id: string) => {
        if (panel.status === PANEL_STATUS.DELETED) {
          draft.panels.delete(id);
        }
      });
    });
  }
}


import { ListStore, CellStore, type ListStoreConfig, type Padding, type CellConfig } from '@forestry-pixi/list';
import { StyleTree, fromJSON } from '@forestry-pixi/style-tree';
import { Application } from 'pixi.js';
import { ToolbarButtonStore } from './ToolbarButtonStore';
import type { ToolbarConfig, ToolbarButtonConfig } from './types';
import { ToolbarConfigSchema } from './types';
import defaultStyles from './styles/toolbar.default.json';

/**
 * Convert toolbar padding config to Padding type
 */
function normalizePadding(padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined): Padding | undefined {
  if (padding === undefined) return undefined;
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }
  return {
    top: padding.top ?? 0,
    right: padding.right ?? 0,
    bottom: padding.bottom ?? 0,
    left: padding.left ?? 0,
  };
}

/**
 * ToolbarStore - A ListStore-based toolbar that manages ToolbarButtonStore cells.
 * Extends ListStore for layout management and uses StyleTree for button styling.
 * Buttons are cells - ListStore handles all layout via gap.
 */
export class ToolbarStore extends ListStore {
  #styleTree!: StyleTree;
  #toolbarConfig!: ToolbarConfig;
  #bitmapFontName?: string;
  #buttonConfigs!: Map<string, ToolbarButtonConfig>;

  // Static storage for constructor params (needed because createCell is called during super())
  static #pendingInit?: {
    styleTree: StyleTree;
    toolbarConfig: ToolbarConfig;
    bitmapFontName?: string;
    buttonConfigs: Map<string, ToolbarButtonConfig>;
  };

  constructor(config: ToolbarConfig, app: Application) {
    // Parse config through schema to apply defaults
    const parsedConfig = ToolbarConfigSchema.parse(config);

    // Use provided StyleTree or load default styles
    const styleTree = parsedConfig.style ?? fromJSON(defaultStyles);

    // Create a map of button configs by id for createCell to use
    const buttonConfigsMap = new Map<string, ToolbarButtonConfig>();
    for (const btn of parsedConfig.buttons) {
      buttonConfigsMap.set(btn.id, btn);
    }

    // Store in static so createCell can access during super()
    ToolbarStore.#pendingInit = {
      styleTree,
      toolbarConfig: parsedConfig,
      bitmapFontName: parsedConfig.bitmapFont,
      buttonConfigs: buttonConfigsMap,
    };

    // Convert button configs to cell configs for ListStore
    const cellConfigs: CellConfig[] = parsedConfig.buttons.map(btn => ({
      id: btn.id,
      variant: btn.variant,
    }));

    // Convert toolbar config to ListStore config
    const listConfig: ListStoreConfig = {
      id: parsedConfig.id ?? 'toolbar',
      direction: parsedConfig.orientation === 'vertical' ? 'vertical' : 'horizontal',
      width: parsedConfig.width ?? 400,
      height: parsedConfig.height ?? 50,
      cells: cellConfigs,
      mainAlign: 'start',
      crossAlign: 'center',
      style: {
        gap: parsedConfig.spacing,
        background: parsedConfig.background,
      },
      padding: normalizePadding(parsedConfig.padding),
      autoSize: !(parsedConfig.fixedSize ?? false),
    };

    super(listConfig, app);

    // Now copy from static to instance
    this.#styleTree = ToolbarStore.#pendingInit.styleTree;
    this.#toolbarConfig = ToolbarStore.#pendingInit.toolbarConfig;
    this.#bitmapFontName = ToolbarStore.#pendingInit.bitmapFontName;
    this.#buttonConfigs = ToolbarStore.#pendingInit.buttonConfigs;

    // Clear static storage
    ToolbarStore.#pendingInit = undefined;
  }

  /**
   * Override createCell to create ToolbarButtonStore instances instead of CellStore.
   * This is called by ListStore during initialization.
   */
  protected createCell(cellConfig: CellConfig): CellStore {
    // Get the pending init data (during super()) or instance data (after super())
    const initData = ToolbarStore.#pendingInit ?? {
      styleTree: this.#styleTree,
      bitmapFontName: this.#bitmapFontName,
      buttonConfigs: this.#buttonConfigs,
    };

    const buttonConfig = initData.buttonConfigs.get(cellConfig.id);
    if (!buttonConfig) {
      // Fallback to default cell if no button config found
      return super.createCell(cellConfig);
    }

    return new ToolbarButtonStore(
      buttonConfig,
      this.application,
      this,
      initData.styleTree,
      initData.bitmapFontName
    );
  }

  /**
   * Add a button to the toolbar
   */
  addButton(buttonConfig: ToolbarButtonConfig): ToolbarButtonStore {
    // Store the button config so createCell can find it
    this.#buttonConfigs.set(buttonConfig.id, buttonConfig);

    // Use ListStore's addCell which will call our createCell override
    const cell = this.addCell({
      id: buttonConfig.id,
      variant: buttonConfig.variant,
    });

    return cell as ToolbarButtonStore;
  }

  /**
   * Remove a button by id
   */
  removeButton(id: string): void {
    this.#buttonConfigs.delete(id);
    this.removeCell(id);
  }

  /**
   * Get a button by id
   */
  getButton(id: string): ToolbarButtonStore | undefined {
    return this.getCell(id) as ToolbarButtonStore | undefined;
  }

  /**
   * Get all buttons
   */
  getButtons(): ToolbarButtonStore[] {
    return Array.from(this.cells.values()) as ToolbarButtonStore[];
  }

  /**
   * Get the StyleTree used by this toolbar
   */
  get styleTree(): StyleTree {
    return this.#styleTree;
  }

  /**
   * Get the toolbar config
   */
  get toolbarConfig(): ToolbarConfig {
    return this.#toolbarConfig;
  }
}


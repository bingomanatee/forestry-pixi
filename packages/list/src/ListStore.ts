import { BoxStore, type Padding } from '@forestry-pixi/box';
import { Application, Container } from 'pixi.js';
import type { ListConfig, CellConfig, CellClass, MainAlign, CrossAlign } from './types';
import { resolveAlignment } from './types';
import { CellStore } from './CellStore';

/**
 * Extended state for ListStore that includes list-specific properties
 */
export interface ListState {
    direction: 'horizontal' | 'vertical';
    mainAlign: 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around';
    crossAlign: 'start' | 'end' | 'center' | 'stretch';
    style?: import('./types').ListStyle;
    cells: CellConfig[];
}

export interface ListStoreConfig extends ListConfig {
    cellClass?: CellClass;
}

/**
 * ListStore manages a list of cells with flexible layout.
 * Extends BoxStore for container hierarchy, background rendering, and masking.
 * Supports horizontal/vertical direction, flex-like alignment, and styled backgrounds.
 */
export class ListStore extends BoxStore {
    #cellsContainer: Container = new Container({ label: 'cells-container' });
    #cells: Map<string, CellStore> = new Map();
    #cellClass: CellClass;
    #listConfig: ListStoreConfig;
    #isAutoResizing: boolean = false;

    constructor(config: ListStoreConfig, app: Application) {
        // Initialize BoxStore with list dimensions and background style
        super({
            id: config.id,
            forestryProps: {
                rect: {
                    x: 0,
                    y: 0,
                    width: config.width,
                    height: config.height,
                },
                align: { horizontal: 'left', vertical: 'top' },
                padding: config.padding,
            },
            boxProps: {
                style: config.style?.background,
            },
            rootProps: {
                label: `list-${config.id}`,
            },
        }, app);

        this.#cellClass = config.cellClass ?? CellStore;
        this.#listConfig = config;

        // Add cells container to content container
        this.contentContainer.addChild(this.#cellsContainer);

        // Initialize cells
        this.#initCells(config.cells);
    }

    /**
     * Get list-specific state with resolved alignment
     */
    get listState(): ListState {
        const { mainAlign, crossAlign } = resolveAlignment(this.#listConfig);
        return {
            direction: this.#listConfig.direction,
            mainAlign,
            crossAlign,
            style: this.#listConfig.style,
            cells: this.#listConfig.cells,
        };
    }

    #initCells(cellConfigs: CellConfig[]): void {
        for (const cellConfig of cellConfigs) {
            this.#addCellInternal(cellConfig);
        }
    }

    #addCellInternal(cellConfig: CellConfig): CellStore {
        const cell = this.createCell(cellConfig);
        this.#cells.set(cellConfig.id, cell);
        this.#cellsContainer.addChild(cell.container);
        return cell;
    }

    /**
     * Create a cell instance. Override in subclasses to create custom cell types.
     */
    protected createCell(cellConfig: CellConfig): CellStore {
        return new this.#cellClass(cellConfig, this.application, this);
    }

    /**
     * Add a new cell to the list
     */
    addCell(cellConfig: CellConfig): CellStore {
        const cell = this.#addCellInternal(cellConfig);
        this.#listConfig.cells.push(cellConfig);
        this.markDirty();
        return cell;
    }

    /**
     * Remove a cell by id
     */
    removeCell(id: string): void {
        const cell = this.#cells.get(id);
        if (cell) {
            cell.cleanup();
            this.#cells.delete(id);
            this.#listConfig.cells = this.#listConfig.cells.filter(c => c.id !== id);
            this.markDirty();
        }
    }

    /**
     * Get a cell by id
     */
    getCell(id: string): CellStore | undefined {
        return this.#cells.get(id);
    }

    /**
     * Get all cells
     */
    get cells(): ReadonlyMap<string, CellStore> {
        return this.#cells;
    }

    #computeLayout(): void {
        const { direction, style, cells } = this.listState;
        const gap = style?.gap ?? 0;
        const isHorizontal = direction === 'horizontal';

        // Get each cell's absolute preferred size
        const cellSizes: Array<{ width: number; height: number }> = [];
        for (const cellConfig of cells) {
            const cell = this.#cells.get(cellConfig.id);
            if (cell) {
                const preferred = cell.getPreferredSize();
                cellSizes.push({
                    width: preferred.width ?? 50,
                    height: preferred.height ?? 50,
                });
            } else {
                cellSizes.push({ width: 50, height: 50 });
            }
        }

        // Position cells sequentially along main axis
        let mainPos = 0;

        cells.forEach((cellConfig, index) => {
            const cell = this.#cells.get(cellConfig.id);
            if (!cell) return;

            const size = cellSizes[index];

            // For horizontal: x advances, y = 0
            // For vertical: y advances, x = 0
            const x = isHorizontal ? mainPos : 0;
            const y = isHorizontal ? 0 : mainPos;
            const w = size.width;
            const h = size.height;

            cell.setComputedLayout(x, y, w, h);

            // Advance main position by cell's main dimension + gap
            const mainDimension = isHorizontal ? w : h;
            mainPos += mainDimension + gap;
        });
    }

    /**
     * Override resolve to compute layout and auto-resize BEFORE rendering background
     */
    protected resolve(): void {
        // Compute cell layout first (positions cells based on their preferred sizes)
        this.#computeLayout();
        // Auto-resize container to fit cells (updates rect dimensions)
        this.#autoResize();
        // Center cells within the container (cross-axis centering)
        this.#centerCells();
        // Now call parent resolve to render background with correct dimensions
        super.resolve();
    }

    /**
     * Center cells within the container on the cross-axis.
     * For horizontal lists: center cells vertically
     * For vertical lists: center cells horizontally
     */
    #centerCells(): void {
        const { direction, crossAlign } = this.listState;

        // Only center if crossAlign is 'center'
        if (crossAlign !== 'center') {
            return;
        }

        const isHorizontal = direction === 'horizontal';
        const contentArea = this.getContentArea();

        for (const cell of this.#cells.values()) {
            const cellRect = cell.rect;

            if (isHorizontal) {
                // Center vertically: adjust y position
                const newY = (contentArea.height - cellRect.height) / 2;
                cell.setComputedLayout(cellRect.x, newY, cellRect.width, cellRect.height);
            } else {
                // Center horizontally: adjust x position
                const newX = (contentArea.width - cellRect.width) / 2;
                cell.setComputedLayout(newX, cellRect.y, cellRect.width, cellRect.height);
            }
        }
    }

    /**
     * Auto-resize list to fit cells if autoSize is enabled.
     * Uses absolute cell sizes - container size is derived from cell positions.
     */
    #autoResize(): void {
        // Skip if already auto-resizing (prevents infinite loop from mutate -> resolve -> autoResize)
        if (this.#isAutoResizing) {
            return;
        }

        if (!this.#listConfig.autoSize || this.#cells.size === 0) {
            return;
        }

        const padding = this.value.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };

        let maxRight = 0;
        let maxBottom = 0;

        // Find the extent of all cells
        for (const cell of this.#cells.values()) {
            const cellRect = cell.rect;
            maxRight = Math.max(maxRight, cellRect.x + cellRect.width);
            maxBottom = Math.max(maxBottom, cellRect.y + cellRect.height);
        }

        // Container size = cell extent + padding on all sides
        const newWidth = maxRight + padding.left + padding.right;
        const newHeight = maxBottom + padding.top + padding.bottom;

        // Only update if size changed
        const currentRect = this.rect;
        if (currentRect.width !== newWidth || currentRect.height !== newHeight) {
            this.#isAutoResizing = true;
            this.mutate(draft => {
                draft.rect.width = newWidth;
                draft.rect.height = newHeight;
                draft.isDirty = true;
            });
            this.#isAutoResizing = false;
        }
    }

    cleanup(): void {
        for (const cell of this.#cells.values()) {
            cell.cleanup();
        }
        this.#cells.clear();
        super.cleanup();
    }
}


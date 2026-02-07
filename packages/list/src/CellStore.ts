import { BoxStore, type BoxStyle } from '@forestry-pixi/box';
import { Application } from 'pixi.js';
import type { CellConfig } from './types';
import type { ListStore } from './ListStore';

/**
 * CellStore manages an individual cell within a ListStore.
 * Extends BoxStore for container hierarchy, masking, and alignment.
 *
 * Cells have:
 * - Width/height constraints (min, max, base)
 * - Computed position and size from parent layout
 * - Optional style overrides or variant references
 * - Custom rendering via subclassing
 */
export class CellStore extends BoxStore {
    #listStore: ListStore;
    #cellConfig: CellConfig;

    constructor(config: CellConfig, app: Application, listStore: ListStore) {
        // Initialize BoxStore with cell config
        super({
            id: config.id,
            forestryProps: {
                rect: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                },
                align: { horizontal: 'left', vertical: 'top' },
                noMask: true, // Cells typically don't need masking
            },
            boxProps: {
                // Style will be resolved from list + variant + direct override
            },
            rootProps: {
                label: `cell-${config.id}`,
            },
        }, app);

        this.#listStore = listStore;
        this.#cellConfig = config;
    }

    /**
     * Get the parent list store
     */
    get listStore(): ListStore {
        return this.#listStore;
    }

    /**
     * Get the cell config
     */
    get cellConfig(): CellConfig {
        return this.#cellConfig;
    }

    /**
     * Update computed layout values from parent
     */
    setComputedLayout(x: number, y: number, width: number, height: number): void {
        this.setRect({ x, y, width, height });
        // Update style based on resolved style
        const resolvedStyle = this.getResolvedStyle();
        this.setStyle(resolvedStyle);
    }

    /**
     * Get the preferred size of this cell.
     * Override in subclasses to compute size dynamically (e.g., based on content).
     * Returns undefined for width/height if the cell should flex to fill available space.
     */
    getPreferredSize(): { width?: number; height?: number } {
        return {
            width: this.#cellConfig.width?.base,
            height: this.#cellConfig.height?.base,
        };
    }

    /**
     * Get the resolved style for this cell (variant + direct override)
     */
    getResolvedStyle(): BoxStyle {
        const listStyle = this.#listStore.listState.style;
        const baseStyle = listStyle?.cell ?? {};

        // Check for variant style
        const variant = this.#cellConfig.variant;
        const variantStyle = variant && listStyle?.cellVariants?.[variant]
            ? listStyle.cellVariants[variant]
            : {};

        // Direct style override takes precedence
        const directStyle = this.#cellConfig.style ?? {};

        // Merge: base < variant < direct
        return this.#mergeStyles(baseStyle, variantStyle, directStyle);
    }

    #mergeStyles(...styles: BoxStyle[]): BoxStyle {
        const result: BoxStyle = {};
        for (const style of styles) {
            if (style.fill) result.fill = { ...result.fill, ...style.fill };
            if (style.stroke) result.stroke = { ...result.stroke, ...style.stroke };
            if (style.borderRadius !== undefined) result.borderRadius = style.borderRadius;
        }
        return result;
    }
}


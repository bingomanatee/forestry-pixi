import { z } from 'zod';
import {
    RgbColorSchema,
    FillStyleSchema,
    StrokeStyleSchema,
    BoxStyleSchema,
    PaddingSchema,
    type RgbColor,
    type FillStyle,
    type StrokeStyle,
    type BoxStyle,
    type Padding,
} from '@forestry-pixi/box';

// Re-export box types for convenience
export { RgbColorSchema, FillStyleSchema, StrokeStyleSchema, BoxStyleSchema, PaddingSchema };
export type { RgbColor, FillStyle, StrokeStyle, BoxStyle, Padding };

// ==================== List-specific Alignment ====================

export const MainAlignSchema = z.enum(['start', 'end', 'center', 'stretch', 'space-between', 'space-around']);
export type MainAlign = z.infer<typeof MainAlignSchema>;

export const CrossAlignSchema = z.enum(['start', 'end', 'center', 'stretch']);
export type CrossAlign = z.infer<typeof CrossAlignSchema>;

export const DirectionSchema = z.enum(['horizontal', 'vertical']);
export type Direction = z.infer<typeof DirectionSchema>;

// ==================== Cell Sizing ====================

export const CellSizeSchema = z.object({
    base: z.number().optional(),      // Preferred size
    min: z.number().optional(),       // Minimum size
    max: z.number().optional(),       // Maximum size
});
export type CellSize = z.infer<typeof CellSizeSchema>;

// ==================== Cell Config ====================

export const CellConfigSchema = z.object({
    id: z.string(),
    width: CellSizeSchema.optional(),   // Width constraints (for horizontal lists, this is main axis)
    height: CellSizeSchema.optional(),  // Height constraints (for vertical lists, this is main axis)
    variant: z.string().optional(),     // Style variant name
    style: BoxStyleSchema.optional(),   // Direct style override
    data: z.any().optional(),           // User data for custom rendering
});
export type CellConfig = z.infer<typeof CellConfigSchema>;

// ==================== Cell State (internal) ====================

export interface CellState extends CellConfig {
    isDirty: boolean;
    computedX: number;      // Computed position after layout
    computedY: number;
    computedWidth: number;  // Computed size after layout
    computedHeight: number;
}

// ==================== List Style ====================

export const ListStyleSchema = z.object({
    background: BoxStyleSchema.optional(),
    cell: BoxStyleSchema.optional(),           // Default cell style
    cellVariants: z.record(z.string(), BoxStyleSchema).optional(),  // Named cell variants
    gap: z.number().optional(),                // Gap between cells
});
export type ListStyle = z.infer<typeof ListStyleSchema>;

// ==================== List Config ====================

export const ListConfigSchema = z.object({
    id: z.string(),
    width: z.number(),
    height: z.number(),
    direction: DirectionSchema.default('horizontal'),
    // Main/cross axis alignment (flex-style naming)
    mainAlign: MainAlignSchema.optional(),
    crossAlign: CrossAlignSchema.optional(),
    // Explicit axis alignment (alternative naming)
    xAlign: MainAlignSchema.optional(),
    yAlign: CrossAlignSchema.optional(),
    padding: PaddingSchema.optional(),              // Padding around list content
    style: ListStyleSchema.optional(),
    cells: z.array(CellConfigSchema).default([]),
    // Auto-size: resize list to fit cells after layout
    // Width = right edge of last cell + padding (horizontal)
    // Height = tallest cell + padding (horizontal)
    autoSize: z.boolean().optional(),
});
export type ListConfig = z.infer<typeof ListConfigSchema>;

/**
 * Helper to resolve alignment from config.
 * Supports both mainAlign/crossAlign and xAlign/yAlign naming.
 * For horizontal lists: xAlign = mainAlign, yAlign = crossAlign
 * For vertical lists: yAlign = mainAlign, xAlign = crossAlign
 */
export function resolveAlignment(config: ListConfig): { mainAlign: MainAlign; crossAlign: CrossAlign } {
    const isHorizontal = config.direction === 'horizontal';

    // Determine main axis alignment
    let mainAlign: MainAlign = 'start';
    if (config.mainAlign) {
        mainAlign = config.mainAlign;
    } else if (isHorizontal && config.xAlign) {
        mainAlign = config.xAlign;
    } else if (!isHorizontal && config.yAlign) {
        mainAlign = config.yAlign;
    }

    // Determine cross axis alignment
    let crossAlign: CrossAlign = 'start';
    if (config.crossAlign) {
        crossAlign = config.crossAlign;
    } else if (isHorizontal && config.yAlign) {
        crossAlign = config.yAlign as CrossAlign;
    } else if (!isHorizontal && config.xAlign) {
        crossAlign = config.xAlign as CrossAlign;
    }

    return { mainAlign, crossAlign };
}

// ==================== List State (internal) ====================

export interface ListState extends ListConfig {
    isDirty: boolean;
}

// ==================== Cell Class Interface ====================

/**
 * Interface for custom cell classes that can be used with ListStore.
 * Custom cells must extend CellStore and implement this interface.
 */
export interface CellClass {
    new (config: CellConfig, app: import('pixi.js').Application, listStore: any): import('./CellStore').CellStore;
}


import { z } from 'zod';
import type { Container, ContainerOptions, FederatedPointerEvent } from 'pixi.js';

// ==================== Alignment ====================

/**
 * Horizontal alignment for content within the box
 */
export const HorizontalAlignSchema = z.enum(['left', 'center', 'right']);
export type HorizontalAlign = z.infer<typeof HorizontalAlignSchema>;

/**
 * Vertical alignment for content within the box
 */
export const VerticalAlignSchema = z.enum(['top', 'center', 'bottom']);
export type VerticalAlign = z.infer<typeof VerticalAlignSchema>;

// ==================== Alignment Combined ====================

export const AlignSchema = z.object({
    horizontal: HorizontalAlignSchema.default('left'),
    vertical: VerticalAlignSchema.default('top'),
});
export type Align = z.infer<typeof AlignSchema>;

// ==================== Rect ====================

export const RectSchema = z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    width: z.number(),
    height: z.number(),
});
export type Rect = z.infer<typeof RectSchema>;

// ==================== Colors & Styles ====================

export const RgbColorSchema = z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
});
export type RgbColor = z.infer<typeof RgbColorSchema>;

export const FillStyleSchema = z.object({
    color: RgbColorSchema.optional(),
    alpha: z.number().min(0).max(1).optional(),
});
export type FillStyle = z.infer<typeof FillStyleSchema>;

export const StrokeStyleSchema = z.object({
    color: RgbColorSchema.optional(),
    alpha: z.number().min(0).max(1).optional(),
    width: z.number().optional(),
});
export type StrokeStyle = z.infer<typeof StrokeStyleSchema>;

export const BoxStyleSchema = z.object({
    fill: FillStyleSchema.optional(),
    stroke: StrokeStyleSchema.optional(),
    borderRadius: z.number().optional(),
});
export type BoxStyle = z.infer<typeof BoxStyleSchema>;

// ==================== Box Props (non-state config) ====================

export interface BoxProps {
    style?: BoxStyle;
    render?: (store: any) => void;
    onPointerDown?: (event: FederatedPointerEvent, store: any) => void;
}

// ==================== Padding ====================

export const PaddingSchema = z.object({
    top: z.number().default(0),
    right: z.number().default(0),
    bottom: z.number().default(0),
    left: z.number().default(0),
});
export type Padding = z.infer<typeof PaddingSchema>;

/**
 * Helper to create uniform padding
 */
export function uniformPadding(value: number): Padding {
    return { top: value, right: value, bottom: value, left: value };
}

/**
 * Helper to create symmetric padding (vertical, horizontal)
 */
export function symmetricPadding(vertical: number, horizontal: number): Padding {
    return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
}

// ==================== Forestry Props (state) ====================

export const ForestryPropsSchema = z.object({
    rect: RectSchema,
    align: AlignSchema.optional(),
    padding: PaddingSchema.optional(),
    noMask: z.boolean().optional(),
});
export type ForestryProps = z.infer<typeof ForestryPropsSchema>;

// ==================== Box State (internal) ====================

export interface BoxState extends ForestryProps {
    isDirty: boolean;
}

// ==================== Box Config (constructor args) ====================

export interface BoxConfig {
    id: string;
    forestryProps: ForestryProps;
    boxProps?: BoxProps;
    rootProps?: ContainerOptions;
}

// ==================== Computed Content Area ====================

/**
 * The inner content area (same as rect for now, but could include padding later)
 */
export interface ContentArea {
    x: number;      // Left edge of content area
    y: number;      // Top edge of content area
    width: number;  // Available width for content
    height: number; // Available height for content
}


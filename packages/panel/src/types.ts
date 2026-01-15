import { z } from 'zod';
import { PANEL_STATUS } from './constants';

// ============================================================================
// Panel Status Types
// ============================================================================

export const PanelStatusSchema = z.enum([
  PANEL_STATUS.CLEAN,
  PANEL_STATUS.DIRTY,
  PANEL_STATUS.DELETED,
]);
export type PanelStatus = z.infer<typeof PanelStatusSchema>;

// ============================================================================
// Color Types
// ============================================================================

// Reusable Color schema (PixiJS format: RGB values 0..1)
export const ColorSchema = z.object({
  r: z.number().min(0).max(1).default(1),
  g: z.number().min(0).max(1).default(1),
  b: z.number().min(0).max(1).default(1),
});

export type Color = z.infer<typeof ColorSchema>;

// ============================================================================
// Background Style Types
// ============================================================================

export interface BackgroundStyleIF {
  isVisible: boolean;
  fill: Color;
  opacity: number;
}

export type BackgroundStyleInput = Partial<BackgroundStyleIF>;

// ============================================================================
// Stroke Style Types
// ============================================================================

export interface StrokeStyleIF {
  isVisible: boolean;
  color: Color;
  width: number;
  opacity: number;
}

export type StrokeStyleInput = Partial<StrokeStyleIF>;

// ============================================================================
// Panel Style Schema
// ============================================================================

// Background schema - can be an object or false
export const BackgroundSchema = z.union([
  z.object({
    isVisible: z.boolean().default(true),
    fill: ColorSchema.default({ r: 1, g: 1, b: 1 }),
    opacity: z.number().min(0).max(1).default(1),
  }),
  z.literal(false),
]).transform((val) => {
  if (val === false) {
    return { isVisible: false, fill: { r: 1, g: 1, b: 1 }, opacity: 1 };
  }
  return val;
});

// Stroke schema - can be an object or false
export const StrokeSchema = z.union([
  z.object({
    isVisible: z.boolean().default(true),
    color: ColorSchema.default({ r: 0.8, g: 0.8, b: 0.8 }),
    width: z.number().min(0).default(1),
    opacity: z.number().min(0).max(1).default(1),
  }),
  z.literal(false),
]).transform((val) => {
  if (val === false) {
    return { isVisible: false, color: { r: 0.8, g: 0.8, b: 0.8 }, width: 1, opacity: 1 };
  }
  return val;
});

// Schema for individual panel style
export const PanelStyleSchema = z.object({
  background: BackgroundSchema.default({
    isVisible: true,
    fill: { r: 1, g: 1, b: 1 },
    opacity: 1,
  }),
  stroke: StrokeSchema.default({
    isVisible: true,
    color: { r: 0.8, g: 0.8, b: 0.8 },
    width: 1,
    opacity: 1,
  }),
});

export type PanelStyle = z.infer<typeof PanelStyleSchema>;

// ============================================================================
// Panel Data Schema
// ============================================================================

// Schema for individual panel
export const PanelDataSchema = z.object({
  id: z.string(),
  order: z.number().default(0),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().min(0).default(100),
  height: z.number().min(0).default(100),
  style: PanelStyleSchema.default({
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
  }),
  title: z.string().optional(),
  isVisible: z.boolean().default(true),
  data: z.map(z.string(), z.any()).optional(),
  status: PanelStatusSchema.default(PANEL_STATUS.CLEAN),
});

export type PanelData = z.infer<typeof PanelDataSchema>;

// ============================================================================
// Panel Store Schema
// ============================================================================

// Schema for the panel store value
export const PanelStoreSchema = z.object({
  panels: z.map(z.string(), PanelDataSchema).default(new Map()),
});

export type PanelStoreValue = z.infer<typeof PanelStoreSchema>;


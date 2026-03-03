import { z } from 'zod';
import { Rectangle } from 'pixi.js';
import type { Rect } from './rectTypes';

// ============================================================================
// Color Types (PixiJS format: RGB values 0..1)
// ============================================================================

export const ColorSchema = z.object({
  r: z.number().min(0).max(1).default(1),
  g: z.number().min(0).max(1).default(1),
  b: z.number().min(0).max(1).default(1),
});

export type Color = z.infer<typeof ColorSchema>;

// ============================================================================
// Handle Position Types
// ============================================================================

export enum HandlePosition {
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  TOP_RIGHT = 'top-right',
  MIDDLE_LEFT = 'middle-left',
  MIDDLE_RIGHT = 'middle-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_RIGHT = 'bottom-right',
}

export type HandleMode = 'ONLY_EDGE' | 'ONLY_CORNER' | 'EDGE_AND_CORNER';
export type RectTransformPhase = 'drag' | 'release';
export interface RectTransformParams {
  rect: Rectangle;
  phase: RectTransformPhase;
  handle: HandlePosition | null;
}
export type RectTransform = (params: RectTransformParams) => Rectangle | Rect;
export type TransformedRectCallback = (
  rawRect: Rectangle,
  transformedRect: Rectangle,
  phase: RectTransformPhase,
) => void;

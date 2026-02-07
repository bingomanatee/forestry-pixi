import { z } from 'zod';
import type { Sprite } from 'pixi.js';
import type { StyleTree } from '@forestry-pixi/style-tree';

// RGB Color schema (0..1 range)
export const RgbColorSchema = z.object({
  r: z.number().min(0).max(1).default(1),
  g: z.number().min(0).max(1).default(1),
  b: z.number().min(0).max(1).default(1),
});

export type RgbColor = z.infer<typeof RgbColorSchema>;

// Padding schema
export const PaddingSchema = z.object({
  x: z.number().min(0).default(4),
  y: z.number().min(0).default(4),
});

export type Padding = z.infer<typeof PaddingSchema>;

// Border stroke schema
export const BorderStrokeSchema = z.object({
  color: RgbColorSchema.default({ r: 0.5, g: 0.5, b: 0.5 }),
  alpha: z.number().min(0).max(1).default(1),
  width: z.number().min(0).default(2),
});

export type BorderStroke = z.infer<typeof BorderStrokeSchema>;

// Background fill schema
export const BackgroundFillSchema = z.object({
  color: RgbColorSchema,
  alpha: z.number().min(0).max(1).default(1),
});

export type BackgroundFill = z.infer<typeof BackgroundFillSchema>;

// Button state schema (contains stroke, optional fill, icon alpha, and optional icon tint)
export const ButtonStateSchema = z.object({
  stroke: BorderStrokeSchema.default({
    color: { r: 0.5, g: 0.5, b: 0.5 },
    alpha: 1,
    width: 2,
  }),
  fill: BackgroundFillSchema.optional(),
  iconAlpha: z.number().min(0).max(1).default(1),
  iconTint: RgbColorSchema.optional(),
});

export type ButtonState = z.infer<typeof ButtonStateSchema>;

// Button appearance configuration schema
export const ButtonAppearanceSchema = z.object({
  base: ButtonStateSchema.default({
    stroke: {
      color: { r: 0.5, g: 0.5, b: 0.5 },
      alpha: 1,
      width: 2,
    },
    iconAlpha: 1,
  }),
  hover: ButtonStateSchema.default({
    stroke: {
      color: { r: 0.7, g: 0.7, b: 0.7 },
      alpha: 1,
      width: 2,
    },
    iconAlpha: 1,
  }),
  disabled: ButtonStateSchema.default({
    stroke: {
      color: { r: 0.3, g: 0.3, b: 0.3 },
      alpha: 0.5,
      width: 2,
    },
    fill: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      alpha: 0.3,
    },
    iconAlpha: 0.5,
  }),
});

export type ButtonAppearance = z.infer<typeof ButtonAppearanceSchema>;

// Label state schema
export const LabelStateSchema = z.object({
  color: RgbColorSchema.default({ r: 0, g: 0, b: 0 }),
  alpha: z.number().min(0).max(1).default(0.5),
});

export type LabelState = z.infer<typeof LabelStateSchema>;

// Label configuration schema
export const LabelConfigSchema = z.object({
  base: LabelStateSchema.default({
    color: { r: 0, g: 0, b: 0 },
    alpha: 0.5,
  }),
  hover: LabelStateSchema.default({
    color: { r: 0, g: 0, b: 0 },
    alpha: 1,
  }),
  fontSize: z.number().min(1).default(12),
  padding: z.number().min(0).default(4),
});

export type LabelConfig = z.infer<typeof LabelConfigSchema>;

// Button mode - determines layout style
export const ButtonModeSchema = z.enum(['icon', 'text', 'inline']).default('icon');
export type ButtonMode = z.infer<typeof ButtonModeSchema>;

// Button configuration schema
// Either sprite or label (or both) must be provided
export const ToolbarButtonConfigSchema = z.object({
  id: z.string(),
  sprite: z.custom<Sprite>().optional(),
  label: z.string().optional(),
  // Mode determines button layout:
  // - 'icon': Icon with optional label below (default)
  // - 'text': Text-only button with background
  // - 'inline': Text with optional leading icon, side-by-side
  mode: ButtonModeSchema.optional(),
  // Variant name for style overrides (e.g., 'primary', 'danger', 'success')
  variant: z.string().optional(),
  iconSize: z.number().min(1).optional(),
  padding: PaddingSchema.optional(),
  appearance: ButtonAppearanceSchema.optional(),
  labelConfig: LabelConfigSchema.optional(),
  onClick: z.function().optional(),
  isDisabled: z.boolean().optional()
}).refine(
  (data) => data.sprite !== undefined || data.label !== undefined,
  { message: 'Either sprite or label must be provided' }
);

export type ToolbarButtonConfig = z.infer<typeof ToolbarButtonConfigSchema>;

// Background style schema (for toolbar background)
export const BackgroundStyleSchema = z.object({
  fill: z.object({
    color: RgbColorSchema.optional(),
    alpha: z.number().min(0).max(1).optional(),
  }).optional(),
  stroke: z.object({
    color: RgbColorSchema.optional(),
    alpha: z.number().min(0).max(1).optional(),
    width: z.number().min(0).optional(),
  }).optional(),
  borderRadius: z.number().min(0).optional(),
}).optional();

export type BackgroundStyle = z.infer<typeof BackgroundStyleSchema>;

// Toolbar configuration schema
// Note: Button styling is now handled entirely by StyleTree
export const ToolbarConfigSchema = z.object({
  // Unique identifier for the toolbar
  id: z.string().optional(),
  buttons: z.array(ToolbarButtonConfigSchema).default([]),
  spacing: z.number().min(0).default(8),
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  // Toolbar dimensions
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  // Fixed size: when true, toolbar keeps specified width/height and doesn't auto-resize
  // When false (default), toolbar resizes to fit buttons + gaps + padding + border
  // width/height become minimum values when fixedSize is false
  fixedSize: z.boolean().optional(),
  // Padding inside the toolbar
  padding: z.union([
    z.number(),
    z.object({
      top: z.number().optional(),
      right: z.number().optional(),
      bottom: z.number().optional(),
      left: z.number().optional(),
    }),
  ]).optional(),
  // Background style for the toolbar
  background: BackgroundStyleSchema,
  // Optional StyleTree for custom styling - if provided, replaces default styles entirely
  style: z.custom<StyleTree>().optional(),
  // Optional bitmap font name for labels (must be pre-loaded via Assets.load)
  bitmapFont: z.string().optional(),
});

export type ToolbarConfig = z.infer<typeof ToolbarConfigSchema>;


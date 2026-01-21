import { z } from 'zod';

// ============================================================================
// Grid Line Types
// ============================================================================

export interface GridLineOptions {
  x: number;
  y: number;
  color: number;
  alpha: number;
}

// Schema for grid line configuration
export const GridLineSchema = z.object({
  x: z.number().min(1).default(50),
  y: z.number().min(1).default(50),
  color: z.number().default(0xcccccc),
  alpha: z.number().min(0).max(1).default(0.5),
});

export type GridLineConfig = z.infer<typeof GridLineSchema>;

// ============================================================================
// Artboard Types
// ============================================================================

export interface ArtboardOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  alpha: number;
}

// Schema for artboard configuration
export const ArtboardSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().min(1).default(800),
  height: z.number().min(1).default(600),
  color: z.number().default(0x000000),
  alpha: z.number().min(0).max(1).default(1),
});

export type ArtboardConfig = z.infer<typeof ArtboardSchema>;

// ============================================================================
// Grid Store Schema
// ============================================================================

// Schema for grid configuration
export const GridStoreSchema = z.object({
  grid: GridLineSchema,
  gridMajor: GridLineSchema.optional(),
  artboard: ArtboardSchema.optional(),
});

export type GridStoreValue = z.infer<typeof GridStoreSchema>;

// ============================================================================
// Grid Manager Types
// ============================================================================

export interface GridManagerValue {
  gridSpec: GridStoreValue;
  dirty: boolean;
}


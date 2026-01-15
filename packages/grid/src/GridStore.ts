import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry4';

// Schema for grid configuration
const GridStoreSchema = z.object({
  rows: z.number().min(1).default(3),
  cols: z.number().min(1).default(3),
  gap: z.number().min(0).default(10),
  width: z.number().optional(),
  height: z.number().optional(),
  cellWidth: z.number().optional(),
  cellHeight: z.number().optional(),
});

export type GridStoreValue = z.infer<typeof GridStoreSchema>;

export class GridStore extends Forest<GridStoreValue> {
  constructor(initialValue?: Partial<GridStoreValue>) {
    super({
      value: {
        rows: initialValue?.rows ?? 3,
        cols: initialValue?.cols ?? 3,
        gap: initialValue?.gap ?? 10,
        width: initialValue?.width,
        height: initialValue?.height,
        cellWidth: initialValue?.cellWidth,
        cellHeight: initialValue?.cellHeight,
      },
    });
  }

  /**
   * Set the number of rows
   */
  setRows(rows: number) {
    if (rows < 1) return;
    this.mutate(draft => {
      draft.rows = rows;
    });
  }

  /**
   * Set the number of columns
   */
  setCols(cols: number) {
    if (cols < 1) return;
    this.mutate(draft => {
      draft.cols = cols;
    });
  }

  /**
   * Set the gap between cells
   */
  setGap(gap: number) {
    if (gap < 0) return;
    this.mutate(draft => {
      draft.gap = gap;
    });
  }

  /**
   * Set grid dimensions
   */
  setDimensions(width: number, height: number) {
    this.mutate(draft => {
      draft.width = width;
      draft.height = height;
    });
  }

  /**
   * Set cell dimensions
   */
  setCellDimensions(cellWidth: number, cellHeight: number) {
    this.mutate(draft => {
      draft.cellWidth = cellWidth;
      draft.cellHeight = cellHeight;
    });
  }

  /**
   * Update grid configuration
   */
  updateGrid(updates: Partial<GridStoreValue>) {
    this.mutate(draft => {
      if (updates.rows !== undefined && updates.rows >= 1) {
        draft.rows = updates.rows;
      }
      if (updates.cols !== undefined && updates.cols >= 1) {
        draft.cols = updates.cols;
      }
      if (updates.gap !== undefined && updates.gap >= 0) {
        draft.gap = updates.gap;
      }
      if (updates.width !== undefined) {
        draft.width = updates.width;
      }
      if (updates.height !== undefined) {
        draft.height = updates.height;
      }
      if (updates.cellWidth !== undefined) {
        draft.cellWidth = updates.cellWidth;
      }
      if (updates.cellHeight !== undefined) {
        draft.cellHeight = updates.cellHeight;
      }
    });
  }

  /**
   * Get total number of cells
   */
  getTotalCells(): number {
    return this.value.rows * this.value.cols;
  }

  /**
   * Get cell position for a given index (row-major order)
   */
  getCellPosition(index: number): { row: number; col: number } | null {
    const total = this.getTotalCells();
    if (index < 0 || index >= total) return null;

    return {
      row: Math.floor(index / this.value.cols),
      col: index % this.value.cols,
    };
  }

  /**
   * Get cell index from row and column
   */
  getCellIndex(row: number, col: number): number | null {
    if (row < 0 || row >= this.value.rows || col < 0 || col >= this.value.cols) {
      return null;
    }
    return row * this.value.cols + col;
  }

  /**
   * Get cell coordinates in pixels (if cellWidth and cellHeight are set)
   */
  getCellCoordinates(row: number, col: number): { x: number; y: number; width: number; height: number } | null {
    if (!this.value.cellWidth || !this.value.cellHeight) return null;
    if (row < 0 || row >= this.value.rows || col < 0 || col >= this.value.cols) {
      return null;
    }

    return {
      x: col * (this.value.cellWidth + this.value.gap),
      y: row * (this.value.cellHeight + this.value.gap),
      width: this.value.cellWidth,
      height: this.value.cellHeight,
    };
  }
}


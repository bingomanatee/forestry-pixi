import { describe, it, expect, beforeEach } from 'vitest';
import { GridStore } from './GridStore';

describe('GridStore', () => {
  let store: GridStore;

  beforeEach(() => {
    store = new GridStore();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.value.rows).toBe(3);
      expect(store.value.cols).toBe(3);
      expect(store.value.gap).toBe(10);
    });

    it('should initialize with custom values', () => {
      const customStore = new GridStore({ rows: 5, cols: 4, gap: 20 });
      expect(customStore.value.rows).toBe(5);
      expect(customStore.value.cols).toBe(4);
      expect(customStore.value.gap).toBe(20);
    });
  });

  describe('setRows', () => {
    it('should update rows', () => {
      store.setRows(5);
      expect(store.value.rows).toBe(5);
    });

    it('should not update rows if less than 1', () => {
      store.setRows(0);
      expect(store.value.rows).toBe(3);

      store.setRows(-1);
      expect(store.value.rows).toBe(3);
    });
  });

  describe('setCols', () => {
    it('should update cols', () => {
      store.setCols(6);
      expect(store.value.cols).toBe(6);
    });

    it('should not update cols if less than 1', () => {
      store.setCols(0);
      expect(store.value.cols).toBe(3);

      store.setCols(-1);
      expect(store.value.cols).toBe(3);
    });
  });

  describe('setGap', () => {
    it('should update gap', () => {
      store.setGap(15);
      expect(store.value.gap).toBe(15);
    });

    it('should not update gap if less than 0', () => {
      store.setGap(-1);
      expect(store.value.gap).toBe(10);
    });

    it('should allow gap of 0', () => {
      store.setGap(0);
      expect(store.value.gap).toBe(0);
    });
  });

  describe('setDimensions', () => {
    it('should set grid dimensions', () => {
      store.setDimensions(800, 600);
      expect(store.value.width).toBe(800);
      expect(store.value.height).toBe(600);
    });
  });

  describe('setCellDimensions', () => {
    it('should set cell dimensions', () => {
      store.setCellDimensions(100, 80);
      expect(store.value.cellWidth).toBe(100);
      expect(store.value.cellHeight).toBe(80);
    });
  });

  describe('updateGrid', () => {
    it('should update multiple properties', () => {
      store.updateGrid({ rows: 4, cols: 5, gap: 15 });
      expect(store.value.rows).toBe(4);
      expect(store.value.cols).toBe(5);
      expect(store.value.gap).toBe(15);
    });

    it('should not update invalid values', () => {
      store.updateGrid({ rows: 0, cols: -1, gap: -5 });
      expect(store.value.rows).toBe(3);
      expect(store.value.cols).toBe(3);
      expect(store.value.gap).toBe(10);
    });
  });

  describe('getTotalCells', () => {
    it('should return total number of cells', () => {
      expect(store.getTotalCells()).toBe(9); // 3x3

      store.setRows(4);
      store.setCols(5);
      expect(store.getTotalCells()).toBe(20); // 4x5
    });
  });

  describe('getCellPosition', () => {
    it('should return cell position for valid index', () => {
      const pos = store.getCellPosition(4); // 3x3 grid, index 4 = row 1, col 1
      expect(pos).toEqual({ row: 1, col: 1 });
    });

    it('should return null for invalid index', () => {
      expect(store.getCellPosition(-1)).toBeNull();
      expect(store.getCellPosition(9)).toBeNull(); // 3x3 grid has indices 0-8
    });

    it('should handle different grid sizes', () => {
      store.setRows(4);
      store.setCols(5);
      const pos = store.getCellPosition(7); // row 1, col 2
      expect(pos).toEqual({ row: 1, col: 2 });
    });
  });

  describe('getCellIndex', () => {
    it('should return cell index for valid row and col', () => {
      expect(store.getCellIndex(0, 0)).toBe(0);
      expect(store.getCellIndex(1, 1)).toBe(4); // 3x3 grid
      expect(store.getCellIndex(2, 2)).toBe(8);
    });

    it('should return null for invalid row or col', () => {
      expect(store.getCellIndex(-1, 0)).toBeNull();
      expect(store.getCellIndex(0, -1)).toBeNull();
      expect(store.getCellIndex(3, 0)).toBeNull(); // row 3 doesn't exist in 3x3 grid
      expect(store.getCellIndex(0, 3)).toBeNull(); // col 3 doesn't exist in 3x3 grid
    });
  });

  describe('getCellCoordinates', () => {
    it('should return null if cell dimensions not set', () => {
      const coords = store.getCellCoordinates(0, 0);
      expect(coords).toBeNull();
    });

    it('should return cell coordinates when dimensions are set', () => {
      store.setCellDimensions(100, 100);
      const coords = store.getCellCoordinates(0, 0);
      expect(coords).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    });

    it('should calculate coordinates with gap', () => {
      store.setCellDimensions(100, 100);
      store.setGap(10);
      
      const coords1 = store.getCellCoordinates(0, 1);
      expect(coords1).toEqual({ x: 110, y: 0, width: 100, height: 100 });

      const coords2 = store.getCellCoordinates(1, 0);
      expect(coords2).toEqual({ x: 0, y: 110, width: 100, height: 100 });

      const coords3 = store.getCellCoordinates(1, 1);
      expect(coords3).toEqual({ x: 110, y: 110, width: 100, height: 100 });
    });

    it('should return null for invalid row or col', () => {
      store.setCellDimensions(100, 100);
      expect(store.getCellCoordinates(-1, 0)).toBeNull();
      expect(store.getCellCoordinates(0, -1)).toBeNull();
      expect(store.getCellCoordinates(3, 0)).toBeNull();
      expect(store.getCellCoordinates(0, 3)).toBeNull();
    });
  });
});


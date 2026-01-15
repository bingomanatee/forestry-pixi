import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DragStore } from './DragStore';

describe('DragStore', () => {
  let store: DragStore;

  beforeEach(() => {
    store = new DragStore();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.value.isDragging).toBe(false);
      expect(store.value.draggedItemId).toBeNull();
      expect(store.value.startX).toBe(0);
      expect(store.value.startY).toBe(0);
      expect(store.value.currentX).toBe(0);
      expect(store.value.currentY).toBe(0);
      expect(store.value.deltaX).toBe(0);
      expect(store.value.deltaY).toBe(0);
    });
  });

  describe('setCallbacks', () => {
    it('should set callbacks', () => {
      const onDragStart = vi.fn();
      const onDrag = vi.fn();
      const onDragEnd = vi.fn();

      store.setCallbacks({ onDragStart, onDrag, onDragEnd });
      
      store.startDrag('item-1', 100, 100);
      expect(onDragStart).toHaveBeenCalledWith('item-1', 100, 100);
    });
  });

  describe('startDrag', () => {
    it('should start dragging', () => {
      store.startDrag('item-1', 100, 150);

      expect(store.value.isDragging).toBe(true);
      expect(store.value.draggedItemId).toBe('item-1');
      expect(store.value.startX).toBe(100);
      expect(store.value.startY).toBe(150);
      expect(store.value.currentX).toBe(100);
      expect(store.value.currentY).toBe(150);
      expect(store.value.deltaX).toBe(0);
      expect(store.value.deltaY).toBe(0);
    });

    it('should set initial item position', () => {
      store.startDrag('item-1', 100, 150, 50, 75);

      expect(store.value.initialItemX).toBe(50);
      expect(store.value.initialItemY).toBe(75);
    });

    it('should call onDragStart callback', () => {
      const onDragStart = vi.fn();
      store.setCallbacks({ onDragStart });

      store.startDrag('item-1', 100, 150);
      expect(onDragStart).toHaveBeenCalledWith('item-1', 100, 150);
    });
  });

  describe('updateDrag', () => {
    it('should update drag position', () => {
      store.startDrag('item-1', 100, 150);
      store.updateDrag(200, 250);

      expect(store.value.currentX).toBe(200);
      expect(store.value.currentY).toBe(250);
      expect(store.value.deltaX).toBe(100);
      expect(store.value.deltaY).toBe(100);
    });

    it('should call onDrag callback with correct values', () => {
      const onDrag = vi.fn();
      store.setCallbacks({ onDrag });

      store.startDrag('item-1', 100, 150, 50, 75);
      store.updateDrag(200, 250);

      expect(onDrag).toHaveBeenCalledWith('item-1', 150, 175, 100, 100);
    });

    it('should not update if not dragging', () => {
      store.updateDrag(200, 250);

      expect(store.value.currentX).toBe(0);
      expect(store.value.currentY).toBe(0);
    });
  });

  describe('endDrag', () => {
    it('should end dragging and reset state', () => {
      store.startDrag('item-1', 100, 150);
      store.updateDrag(200, 250);
      store.endDrag();

      expect(store.value.isDragging).toBe(false);
      expect(store.value.draggedItemId).toBeNull();
      expect(store.value.startX).toBe(0);
      expect(store.value.startY).toBe(0);
      expect(store.value.currentX).toBe(0);
      expect(store.value.currentY).toBe(0);
      expect(store.value.deltaX).toBe(0);
      expect(store.value.deltaY).toBe(0);
    });

    it('should call onDragEnd callback with final position', () => {
      const onDragEnd = vi.fn();
      store.setCallbacks({ onDragEnd });

      store.startDrag('item-1', 100, 150, 50, 75);
      store.updateDrag(200, 250);
      store.endDrag();

      expect(onDragEnd).toHaveBeenCalledWith('item-1', 150, 175);
    });

    it('should not call callback if not dragging', () => {
      const onDragEnd = vi.fn();
      store.setCallbacks({ onDragEnd });

      store.endDrag();
      expect(onDragEnd).not.toHaveBeenCalled();
    });
  });

  describe('cancelDrag', () => {
    it('should cancel dragging without calling onDragEnd', () => {
      const onDragEnd = vi.fn();
      store.setCallbacks({ onDragEnd });

      store.startDrag('item-1', 100, 150);
      store.updateDrag(200, 250);
      store.cancelDrag();

      expect(store.value.isDragging).toBe(false);
      expect(onDragEnd).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentItemPosition', () => {
    it('should return null if not dragging', () => {
      const pos = store.getCurrentItemPosition();
      expect(pos).toBeNull();
    });

    it('should return current item position', () => {
      store.startDrag('item-1', 100, 150, 50, 75);
      store.updateDrag(200, 250);

      const pos = store.getCurrentItemPosition();
      expect(pos).toEqual({ x: 150, y: 175 });
    });
  });

  describe('isItemDragging', () => {
    it('should return false if not dragging', () => {
      expect(store.isItemDragging('item-1')).toBe(false);
    });

    it('should return true if the item is being dragged', () => {
      store.startDrag('item-1', 100, 150);
      expect(store.isItemDragging('item-1')).toBe(true);
    });

    it('should return false if a different item is being dragged', () => {
      store.startDrag('item-1', 100, 150);
      expect(store.isItemDragging('item-2')).toBe(false);
    });
  });
});


import { immerable } from 'immer';

/**
 * Immerable Rectangle class compatible with Immer and Forestry state management.
 * 
 * This is a simplified version of PixiJS Rectangle that only includes the basic
 * properties needed for resize operations, making it compatible with Immer's
 * draft system.
 */
export class ImmerableRectangle {
  [immerable] = true;

  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Create a copy of this rectangle
   */
  clone(): ImmerableRectangle {
    return new ImmerableRectangle(this.x, this.y, this.width, this.height);
  }

  /**
   * Create from PixiJS Rectangle
   */
  static fromPixiRectangle(rect: { x: number; y: number; width: number; height: number }): ImmerableRectangle {
    return new ImmerableRectangle(rect.x, rect.y, rect.width, rect.height);
  }

  /**
   * Convert to plain object (for PixiJS Rectangle compatibility)
   */
  toPixiRectangle(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}


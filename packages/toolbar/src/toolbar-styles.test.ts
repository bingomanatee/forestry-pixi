import { describe, it, expect } from 'vitest';
import { fromJSON } from '@forestry-pixi/style-tree';
import defaultStyles from './styles/toolbar.default.json';

describe('Toolbar Default Styles', () => {
  const styleTree = fromJSON(defaultStyles);

  describe('Button base state', () => {
    it('should have icon size of { x: 32, y: 32 }', () => {
      // The digest flattens nested objects, so we query individual properties
      const sizeX = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'size', 'x'], states: [] });
      const sizeY = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'size', 'y'], states: [] });
      expect(sizeX).toBe(32);
      expect(sizeY).toBe(32);
    });

    it('should have padding x and y of 4', () => {
      // The digest flattens nested objects, so padding.x and padding.y are separate keys
      const paddingX = styleTree.match({ nouns: ['toolbar', 'button', 'padding', 'x'], states: [] });
      const paddingY = styleTree.match({ nouns: ['toolbar', 'button', 'padding', 'y'], states: [] });
      expect(paddingX).toBe(4);
      expect(paddingY).toBe(4);
    });

    it('should have stroke alpha of 1', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'alpha'], states: [] });
      expect(alpha).toBe(1);
    });

    it('should have icon alpha of 1', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'alpha'], states: [] });
      expect(alpha).toBe(1);
    });

    it('should not have fill alpha in base state', () => {
      const value = styleTree.match({ nouns: ['toolbar', 'button', 'fill', 'alpha'], states: [] });
      expect(value).toBeUndefined();
    });
  });

  describe('Button hover state', () => {
    it('should have lighter stroke color than base', () => {
      const baseR = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'color', 'r'], states: [] });
      const hoverR = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'color', 'r'], states: ['hover'] });

      expect(hoverR).toBeGreaterThan(baseR);
    });

    it('should have stroke alpha of 1', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'alpha'], states: ['hover'] });
      expect(alpha).toBe(1);
    });

    it('should have icon alpha of 1', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'alpha'], states: ['hover'] });
      expect(alpha).toBe(1);
    });
  });

  describe('Button disabled state', () => {
    it('should have reduced icon alpha (0.5)', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'alpha'], states: ['disabled'] });
      expect(alpha).toBe(0.5);
    });

    it('should have reduced stroke alpha (0.5)', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'alpha'], states: ['disabled'] });
      expect(alpha).toBe(0.5);
    });

    it('should have lighter stroke color than base (very light gray)', () => {
      const baseR = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'color', 'r'], states: [] });
      const disabledR = styleTree.match({ nouns: ['toolbar', 'button', 'stroke', 'color', 'r'], states: ['disabled'] });

      expect(disabledR).toBeGreaterThan(baseR);
      expect(disabledR).toBeGreaterThan(0.8); // Should be very light gray
    });

    it('should have fill with low alpha', () => {
      const alpha = styleTree.match({ nouns: ['toolbar', 'button', 'fill', 'alpha'], states: ['disabled'] });
      expect(alpha).toBeDefined();
      expect(alpha).toBe(0.3);
    });
  });

  describe('Label base state', () => {
    it('should have fontSize of 12', () => {
      const value = styleTree.match({ nouns: ['toolbar', 'label', 'fontSize'], states: [] });
      expect(value).toBe(12);
    });

    it('should have padding of 4', () => {
      const value = styleTree.match({ nouns: ['toolbar', 'label', 'padding'], states: [] });
      expect(value).toBe(4);
    });

    it('should have alpha of 0.5', () => {
      const value = styleTree.match({ nouns: ['toolbar', 'label', 'alpha'], states: [] });
      expect(value).toBe(0.5);
    });
  });

  describe('Label hover state', () => {
    it('should have alpha of 1 (fully visible)', () => {
      const value = styleTree.match({ nouns: ['toolbar', 'label', 'alpha'], states: ['hover'] });
      expect(value).toBe(1);
    });
  });

  describe('State fallback behavior', () => {
    it('should have icon size when querying hover', () => {
      // icon has $hover defined with size
      const sizeX = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'size', 'x'], states: ['hover'] });
      const sizeY = styleTree.match({ nouns: ['toolbar', 'button', 'icon', 'size', 'y'], states: ['hover'] });
      expect(sizeX).toBe(32);
      expect(sizeY).toBe(32);
    });

    it('should fall back to base state for padding when querying disabled', () => {
      // padding only has $* defined, so disabled should fall back to base
      const paddingX = styleTree.match({ nouns: ['toolbar', 'button', 'padding', 'x'], states: ['disabled'] });
      expect(paddingX).toBe(4);
    });
  });
});


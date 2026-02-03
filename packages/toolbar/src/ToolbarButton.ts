import { Container, Graphics, Sprite, Text, BitmapText, Application } from 'pixi.js';
import type { StyleTree } from '@forestry-pixi/style-tree';
import type { ToolbarButtonConfig, RgbColor } from './types';
import { ToolbarButtonStore } from './ToolbarButtonStore';

/**
 * Converts RGB color object (0..1) to hex color number
 */
function rgbToColor(rgb: RgbColor): number {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return (r << 16) | (g << 8) | b;
}

/**
 * ToolbarButton - A button with an icon sprite, configurable padding, border, and hover effects
 */
export class ToolbarButton {
  private container: Container;
  private background: Graphics;
  private border: Graphics;
  private sprite: Sprite;
  private labelText?: Text | BitmapText;
  private store: ToolbarButtonStore;

  constructor(config: ToolbarButtonConfig, app: Application, styleTree: StyleTree, bitmapFontName?: string) {
    // Create container
    this.container = new Container({
      label: `ToolbarButton-${config.id}`,
      eventMode: config.isDisabled ? 'none' : 'static',
      cursor: config.isDisabled ? 'default' : 'pointer',
    });

    // Create background (for fill)
    this.background = new Graphics({ label: 'button-background' });
    this.container.addChild(this.background);

    // Create border (for stroke)
    this.border = new Graphics({ label: 'button-border' });
    this.container.addChild(this.border);

    // Add sprite
    this.sprite = config.sprite;
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    // Create label if provided - get initial styles from StyleTree
    if (config.label) {
      const fontSize = styleTree.match({ nouns: ['toolbar', 'label', 'fontSize'], states: [] }) ?? 12;
      const labelColor = styleTree.match({ nouns: ['toolbar', 'label', 'color'], states: [] }) ?? { r: 0, g: 0, b: 0 };
      const labelAlpha = styleTree.match({ nouns: ['toolbar', 'label', 'alpha'], states: [] }) ?? 0.5;

      if (bitmapFontName) {
        // Use BitmapText when a bitmap font is provided
        this.labelText = new BitmapText({
          text: config.label,
          style: {
            fontFamily: bitmapFontName,
            fontSize,
          },
        });
        this.labelText.anchor.set(0.5, 0);
        this.labelText.tint = rgbToColor(labelColor);
        this.labelText.alpha = labelAlpha;
      } else {
        // Use regular Text
        this.labelText = new Text({
          text: config.label,
          style: {
            fontSize,
            fill: rgbToColor(labelColor),
            align: 'center',
          },
        });
        this.labelText.anchor.set(0.5, 0);
        this.labelText.alpha = labelAlpha;
      }
      this.container.addChild(this.labelText);
    }

    // Create store with all PixiJS objects and StyleTree
    this.store = new ToolbarButtonStore(
      config,
      app,
      styleTree,
      this.container,
      this.background,
      this.border,
      this.sprite,
      this.labelText
    );

    // Set up interactivity
    this.setupInteractivity();

    // Initial render via ticker
    this.store.kickoff();
  }

  private setupInteractivity(): void {
    this.container.on('pointerenter', () => {
      if (!this.store.value.isDisabled) {
        this.store.setHovered(true);
      }
    });

    this.container.on('pointerleave', () => {
      if (!this.store.value.isDisabled) {
        this.store.setHovered(false);
      }
    });

    this.container.on('pointertap', () => {
      if (!this.store.value.isDisabled && this.store.value.onClick) {
        this.store.value.onClick();
      }
    });
  }



  /**
   * Set the disabled state of the button
   */
  setDisabled(isDisabled: boolean): void {
    this.store.setDisabled(isDisabled);
  }

  /**
   * Get the disabled state of the button
   */
  isButtonDisabled(): boolean {
    return this.store.value.isDisabled;
  }

  /**
   * Get the container for this button
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get the width of this button
   */
  getWidth(): number {
    const iconSize = this.store.getIconSize();
    const padding = this.store.getPadding();
    const textureWidth = this.sprite.texture.width;
    const textureHeight = this.sprite.texture.height;
    const scale = iconSize / Math.max(textureWidth, textureHeight);
    const spriteWidth = textureWidth * scale;
    return spriteWidth + padding.x * 2;
  }

  /**
   * Get the height of this button (including label if present)
   */
  getHeight(): number {
    const iconSize = this.store.getIconSize();
    const padding = this.store.getPadding();
    const textureWidth = this.sprite.texture.width;
    const textureHeight = this.sprite.texture.height;
    const scale = iconSize / Math.max(textureWidth, textureHeight);
    const spriteHeight = textureHeight * scale;
    let height = spriteHeight + padding.y * 2;

    // Add label height if present
    if (this.labelText) {
      const labelPadding = this.store.getLabelPadding();
      const labelFontSize = this.store.getLabelFontSize();
      height += labelPadding + labelFontSize;
    }

    return height;
  }

  /**
   * Update button configuration (only supports id, label, onClick, isDisabled)
   */
  updateConfig(config: Partial<Pick<ToolbarButtonConfig, 'id' | 'label' | 'onClick' | 'isDisabled'>>): void {
    this.store.mutate((draft) => {
      if (config.id !== undefined) draft.id = config.id;
      if (config.label !== undefined) draft.label = config.label;
      if (config.onClick !== undefined) draft.onClick = config.onClick;
      if (config.isDisabled !== undefined) draft.isDisabled = config.isDisabled;
      draft.isDirty = true;
    });
    this.store.queueResolve();
  }

  /**
   * Destroy the button and clean up resources
   */
  destroy(): void {
    this.store.cleanup();
    this.container.removeAllListeners();
    this.container.destroy({ children: true });
  }
}


import { Container, Graphics, Sprite, Text, Application } from 'pixi.js';
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
 * Converts RGB color object (0..1) to hex color number with alpha
 */
function rgbToColorWithAlpha(rgb: RgbColor, alpha: number): number {
  return rgbToColor(rgb);
}

/**
 * ToolbarButton - A button with an icon sprite, configurable padding, border, and hover effects
 */
export class ToolbarButton {
  private container: Container;
  private background: Graphics;
  private border: Graphics;
  private sprite: Sprite;
  private labelText?: Text;
  private store: ToolbarButtonStore;

  constructor(config: ToolbarButtonConfig, app: Application) {
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

    // Create label if provided
    if (config.label) {
      this.labelText = new Text({
        text: config.label,
        style: {
          fontSize: config.labelConfig!.fontSize,
          fill: rgbToColor(config.labelConfig!.base.color),
          align: 'center',
        },
      });
      this.labelText.anchor.set(0.5, 0);
      this.labelText.alpha = config.labelConfig!.base.alpha;
      this.container.addChild(this.labelText);
    }

    // Create store with all PixiJS objects
    this.store = new ToolbarButtonStore(
      config,
      app,
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
    const { iconSize, padding } = this.store.value;
    const textureWidth = this.sprite.texture.width;
    const textureHeight = this.sprite.texture.height;
    const scale = iconSize! / Math.max(textureWidth, textureHeight);
    const spriteWidth = textureWidth * scale;
    return spriteWidth + padding!.x * 2;
  }

  /**
   * Get the height of this button (including label if present)
   */
  getHeight(): number {
    const { iconSize, padding, labelConfig } = this.store.value;
    const textureWidth = this.sprite.texture.width;
    const textureHeight = this.sprite.texture.height;
    const scale = iconSize! / Math.max(textureWidth, textureHeight);
    const spriteHeight = textureHeight * scale;
    let height = spriteHeight + padding!.y * 2;

    // Add label height if present
    if (this.labelText && labelConfig) {
      height += labelConfig.padding + labelConfig.fontSize;
    }

    return height;
  }

  /**
   * Update button configuration
   */
  updateConfig(config: Partial<ToolbarButtonConfig>): void {
    this.store.mutate((draft) => {
      Object.assign(draft, config);
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


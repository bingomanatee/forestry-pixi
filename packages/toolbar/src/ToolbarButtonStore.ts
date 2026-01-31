import { TickerForest } from '@forestry-pixi/ticker-forest';
import type { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import type { ToolbarButtonConfig, RgbColor } from './types';

interface ToolbarButtonState extends ToolbarButtonConfig {
  isHovered: boolean;
  isDirty: boolean;
}

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
 * ToolbarButtonStore - Manages button state and rendering using TickerForest pattern
 */
export class ToolbarButtonStore extends TickerForest<ToolbarButtonState> {
  private container: Container;
  private background: Graphics;
  private border: Graphics;
  private sprite: Sprite;
  private labelText?: Text;

  constructor(
    config: ToolbarButtonConfig,
    app: Application,
    container: Container,
    background: Graphics,
    border: Graphics,
    sprite: Sprite,
    labelText?: Text
  ) {
    super(
      {
        value: {
          ...config,
          isHovered: false,
          isDirty: true,
        },
      },
      app
    );

    this.container = container;
    this.background = background;
    this.border = border;
    this.sprite = sprite;
    this.labelText = labelText;
  }

  /**
   * Set hover state
   */
  setHovered(isHovered: boolean): void {
    if (this.value.isHovered !== isHovered) {
      this.mutate((draft) => {
        draft.isHovered = isHovered;
        draft.isDirty = true;
      });
      this.queueResolve();
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(isDisabled: boolean): void {
    if (this.value.isDisabled !== isDisabled) {
      this.mutate((draft) => {
        draft.isDisabled = isDisabled;
        draft.isDirty = true;
      });
      this.queueResolve();
    }
  }

  /**
   * TickerForest abstract method - check if dirty
   */
  protected isDirty(): boolean {
    return this.value.isDirty;
  }

  /**
   * TickerForest abstract method - clear dirty flag
   */
  protected clearDirty(): void {
    this.mutate((draft) => {
      draft.isDirty = false;
    });
  }

  /**
   * TickerForest abstract method - resolve (renders the button)
   */
  protected resolve(): void {
    const { iconSize, padding, appearance, isDisabled, isHovered, labelConfig } = this.value;

    // Scale sprite to fit icon size (maintain aspect ratio, fit within iconSize)
    const textureWidth = this.sprite.texture.width;
    const textureHeight = this.sprite.texture.height;
    const scale = iconSize! / Math.max(textureWidth, textureHeight);
    this.sprite.scale.set(scale);

    // Calculate actual sprite dimensions after scaling
    const spriteWidth = textureWidth * scale;
    const spriteHeight = textureHeight * scale;

    // Calculate button size based on actual sprite size
    const buttonWidth = spriteWidth + padding!.x * 2;
    const buttonHeight = spriteHeight + padding!.y * 2;

    // Clear graphics
    this.background.clear();
    this.border.clear();

    // Get current state (disabled, hover, or base)
    const state = isDisabled
      ? appearance!.disabled
      : (isHovered ? appearance!.hover : appearance!.base);

    // Draw background fill if provided
    if (state.fill) {
      const bgColor = rgbToColor(state.fill.color);
      const bgAlpha = state.fill.alpha;
      this.background.rect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
      this.background.fill({ color: bgColor, alpha: bgAlpha });
    }

    // Draw border stroke (separate graphic with its own alpha)
    this.border.rect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
    this.border.stroke({
      color: rgbToColor(state.stroke.color),
      width: state.stroke.width,
      alpha: state.stroke.alpha
    });

    // Apply icon alpha and tint from state
    this.sprite.alpha = state.iconAlpha;
    if (state.iconTint) {
      this.sprite.tint = rgbToColor(state.iconTint);
    } else {
      this.sprite.tint = 0xffffff; // Reset to white (no tint)
    }

    // Update label if it exists
    if (this.labelText && labelConfig) {
      // Position label
      const labelY = buttonHeight / 2 + labelConfig.padding;
      this.labelText.position.set(0, labelY);

      // Use base state for disabled, otherwise use hover/base
      const labelState = isDisabled
        ? labelConfig.base
        : (isHovered ? labelConfig.hover : labelConfig.base);

      this.labelText.style.fill = rgbToColor(labelState.color);
      this.labelText.alpha = isDisabled ? labelState.alpha * 0.5 : labelState.alpha;
    }

    // Update container interactivity based on disabled state
    this.container.eventMode = isDisabled ? 'none' : 'static';
    this.container.cursor = isDisabled ? 'default' : 'pointer';
  }
}


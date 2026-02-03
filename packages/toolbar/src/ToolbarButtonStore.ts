import { TickerForest } from '@forestry-pixi/ticker-forest';
import type { StyleTree } from '@forestry-pixi/style-tree';
import type { Application, Container, Graphics, Sprite, Text, BitmapText } from 'pixi.js';
import type { ToolbarButtonConfig, RgbColor } from './types';

interface ToolbarButtonState {
  id: string;
  sprite: Sprite;
  label?: string;
  onClick?: () => void;
  isDisabled: boolean;
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
  private labelText?: Text | BitmapText;
  private styleTree: StyleTree;

  constructor(
    config: ToolbarButtonConfig,
    app: Application,
    styleTree: StyleTree,
    container: Container,
    background: Graphics,
    border: Graphics,
    sprite: Sprite,
    labelText?: Text | BitmapText
  ) {
    super(
      {
        value: {
          id: config.id,
          sprite: config.sprite,
          label: config.label,
          onClick: config.onClick,
          isDisabled: config.isDisabled ?? false,
          isHovered: false,
          isDirty: true,
        },
      },
      app
    );

    this.styleTree = styleTree;
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
   * Get the current states array based on button state
   */
  private getCurrentStates(): string[] {
    const { isDisabled, isHovered } = this.value;
    return isDisabled ? ['disabled'] : (isHovered ? ['hover'] : []);
  }

  /**
   * Get a style value from the StyleTree for the current button state
   */
  private getButtonStyle(...propertyPath: string[]): any {
    const states = this.getCurrentStates();
    return this.styleTree.match({
      nouns: ['toolbar', 'button', ...propertyPath],
      states
    });
  }

  /**
   * Get a label style value from the StyleTree for the current state
   */
  private getLabelStyle(property: string): any {
    const { isDisabled, isHovered } = this.value;

    // Determine which states to query (empty array for base state)
    const states: string[] = isDisabled
      ? []  // Use base state for disabled labels
      : (isHovered ? ['hover'] : []);

    const match = this.styleTree.match({
      nouns: ['toolbar', 'label', property],
      states
    });

    return match?.value;
  }

  /**
   * TickerForest abstract method - resolve (renders the button)
   */
  protected resolve(): void {
    const { isDisabled, isHovered } = this.value;

    // Get button styles from StyleTree (digest flattens nested objects)
    const iconSize = this.getButtonStyle('iconSize') ?? 32;
    const paddingX = this.getButtonStyle('padding', 'x') ?? 4;
    const paddingY = this.getButtonStyle('padding', 'y') ?? 4;
    const padding = { x: paddingX, y: paddingY };

    // Build stroke object from flattened properties
    const stroke = {
      color: {
        r: this.getButtonStyle('stroke', 'color', 'r') ?? 0.5,
        g: this.getButtonStyle('stroke', 'color', 'g') ?? 0.5,
        b: this.getButtonStyle('stroke', 'color', 'b') ?? 0.5,
      },
      alpha: this.getButtonStyle('stroke', 'alpha') ?? 1,
      width: this.getButtonStyle('stroke', 'width') ?? 1,
    };

    // Build fill object from flattened properties (only if fill.alpha exists)
    const fillAlpha = this.getButtonStyle('fill', 'alpha');
    const fill = fillAlpha !== undefined ? {
      color: {
        r: this.getButtonStyle('fill', 'color', 'r') ?? 0.9,
        g: this.getButtonStyle('fill', 'color', 'g') ?? 0.9,
        b: this.getButtonStyle('fill', 'color', 'b') ?? 0.9,
      },
      alpha: fillAlpha,
    } : undefined;

    const iconAlpha = this.getButtonStyle('iconAlpha') ?? 1;
    const iconTint = this.getButtonStyle('iconTint');

    // Scale sprite to fit icon size (maintain aspect ratio, fit within iconSize)
    const textureWidth = this.sprite.texture.width;
    const textureHeight = this.sprite.texture.height;
    const scale = iconSize / Math.max(textureWidth, textureHeight);
    this.sprite.scale.set(scale);

    // Calculate actual sprite dimensions after scaling
    const spriteWidth = textureWidth * scale;
    const spriteHeight = textureHeight * scale;

    // Calculate button size based on actual sprite size
    const buttonWidth = spriteWidth + padding.x * 2;
    const buttonHeight = spriteHeight + padding.y * 2;

    // Clear graphics
    this.background.clear();
    this.border.clear();

    // Draw background fill if provided
    if (fill) {
      const bgColor = rgbToColor(fill.color);
      const bgAlpha = fill.alpha;
      this.background.rect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
      this.background.fill({ color: bgColor, alpha: bgAlpha });
    }

    // Draw border stroke
    this.border.rect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
    this.border.stroke({
      color: rgbToColor(stroke.color),
      width: stroke.width,
      alpha: stroke.alpha
    });

    // Apply icon alpha and tint
    this.sprite.alpha = iconAlpha;
    if (iconTint) {
      this.sprite.tint = rgbToColor(iconTint);
    } else {
      this.sprite.tint = 0xffffff; // Reset to white (no tint)
    }

    // Update label if it exists
    if (this.labelText) {
      const labelPadding = this.getLabelStyle('padding') ?? 4;
      const labelColor = this.getLabelStyle('color') ?? { r: 0, g: 0, b: 0 };
      const labelAlpha = this.getLabelStyle('alpha') ?? 0.5;

      // Position label
      const labelY = buttonHeight / 2 + labelPadding;
      this.labelText.position.set(0, labelY);

      // BitmapText uses tint, Text uses style.fill
      if ('tint' in this.labelText && !('style' in this.labelText && 'fill' in (this.labelText.style as any))) {
        // BitmapText
        this.labelText.tint = rgbToColor(labelColor);
      } else {
        // Regular Text
        (this.labelText as Text).style.fill = rgbToColor(labelColor);
      }
      this.labelText.alpha = isDisabled ? labelAlpha * 0.5 : labelAlpha;
    }

    // Update container interactivity based on disabled state
    this.container.eventMode = isDisabled ? 'none' : 'static';
    this.container.cursor = isDisabled ? 'default' : 'pointer';
  }

  /**
   * Get the current icon size from StyleTree
   */
  getIconSize(): number {
    return this.getButtonStyle('iconSize') ?? 32;
  }

  /**
   * Get the current padding from StyleTree
   */
  getPadding(): { x: number; y: number } {
    return this.getButtonStyle('padding') ?? { x: 4, y: 4 };
  }

  /**
   * Get the current label padding from StyleTree
   */
  getLabelPadding(): number {
    return this.getLabelStyle('padding') ?? 4;
  }

  /**
   * Get the current label font size from StyleTree
   */
  getLabelFontSize(): number {
    return this.getLabelStyle('fontSize') ?? 12;
  }
}


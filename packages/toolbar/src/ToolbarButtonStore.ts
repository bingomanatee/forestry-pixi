import { CellStore } from '@forestry-pixi/list';
import type { StyleTree } from '@forestry-pixi/style-tree';
import { Application, Graphics, Sprite, Text, BitmapText } from 'pixi.js';
import type { ToolbarButtonConfig, RgbColor, ButtonMode } from './types';
import type { ToolbarStore } from './ToolbarStore';

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
 * ToolbarButtonStore - Manages button state and rendering.
 * Extends CellStore for integration with ListStore-based Toolbar.
 */
export class ToolbarButtonStore extends CellStore {
  #border: Graphics;
  #sprite?: Sprite;
  #labelText?: Text | BitmapText;
  #styleTree: StyleTree;
  #buttonConfig: ToolbarButtonConfig;
  #mode: ButtonMode;
  #isHovered: boolean = false;
  #isDisabled: boolean;

  constructor(
    config: ToolbarButtonConfig,
    app: Application,
    toolbarStore: ToolbarStore,
    styleTree: StyleTree,
    bitmapFontName?: string
  ) {
    // Determine mode: explicit mode, or infer from sprite/label
    let mode: ButtonMode = config.mode ?? 'icon';
    if (!config.mode && !config.sprite && config.label) {
      mode = 'text';
    }

    // Initialize CellStore with button config
    super(
      {
        id: config.id,
        variant: config.variant,
      },
      app,
      toolbarStore
    );

    this.#styleTree = styleTree;
    this.#buttonConfig = config;
    this.#mode = mode;
    this.#isDisabled = config.isDisabled ?? false;

    // Create border graphics (background is handled by BoxStore)
    this.#border = new Graphics({ label: 'button-border' });
    this.contentContainer.addChild(this.#border);

    // Add sprite if provided
    if (config.sprite) {
      this.#sprite = config.sprite;
      this.#sprite.anchor.set(0.5);
      this.contentContainer.addChild(this.#sprite);
    }

    // Create label if provided
    if (config.label) {
      this.#labelText = this.#createLabel(config.label, bitmapFontName);
      this.contentContainer.addChild(this.#labelText);
    }

    // Set up interactivity
    this.#setupInteractivity();
  }

  #createLabel(text: string, bitmapFontName?: string): Text | BitmapText {
    // Use different style paths based on mode
    let styleNouns: string[];
    let defaultFontSize: number;
    let defaultLabelColor: RgbColor;
    let defaultLabelAlpha: number;

    if (this.#mode === 'text') {
      styleNouns = ['toolbar', 'textButton', 'label'];
      defaultFontSize = 13;
      defaultLabelColor = { r: 1, g: 1, b: 1 };
      defaultLabelAlpha = 1;
    } else if (this.#mode === 'inline') {
      styleNouns = ['toolbar', 'inlineButton', 'label'];
      defaultFontSize = 13;
      defaultLabelColor = { r: 1, g: 1, b: 1 };
      defaultLabelAlpha = 1;
    } else {
      styleNouns = ['toolbar', 'label'];
      defaultFontSize = 12;
      defaultLabelColor = { r: 0, g: 0, b: 0 };
      defaultLabelAlpha = 0.5;
    }

    const fontSize = this.#styleTree.match({ nouns: [...styleNouns, 'fontSize'], states: [] })
      ?? defaultFontSize;
    const labelColor = this.#styleTree.match({ nouns: [...styleNouns, 'color'], states: [] })
      ?? defaultLabelColor;
    const labelAlpha = this.#styleTree.match({ nouns: [...styleNouns, 'alpha'], states: [] })
      ?? defaultLabelAlpha;

    const centerLabel = this.#mode === 'text' || this.#mode === 'inline';

    if (bitmapFontName) {
      const bitmapText = new BitmapText({
        text,
        style: { fontFamily: bitmapFontName, fontSize },
      });
      bitmapText.anchor.set(0.5, centerLabel ? 0.5 : 0);
      bitmapText.tint = rgbToColor(labelColor);
      bitmapText.alpha = labelAlpha;
      return bitmapText;
    } else {
      const textObj = new Text({
        text,
        style: { fontSize, fill: rgbToColor(labelColor), align: 'center', fontFamily: 'Arial' },
      });
      textObj.anchor.set(0.5, centerLabel ? 0.5 : 0);
      textObj.alpha = labelAlpha;
      return textObj;
    }
  }

  #setupInteractivity(): void {
    this.container.eventMode = this.#isDisabled ? 'none' : 'static';
    this.container.cursor = this.#isDisabled ? 'default' : 'pointer';

    this.container.on('pointerenter', () => {
      if (!this.#isDisabled) {
        this.setHovered(true);
      }
    });

    this.container.on('pointerleave', () => {
      if (!this.#isDisabled) {
        this.setHovered(false);
      }
    });

    this.container.on('pointertap', () => {
      if (!this.#isDisabled && this.#buttonConfig.onClick) {
        this.#buttonConfig.onClick();
      }
    });
  }

  /**
   * Set hover state
   */
  setHovered(isHovered: boolean): void {
    if (this.#isHovered !== isHovered) {
      this.#isHovered = isHovered;
      this.markDirty();
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(isDisabled: boolean): void {
    if (this.#isDisabled !== isDisabled) {
      this.#isDisabled = isDisabled;
      this.container.eventMode = isDisabled ? 'none' : 'static';
      this.container.cursor = isDisabled ? 'default' : 'pointer';
      this.markDirty();
    }
  }

  /**
   * Get the current states array based on button state
   */
  #getCurrentStates(): string[] {
    return this.#isDisabled ? ['disabled'] : (this.#isHovered ? ['hover'] : []);
  }

  /**
   * Get a style value from the StyleTree for the current button state
   */
  #getButtonStyle(...propertyPath: string[]): any {
    const states = this.#getCurrentStates();
    return this.#styleTree.match({
      nouns: ['toolbar', 'button', ...propertyPath],
      states
    });
  }

  /**
   * Get a label style value from the StyleTree for the current state
   */
  #getLabelStyle(property: string): any {
    const states: string[] = this.#isDisabled
      ? []  // Use base state for disabled labels
      : (this.#isHovered ? ['hover'] : []);

    const match = this.#styleTree.match({
      nouns: ['toolbar', 'label', property],
      states
    });

    return match?.value;
  }

  /**
   * Get a style value for inline buttons from the StyleTree
   */
  #getInlineButtonStyle(...propertyPath: string[]): any {
    const states = this.#getCurrentStates();
    const variant = this.#buttonConfig.variant;

    // If variant is specified, try variant-specific style first
    if (variant) {
      const variantMatch = this.#styleTree.match({
        nouns: ['toolbar', 'inlineButton', variant, ...propertyPath],
        states
      });
      if (variantMatch?.value !== undefined) {
        return variantMatch.value;
      }
    }

    // Fall back to default inline button style
    const match = this.#styleTree.match({
      nouns: ['toolbar', 'inlineButton', ...propertyPath],
      states
    });
    return match?.value;
  }

  /**
   * Get a style value from the StyleTree for text-only buttons
   */
  #getTextButtonStyle(...propertyPath: string[]): any {
    const states = this.#getCurrentStates();
    return this.#styleTree.match({
      nouns: ['toolbar', 'textButton', ...propertyPath],
      states
    });
  }

  /**
   * Override resolve to render button content
   */
  protected resolve(): void {
    // Call parent resolve for background rendering
    super.resolve();

    switch (this.#mode) {
      case 'text':
        this.#resolveTextOnly();
        break;
      case 'inline':
        this.#resolveInline();
        break;
      case 'icon':
      default:
        this.#resolveWithIcon();
        break;
    }
  }

  /**
   * Render text-only button (no icon)
   * Text button draws its own background/border and centers text within cell rect
   */
  #resolveTextOnly(): void {
    if (!this.#labelText) return;

    // Default values
    const defaultColor = { r: 0.5, g: 0.5, b: 0.5 };

    // Get text button styles from StyleTree
    const borderRadius = this.#getTextButtonStyle('borderRadius') ?? 4;

    // Get stroke styles
    const strokeStyle = this.#getTextButtonStyle('stroke') ?? { color: defaultColor, alpha: 0, width: 0 };
    const stroke = strokeStyle.width > 0 ? strokeStyle : undefined;

    // Get fill styles
    const fill = this.#getTextButtonStyle('fill') ?? { color: { r: 0.33, g: 0.67, b: 0.6 }, alpha: 1 };

    // Get label styles
    const labelColor = this.#getTextButtonStyle('label', 'color') ?? { r: 1, g: 1, b: 1 };
    const labelAlpha = this.#getTextButtonStyle('label', 'alpha') ?? 1;

    // Use the cell's rect dimensions (set by list layout)
    const cellRect = this.rect;
    const buttonWidth = cellRect.width;
    const buttonHeight = cellRect.height;

    // Clear and redraw border graphics
    this.#border.clear();

    // Draw filled background
    if (fill && fill.alpha > 0) {
      this.#border.roundRect(0, 0, buttonWidth, buttonHeight, borderRadius);
      this.#border.fill({
        color: rgbToColor(fill.color),
        alpha: this.#isDisabled ? fill.alpha * 0.5 : fill.alpha
      });
    }

    // Draw border stroke if provided
    if (stroke && stroke.width > 0) {
      this.#border.roundRect(0, 0, buttonWidth, buttonHeight, borderRadius);
      this.#border.stroke({
        color: rgbToColor(stroke.color),
        width: stroke.width,
        alpha: stroke.alpha
      });
    }

    // Position label centered in button
    this.#labelText.position.set(buttonWidth / 2, buttonHeight / 2);
    this.#labelText.anchor.set(0.5, 0.5);

    // Apply label color and alpha
    if ('tint' in this.#labelText && !('style' in this.#labelText && 'fill' in (this.#labelText.style as any))) {
      // BitmapText
      this.#labelText.tint = rgbToColor(labelColor);
    } else {
      // Regular Text
      (this.#labelText as Text).style.fill = rgbToColor(labelColor);
    }
    this.#labelText.alpha = this.#isDisabled ? labelAlpha * 0.5 : labelAlpha;
  }

  /**
   * Render inline button (text with optional leading icon, side-by-side)
   */
  #resolveInline(): void {
    if (!this.#labelText) return;

    // Default values
    const defaultColor = { r: 0.5, g: 0.5, b: 0.5 };
    const defaultPadding = { x: 12, y: 6 };
    const defaultIconSize = { x: 16, y: 16 };

    // Get inline button styles from StyleTree
    const padding = this.#getInlineButtonStyle('padding') ?? defaultPadding;
    const borderRadius = this.#getInlineButtonStyle('borderRadius') ?? 4;
    const iconGap = this.#getInlineButtonStyle('iconGap') ?? 8;

    // Get stroke styles
    const strokeStyle = this.#getInlineButtonStyle('stroke') ?? { color: defaultColor, alpha: 0, width: 0 };
    const stroke = strokeStyle.width > 0 ? strokeStyle : undefined;

    // Get fill styles
    const fill = this.#getInlineButtonStyle('fill') ?? { color: { r: 0.33, g: 0.67, b: 0.6 }, alpha: 1 };

    // Get label styles
    const labelColor = this.#getInlineButtonStyle('label', 'color') ?? { r: 1, g: 1, b: 1 };
    const labelAlpha = this.#getInlineButtonStyle('label', 'alpha') ?? 1;

    // Get icon styles
    const iconSize = this.#getInlineButtonStyle('icon', 'size') ?? defaultIconSize;
    const iconAlpha = this.#getInlineButtonStyle('icon', 'alpha') ?? 1;

    // Calculate dimensions
    const textWidth = this.#labelText.width;
    const textHeight = this.#labelText.height;

    // Calculate content width (icon + gap + text, or just text if no sprite)
    const hasIcon = !!this.#sprite;
    const contentWidth = hasIcon
      ? iconSize.x + iconGap + textWidth
      : textWidth;
    const contentHeight = Math.max(hasIcon ? iconSize.y : 0, textHeight);

    const buttonWidth = contentWidth + padding.x * 2 + (stroke?.width ?? 0) * 2;
    const buttonHeight = contentHeight + padding.y * 2 + (stroke?.width ?? 0) * 2;

    // Clear border graphics
    this.#border.clear();

    // Draw border stroke if provided
    if (stroke && stroke.width > 0) {
      this.#border.roundRect(0, 0, buttonWidth, buttonHeight, borderRadius);
      this.#border.stroke({
        color: rgbToColor(stroke.color),
        width: stroke.width,
        alpha: stroke.alpha
      });
    }

    // Position icon and label side-by-side
    const centerX = buttonWidth / 2;
    const centerY = buttonHeight / 2;

    if (hasIcon && this.#sprite) {
      // Scale sprite to fit icon size
      const textureWidth = this.#sprite.texture.width;
      const textureHeight = this.#sprite.texture.height;
      const scaleX = iconSize.x / textureWidth;
      const scaleY = iconSize.y / textureHeight;
      this.#sprite.scale.set(scaleX, scaleY);

      // Position icon on left side of content area
      const iconX = centerX - contentWidth / 2 + iconSize.x / 2;
      this.#sprite.position.set(iconX, centerY);
      this.#sprite.anchor.set(0.5, 0.5);
      this.#sprite.alpha = this.#isDisabled ? iconAlpha * 0.5 : iconAlpha;

      // Position label to the right of icon
      const labelX = centerX - contentWidth / 2 + iconSize.x + iconGap + textWidth / 2;
      this.#labelText.position.set(labelX, centerY);
    } else {
      // No icon, center label
      this.#labelText.position.set(centerX, centerY);
    }

    this.#labelText.anchor.set(0.5, 0.5);

    // Apply label color and alpha
    if ('tint' in this.#labelText && !('style' in this.#labelText && 'fill' in (this.#labelText.style as any))) {
      // BitmapText
      this.#labelText.tint = rgbToColor(labelColor);
    } else {
      // Regular Text
      (this.#labelText as Text).style.fill = rgbToColor(labelColor);
    }
    this.#labelText.alpha = this.#isDisabled ? labelAlpha * 0.5 : labelAlpha;
  }

  /**
   * Render button with icon (original behavior)
   */
  #resolveWithIcon(): void {
    // Default values
    const defaultColor = { r: 0.5, g: 0.5, b: 0.5 };
    const defaultPadding = { x: 4, y: 4 };

    // Get button styles from StyleTree
    const defaultIconSize = { x: 32, y: 32 };
    const padding = {
      x: this.#getButtonStyle('padding', 'x') ?? defaultPadding.x,
      y: this.#getButtonStyle('padding', 'y') ?? defaultPadding.y,
    };

    // Get stroke styles
    const stroke = {
      color: {
        r: this.#getButtonStyle('stroke', 'color', 'r') ?? defaultColor.r,
        g: this.#getButtonStyle('stroke', 'color', 'g') ?? defaultColor.g,
        b: this.#getButtonStyle('stroke', 'color', 'b') ?? defaultColor.b,
      },
      alpha: this.#getButtonStyle('stroke', 'alpha') ?? 1,
      width: this.#getButtonStyle('stroke', 'width') ?? 1,
    };

    // Get fill styles (may be undefined for non-disabled state)
    const fillAlpha = this.#getButtonStyle('fill', 'alpha');
    const fill = fillAlpha !== undefined ? {
      color: {
        r: this.#getButtonStyle('fill', 'color', 'r') ?? 0.9,
        g: this.#getButtonStyle('fill', 'color', 'g') ?? 0.9,
        b: this.#getButtonStyle('fill', 'color', 'b') ?? 0.9,
      },
      alpha: fillAlpha,
    } : undefined;

    // Get icon styles
    const iconSize = {
      x: this.#getButtonStyle('icon', 'size', 'x') ?? defaultIconSize.x,
      y: this.#getButtonStyle('icon', 'size', 'y') ?? defaultIconSize.y,
    };
    const iconAlpha = this.#getButtonStyle('icon', 'alpha') ?? 1;
    const iconTint = this.#getButtonStyle('icon', 'tint');

    // Scale sprite to fit icon size
    if (this.#sprite) {
      const textureWidth = this.#sprite.texture.width;
      const textureHeight = this.#sprite.texture.height;
      const scaleX = iconSize.x / textureWidth;
      const scaleY = iconSize.y / textureHeight;
      this.#sprite.scale.set(scaleX, scaleY);

      // Calculate actual sprite dimensions after scaling
      const spriteWidth = textureWidth * scaleX;
      const spriteHeight = textureHeight * scaleY;

      // Calculate button size based on actual sprite size
      const buttonWidth = spriteWidth + padding.x * 2;
      const buttonHeight = spriteHeight + padding.y * 2;

      // Clear border graphics
      this.#border.clear();

      // Draw border stroke
      this.#border.rect(0, 0, buttonWidth, buttonHeight);
      this.#border.stroke({
        color: rgbToColor(stroke.color),
        width: stroke.width,
        alpha: stroke.alpha
      });

      // Position sprite centered
      this.#sprite.position.set(buttonWidth / 2, buttonHeight / 2);
      this.#sprite.anchor.set(0.5, 0.5);

      // Apply icon alpha and tint
      this.#sprite.alpha = iconAlpha;
      if (iconTint) {
        this.#sprite.tint = rgbToColor(iconTint);
      } else {
        this.#sprite.tint = 0xffffff; // Reset to white (no tint)
      }

      // Update label if it exists (positioned below icon)
      if (this.#labelText) {
        const labelPadding = this.#getLabelStyle('padding') ?? 4;
        const labelColor = this.#getLabelStyle('color') ?? { r: 0, g: 0, b: 0 };
        const labelAlpha = this.#getLabelStyle('alpha') ?? 0.5;

        // Position label below button
        const labelY = buttonHeight / 2 + labelPadding;
        this.#labelText.position.set(buttonWidth / 2, labelY + buttonHeight / 2);
        this.#labelText.anchor.set(0.5, 0);

        // BitmapText uses tint, Text uses style.fill
        if ('tint' in this.#labelText && !('style' in this.#labelText && 'fill' in (this.#labelText.style as any))) {
          // BitmapText
          this.#labelText.tint = rgbToColor(labelColor);
        } else {
          // Regular Text
          (this.#labelText as Text).style.fill = rgbToColor(labelColor);
        }
        this.#labelText.alpha = this.#isDisabled ? labelAlpha * 0.5 : labelAlpha;
      }
    }
  }

  // ============ Public Getters ============

  /**
   * Check if this is a text-only button (mode === 'text')
   */
  isTextOnly(): boolean {
    return this.#mode === 'text';
  }

  /**
   * Check if this is an inline button (mode === 'inline')
   */
  isInline(): boolean {
    return this.#mode === 'inline';
  }

  /**
   * Get the current button mode
   */
  getMode(): ButtonMode {
    return this.#mode;
  }

  /**
   * Get the current icon size from StyleTree
   */
  getIconSize(): { x: number; y: number } {
    if (this.#mode === 'inline') {
      const size = this.#getInlineButtonStyle('icon', 'size');
      return size ?? { x: 16, y: 16 };
    }
    return {
      x: this.#getButtonStyle('icon', 'size', 'x') ?? 32,
      y: this.#getButtonStyle('icon', 'size', 'y') ?? 32,
    };
  }

  /**
   * Get the current padding from StyleTree
   */
  getPadding(): { x: number; y: number } {
    if (this.#mode === 'text') {
      return {
        x: this.#getTextButtonStyle('padding', 'x') ?? 12,
        y: this.#getTextButtonStyle('padding', 'y') ?? 6,
      };
    }
    if (this.#mode === 'inline') {
      const padding = this.#getInlineButtonStyle('padding');
      return padding ?? { x: 12, y: 6 };
    }
    return {
      x: this.#getButtonStyle('padding', 'x') ?? 4,
      y: this.#getButtonStyle('padding', 'y') ?? 4,
    };
  }

  /**
   * Get the current label padding from StyleTree
   */
  getLabelPadding(): number {
    return this.#getLabelStyle('padding') ?? 4;
  }

  /**
   * Get the current label font size from StyleTree
   */
  getLabelFontSize(): number {
    if (this.#mode === 'text') {
      return this.#getTextButtonStyle('label', 'fontSize') ?? 13;
    }
    if (this.#mode === 'inline') {
      return this.#getInlineButtonStyle('label', 'fontSize') ?? 13;
    }
    return this.#getLabelStyle('fontSize') ?? 12;
  }

  /**
   * Get the text button border radius from StyleTree
   */
  getTextButtonBorderRadius(): number {
    return this.#getTextButtonStyle('borderRadius') ?? 4;
  }

  /**
   * Get the inline button border radius from StyleTree
   */
  getInlineButtonBorderRadius(): number {
    return this.#getInlineButtonStyle('borderRadius') ?? 4;
  }

  /**
   * Get the text button stroke width from StyleTree
   */
  getTextButtonStrokeWidth(): number {
    const stroke = this.#getTextButtonStyle('stroke');
    return stroke?.width ?? 0;
  }

  /**
   * Get the inline button stroke width from StyleTree
   */
  getInlineButtonStrokeWidth(): number {
    const stroke = this.#getInlineButtonStyle('stroke');
    return stroke?.width ?? 0;
  }

  /**
   * Get the inline button icon gap from StyleTree
   */
  getInlineButtonIconGap(): number {
    return this.#getInlineButtonStyle('iconGap') ?? 8;
  }

  /**
   * Get the button config
   */
  getButtonConfig(): ToolbarButtonConfig {
    return this.#buttonConfig;
  }

  /**
   * Check if button is hovered
   */
  get isHovered(): boolean {
    return this.#isHovered;
  }

  /**
   * Check if button is disabled
   */
  get isDisabled(): boolean {
    return this.#isDisabled;
  }

  /**
   * Compute the preferred/minimum size of this button based on its mode and content.
   * This is used by ToolbarStore to layout buttons before they've rendered.
   */
  getPreferredSize(): { width: number; height: number } {
    const padding = this.getPadding();

    if (this.#mode === 'icon') {
      // Icon button: icon size + padding + label height (if present)
      const iconSize = this.getIconSize();
      let width = iconSize.x + padding.x * 2;
      let height = iconSize.y + padding.y * 2;

      // Add label height if present
      if (this.#buttonConfig.label) {
        const labelPadding = this.getLabelPadding();
        const fontSize = this.getLabelFontSize();
        height += labelPadding + fontSize;
      }

      return { width, height };
    }

    if (this.#mode === 'text') {
      // Text button: estimate text width + padding + stroke
      const fontSize = this.getLabelFontSize();
      const strokeWidth = this.getTextButtonStrokeWidth();
      const label = this.#buttonConfig.label ?? '';

      // Estimate text width (rough approximation: ~0.6 * fontSize per character)
      const estimatedTextWidth = label.length * fontSize * 0.6;

      const width = estimatedTextWidth + padding.x * 2 + strokeWidth * 2;
      const height = fontSize + padding.y * 2 + strokeWidth * 2;

      return { width, height };
    }

    if (this.#mode === 'inline') {
      // Inline button: icon + gap + text + padding + stroke
      const iconSize = this.getIconSize();
      const iconGap = this.getInlineButtonIconGap();
      const fontSize = this.getLabelFontSize();
      const strokeWidth = this.getInlineButtonStrokeWidth();
      const label = this.#buttonConfig.label ?? '';

      // Estimate text width
      const estimatedTextWidth = label.length * fontSize * 0.6;

      let width = padding.x * 2 + strokeWidth * 2;
      if (this.#sprite) {
        width += iconSize.x + iconGap;
      }
      width += estimatedTextWidth;

      const height = Math.max(iconSize.y, fontSize) + padding.y * 2 + strokeWidth * 2;

      return { width, height };
    }

    // Fallback
    return { width: 40, height: 40 };
  }
}


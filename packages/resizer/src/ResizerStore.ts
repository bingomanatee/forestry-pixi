import { Forest } from '@wonderlandlabs/forestry4';
import { Container, Graphics, Rectangle, FederatedPointerEvent } from 'pixi.js';
import { trackDrag, TrackDragResult } from './trackDrag';
import { HandlePosition, HandleMode } from './types';
import type { Color } from './types';
import { ImmerableRectangle } from './ImmerableRectangle';

export interface ResizerStoreConfig {
  container: Container;
  rect: Rectangle;
  onRelease?: (rect: Rectangle) => void;
  size?: number;
  color?: Color;
  constrain?: boolean;
  mode?: HandleMode;
}

/**
 * Forestry-based state store for resize handles.
 * The value is an ImmerableRectangle representing the rectangle being resized.
 */
export class ResizerStore extends Forest<ImmerableRectangle> {
  private container: Container;
  private stage: Container;
  private onRelease?: (rect: Rectangle) => void;
  private size: number;
  private color: Color;
  private constrain: boolean;
  private mode: HandleMode;

  // Drag state
  private dragHandle: HandlePosition | null = null;
  private dragStartRect: ImmerableRectangle | null = null;

  // Handle management
  private handles = new Map<HandlePosition, Graphics>();
  private dragTrackers = new Map<Graphics, TrackDragResult>();
  private handlesContainer: Container;

  constructor(config: ResizerStoreConfig) {
    // Convert PixiJS Rectangle to ImmerableRectangle for Immer compatibility
    super({
      value: ImmerableRectangle.fromPixiRectangle(config.rect)
    });

    this.container = config.container;
    this.onRelease = config.onRelease;
    this.size = config.size ?? 12;
    this.color = config.color ?? { r: 0.2, g: 0.6, b: 1 };
    this.constrain = config.constrain ?? false;
    this.mode = config.mode ?? 'ONLY_CORNER';

    // Create handles container
    this.handlesContainer = new Container();
    this.handlesContainer.label = 'ResizerHandles';

    // Add handles container to parent
    const parent = this.container.parent;
    if (!parent) {
      throw new Error('Container must have a parent to add resize handles');
    }
    parent.addChild(this.handlesContainer);

    // Find the stage (root container) for global event listeners
    this.stage = parent;
    while (this.stage.parent) {
      this.stage = this.stage.parent;
    }

    console.log('ResizerStore stage found:', this.stage.label || 'unlabeled', 'eventMode:', this.stage.eventMode);

    // Ensure stage has a comprehensive hit area for capturing pointer events
    if (!this.stage.hitArea) {
      this.stage.hitArea = new Rectangle(0, 0, 10000, 10000);
      console.log('Set stage hitArea to comprehensive area');
    }

    // Create handles
    this.createHandles();
  }

  /**
   * Drag start handler - bound via this.$
   */
  onDragStart(event: FederatedPointerEvent, position: HandlePosition) {
    console.log('Drag started on handle:', position);
    event.stopPropagation();

    this.dragHandle = position;
    // Clone the ImmerableRectangle
    this.dragStartRect = this.value.clone();
  }

  /**
   * Drag move handler - bound via this.$
   */
  onDragMove(deltaX: number, deltaY: number, event: FederatedPointerEvent) {
    console.log('---- onDragMove');
    event.stopPropagation();

    if (!this.dragHandle || !this.dragStartRect) {
      console.warn('onDragMove noop');
      return;
    }

    const newRect = this.calculateNewRect(
      this.dragHandle,
      deltaX,
      deltaY,
      this.dragStartRect
    );

    // Update state with plain object
    this.mutate(() => newRect);

    // Update handles to new positions
    this.updateHandles();
  }

  /**
   * Drag end handler - bound via this.$
   */
  onDragEnd(event: FederatedPointerEvent) {
    console.log('Drag ended on handle:', this.dragHandle);
    event.stopPropagation();

    this.dragHandle = null;
    this.dragStartRect = null;

    // Call onRelease callback if provided
    if (this.onRelease) {
      console.log('Calling onRelease callback');
      // Convert ImmerableRectangle to PixiJS Rectangle for callback
      const rect = new Rectangle(this.value.x, this.value.y, this.value.width, this.value.height);
      this.onRelease(rect);
    }
  }

  /**
   * Get handle positions based on mode
   */
  private getHandlePositions(): HandlePosition[] {
    switch (this.mode) {
      case 'ONLY_CORNER':
        return [
          HandlePosition.TOP_LEFT,
          HandlePosition.TOP_RIGHT,
          HandlePosition.BOTTOM_LEFT,
          HandlePosition.BOTTOM_RIGHT,
        ];
      case 'ONLY_EDGE':
        return [
          HandlePosition.TOP_CENTER,
          HandlePosition.MIDDLE_RIGHT,
          HandlePosition.BOTTOM_CENTER,
          HandlePosition.MIDDLE_LEFT,
        ];
      case 'EDGE_AND_CORNER':
        return [
          HandlePosition.TOP_LEFT,
          HandlePosition.TOP_CENTER,
          HandlePosition.TOP_RIGHT,
          HandlePosition.MIDDLE_RIGHT,
          HandlePosition.BOTTOM_RIGHT,
          HandlePosition.BOTTOM_CENTER,
          HandlePosition.BOTTOM_LEFT,
          HandlePosition.MIDDLE_LEFT,
        ];
    }
  }

  /**
   * Convert color to hex
   */
  private colorToHex(color: Color): number {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Get handle local position relative to rect
   */
  private getHandleLocalPosition(position: HandlePosition, rect: ImmerableRectangle): { x: number; y: number } {
    const { x, y, width, height } = rect;

    switch (position) {
      case HandlePosition.TOP_LEFT:
        return { x, y };
      case HandlePosition.TOP_CENTER:
        return { x: x + width / 2, y };
      case HandlePosition.TOP_RIGHT:
        return { x: x + width, y };
      case HandlePosition.MIDDLE_RIGHT:
        return { x: x + width, y: y + height / 2 };
      case HandlePosition.BOTTOM_RIGHT:
        return { x: x + width, y: y + height };
      case HandlePosition.BOTTOM_CENTER:
        return { x: x + width / 2, y: y + height };
      case HandlePosition.BOTTOM_LEFT:
        return { x, y: y + height };
      case HandlePosition.MIDDLE_LEFT:
        return { x, y: y + height / 2 };
      default:
        return { x, y };
    }
  }

  /**
   * Get cursor style for handle position
   */
  private getCursorForHandle(position: HandlePosition): string {
    switch (position) {
      case HandlePosition.TOP_LEFT:
      case HandlePosition.BOTTOM_RIGHT:
        return 'nwse-resize';
      case HandlePosition.TOP_RIGHT:
      case HandlePosition.BOTTOM_LEFT:
        return 'nesw-resize';
      case HandlePosition.TOP_CENTER:
      case HandlePosition.BOTTOM_CENTER:
        return 'ns-resize';
      case HandlePosition.MIDDLE_LEFT:
      case HandlePosition.MIDDLE_RIGHT:
        return 'ew-resize';
      default:
        return 'default';
    }
  }

  /**
   * Create a single handle graphic
   */
  private createHandle(position: HandlePosition): Graphics {
    const handle = new Graphics();
    handle.rect(-this.size / 2, -this.size / 2, this.size, this.size);
    handle.fill(this.colorToHex(this.color));
    handle.stroke({ width: 1, color: 0xffffff });

    handle.eventMode = 'static';
    handle.cursor = this.getCursorForHandle(position);
    handle.label = `Handle-${position}`;

    return handle;
  }

  /**
   * Update handle positions based on current rect
   */
  private updateHandles() {
    const containerPos = this.container.getGlobalPosition();
    const rect = this.value;

    this.handles.forEach((handle, position) => {
      const localPos = this.getHandleLocalPosition(position, rect);
      const worldX = containerPos.x + localPos.x;
      const worldY = containerPos.y + localPos.y;

      handle.position.set(worldX, worldY);

      // Counter-scale to maintain constant size
      const parentScale = this.container.parent?.scale.x ?? 1;
      const scale = 1 / parentScale;
      handle.scale.set(scale, scale);
    });
  }

  /**
   * Calculate new rectangle based on drag
   */
  private calculateNewRect(
    position: HandlePosition,
    deltaX: number,
    deltaY: number,
    startRect: ImmerableRectangle
  ): ImmerableRectangle {
    // Clone the ImmerableRectangle
    const newRect = startRect.clone();
    const parentScale = this.container.parent?.scale.x ?? 1;
    const scaledDeltaX = deltaX / parentScale;
    const scaledDeltaY = deltaY / parentScale;

    switch (position) {
      case HandlePosition.TOP_LEFT:
        newRect.x += scaledDeltaX;
        newRect.y += scaledDeltaY;
        newRect.width -= scaledDeltaX;
        newRect.height -= scaledDeltaY;
        break;
      case HandlePosition.TOP_CENTER:
        newRect.y += scaledDeltaY;
        newRect.height -= scaledDeltaY;
        break;
      case HandlePosition.TOP_RIGHT:
        newRect.y += scaledDeltaY;
        newRect.width += scaledDeltaX;
        newRect.height -= scaledDeltaY;
        break;
      case HandlePosition.MIDDLE_RIGHT:
        newRect.width += scaledDeltaX;
        break;
      case HandlePosition.BOTTOM_RIGHT:
        newRect.width += scaledDeltaX;
        newRect.height += scaledDeltaY;
        break;
      case HandlePosition.BOTTOM_CENTER:
        newRect.height += scaledDeltaY;
        break;
      case HandlePosition.BOTTOM_LEFT:
        newRect.x += scaledDeltaX;
        newRect.width -= scaledDeltaX;
        newRect.height += scaledDeltaY;
        break;
      case HandlePosition.MIDDLE_LEFT:
        newRect.x += scaledDeltaX;
        newRect.width -= scaledDeltaX;
        break;
    }

    // Apply constraints if enabled
    if (this.constrain && startRect.width > 0 && startRect.height > 0) {
      const aspectRatio = startRect.width / startRect.height;
      newRect.height = newRect.width / aspectRatio;
    }

    return newRect;
  }

  /**
   * Create all handles and attach drag tracking
   */
  private createHandles() {
    const positions = this.getHandlePositions();

    positions.forEach((position) => {
      const handle = this.createHandle(position);
      this.handles.set(position, handle);
      this.handlesContainer.addChild(handle);

      // Attach drag tracking using bound methods
      const tracker = trackDrag(
        handle,
        {
          onDragStart: (event) => this.$.onDragStart(event, position),
          onDragMove: (deltaX, deltaY, event) => this.$.onDragMove(deltaX, deltaY, event),
          onDragEnd: (event) => this.$.onDragEnd(event),
        },
        this.stage
      );

      this.dragTrackers.set(handle, tracker);
    });

    // Initial position update
    this.updateHandles();
  }

  /**
   * Remove all handles and cleanup
   */
  public removeHandles() {
    // Destroy all drag trackers
    this.dragTrackers.forEach((tracker) => tracker.destroy());
    this.dragTrackers.clear();

    // Remove all handles
    this.handles.forEach((handle) => {
      handle.destroy();
    });
    this.handles.clear();

    // Remove handles container
    this.handlesContainer.destroy();
  }

  /**
   * Programmatically set the rectangle
   */
  public setRect(rect: Rectangle) {
    // Convert PixiJS Rectangle to ImmerableRectangle
    this.mutate(() => ImmerableRectangle.fromPixiRectangle(rect));
    this.updateHandles();
  }
}

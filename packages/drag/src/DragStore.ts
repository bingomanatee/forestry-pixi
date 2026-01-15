import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry4';

// Schema for drag state
const DragStoreSchema = z.object({
  isDragging: z.boolean().default(false),
  draggedItemId: z.string().nullable().default(null),
  startX: z.number().default(0),
  startY: z.number().default(0),
  currentX: z.number().default(0),
  currentY: z.number().default(0),
  deltaX: z.number().default(0),
  deltaY: z.number().default(0),
  initialItemX: z.number().default(0),
  initialItemY: z.number().default(0),
});

export type DragStoreValue = z.infer<typeof DragStoreSchema>;

export interface DragCallbacks {
  onDragStart?: (itemId: string, x: number, y: number) => void;
  onDrag?: (itemId: string, x: number, y: number, deltaX: number, deltaY: number) => void;
  onDragEnd?: (itemId: string, x: number, y: number) => void;
}

export class DragStore extends Forest<DragStoreValue> {
  private callbacks: DragCallbacks = {};

  constructor(callbacks?: DragCallbacks) {
    super({
      value: {
        isDragging: false,
        draggedItemId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
        initialItemX: 0,
        initialItemY: 0,
      },
    });

    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  /**
   * Set callbacks for drag events
   */
  setCallbacks(callbacks: DragCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Start dragging an item
   */
  startDrag(itemId: string, clientX: number, clientY: number, itemX: number = 0, itemY: number = 0) {
    this.mutate(draft => {
      draft.isDragging = true;
      draft.draggedItemId = itemId;
      draft.startX = clientX;
      draft.startY = clientY;
      draft.currentX = clientX;
      draft.currentY = clientY;
      draft.deltaX = 0;
      draft.deltaY = 0;
      draft.initialItemX = itemX;
      draft.initialItemY = itemY;
    });

    this.callbacks.onDragStart?.(itemId, clientX, clientY);
  }

  /**
   * Update drag position
   */
  updateDrag(clientX: number, clientY: number) {
    if (!this.value.isDragging || !this.value.draggedItemId) return;

    const deltaX = clientX - this.value.startX;
    const deltaY = clientY - this.value.startY;

    this.mutate(draft => {
      draft.currentX = clientX;
      draft.currentY = clientY;
      draft.deltaX = deltaX;
      draft.deltaY = deltaY;
    });

    this.callbacks.onDrag?.(
      this.value.draggedItemId,
      this.value.initialItemX + deltaX,
      this.value.initialItemY + deltaY,
      deltaX,
      deltaY
    );
  }

  /**
   * End dragging
   */
  endDrag() {
    if (!this.value.isDragging || !this.value.draggedItemId) return;

    const itemId = this.value.draggedItemId;
    const finalX = this.value.initialItemX + this.value.deltaX;
    const finalY = this.value.initialItemY + this.value.deltaY;

    this.callbacks.onDragEnd?.(itemId, finalX, finalY);

    this.mutate(draft => {
      draft.isDragging = false;
      draft.draggedItemId = null;
      draft.startX = 0;
      draft.startY = 0;
      draft.currentX = 0;
      draft.currentY = 0;
      draft.deltaX = 0;
      draft.deltaY = 0;
      draft.initialItemX = 0;
      draft.initialItemY = 0;
    });
  }

  /**
   * Cancel dragging without triggering onDragEnd
   */
  cancelDrag() {
    this.mutate(draft => {
      draft.isDragging = false;
      draft.draggedItemId = null;
      draft.startX = 0;
      draft.startY = 0;
      draft.currentX = 0;
      draft.currentY = 0;
      draft.deltaX = 0;
      draft.deltaY = 0;
      draft.initialItemX = 0;
      draft.initialItemY = 0;
    });
  }

  /**
   * Get the current dragged item position
   */
  getCurrentItemPosition(): { x: number; y: number } | null {
    if (!this.value.isDragging) return null;

    return {
      x: this.value.initialItemX + this.value.deltaX,
      y: this.value.initialItemY + this.value.deltaY,
    };
  }

  /**
   * Check if a specific item is being dragged
   */
  isItemDragging(itemId: string): boolean {
    return this.value.isDragging && this.value.draggedItemId === itemId;
  }
}


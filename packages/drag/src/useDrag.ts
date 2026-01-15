import { useRef, useCallback, useState } from 'react';

export interface DragState {
  isDragging: boolean;
  position: { x: number; y: number };
}

export interface UseDragOptions {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (position: { x: number; y: number }) => void;
}

export const useDrag = (options: UseDragOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = position;
    options.onDragStart?.();
  }, [position, options]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    const newPosition = {
      x: elementStartPos.current.x + deltaX,
      y: elementStartPos.current.y + deltaY
    };
    
    setPosition(newPosition);
    options.onDrag?.(newPosition);
  }, [isDragging, options]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      options.onDragEnd?.();
    }
  }, [isDragging, options]);

  return {
    isDragging,
    position,
    dragHandlers: {
      onMouseDown: handleMouseDown
    },
    setPosition
  };
};


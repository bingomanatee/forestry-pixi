import React, { CSSProperties } from 'react';

export interface GridProps {
  rows: number;
  cols: number;
  gap?: number;
  children?: React.ReactNode;
  style?: CSSProperties;
}

export const Grid: React.FC<GridProps> = ({ 
  rows, 
  cols, 
  gap = 10, 
  children,
  style 
}) => {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gap}px`,
    width: '100%',
    height: '100%',
    ...style
  };

  return (
    <div style={gridStyle}>
      {children}
    </div>
  );
};


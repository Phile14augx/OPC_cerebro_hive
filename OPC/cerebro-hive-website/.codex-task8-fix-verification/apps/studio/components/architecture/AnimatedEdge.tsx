import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { cn } from '@/lib/utils';

export const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth: 2, stroke: 'var(--border)' }} 
        className="transition-colors duration-300"
      />
      {data?.animated && (
        <circle r="3" fill="#00E5FF" className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
};

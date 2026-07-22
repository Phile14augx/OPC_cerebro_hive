import React from 'react';
import { Handle, Position, EdgeProps, getSmoothStepPath, getBezierPath } from '@xyflow/react';

const themeColors: Record<string, string> = {
  executive: '#F59E0B', // amber-500
  engineering: '#3B82F6', // blue-500
  research: '#A855F7', // purple-500
  consulting: '#06B6D4', // cyan-500
  business: '#F97316', // orange-500
  default: '#6B7280'
};

export const AnimatedNeuralEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const themeColor = data?.theme ? themeColors[data.theme as string] : themeColors.default;

  return (
    <>
      {/* 1. Subtle Glow Underlay */}
      <path
        id={id + '_glow'}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={themeColor}
        strokeWidth={12}
        strokeOpacity={0.05}
        fill="none"
        style={{ filter: 'blur(4px)' }}
      />
      
      {/* 2. Core Edge Stroke */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={themeColor}
        strokeWidth={1.5}
        strokeOpacity={0.4}
        fill="none"
        markerEnd={markerEnd}
      />
      
      {/* 3. Animated Pulse/Particle */}
      <circle r="3" fill={themeColor} style={{ filter: 'drop-shadow(0 0 4px ' + themeColor + ')' }}>
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="3s" repeatCount="indefinite" />
      </circle>
    </>
  );
};

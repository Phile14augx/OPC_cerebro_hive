import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export const AnimatedPacketEdge = ({
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

  const packetColor = (data?.packetColor as string) || '#00F57A';
  const duration = (data?.duration as string) || '2s';
  const delay = (data?.delay as string) || '0s';
  const hidePacket = (data?.hidePacket as boolean) || false;
  const isBrainMode = (data?.isBrainMode as boolean) || false;

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: isBrainMode ? packetColor : style.stroke || '#333333',
          strokeWidth: isBrainMode ? 2 : 1,
          opacity: isBrainMode ? 0.3 : 1,
          transition: 'all 0.5s ease'
        }} 
      />
      {!hidePacket && (
        <circle r={isBrainMode ? 3 : 4} fill={packetColor} className="drop-shadow-[0_0_8px_currentColor]">
          <animateMotion 
            dur={duration} 
            repeatCount="indefinite" 
            path={edgePath} 
            begin={delay}
          />
        </circle>
      )}
    </>
  );
};

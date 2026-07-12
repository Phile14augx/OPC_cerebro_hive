import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const panels = [
  { title: "Enterprise AI", metric: "97%", sub: "Automation", pos: [4, 2, -2] as [number, number, number] },
  { title: "RAG System", metric: "128 ms", sub: "Latency", pos: [-5, 3, -4] as [number, number, number] },
  { title: "AI Agents", metric: "24", sub: "Active", pos: [5, -2, -3] as [number, number, number] },
  { title: "Cloud Integration", metric: "AWS", sub: "Azure • GCP", pos: [-4, -3, -1] as [number, number, number] },
  { title: "Knowledge Graph", metric: "12.4M", sub: "Entities", pos: [0, 4, -5] as [number, number, number] },
];

export function FloatingPanels() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {panels.map((panel, idx) => (
        <Html 
          key={idx} 
          position={panel.pos} 
          transform 
          occlude={false}
          className="pointer-events-none select-none"
        >
          <div className="w-48 p-4 rounded-xl border border-white/10 bg-[#0E131A]/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,245,122,0.1)] flex flex-col gap-1">
            <span className="text-[10px] font-space font-semibold uppercase tracking-widest text-secondary-accent">
              {panel.title}
            </span>
            <span className="text-2xl font-mono font-light text-white">
              {panel.metric}
            </span>
            <span className="text-xs font-inter text-text-muted">
              {panel.sub}
            </span>
          </div>
        </Html>
      ))}
    </group>
  );
}

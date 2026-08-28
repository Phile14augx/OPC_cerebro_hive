import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

interface NetworkState {
  count: number;
  maxConnections: number;
  positions: Float32Array;
  velocities: Float32Array;
  linePositions: Float32Array;
  lineOpacities: Float32Array;
}

const createNetworkState = (count: number): NetworkState => {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const maxConnections = count * 3;

  for (let i = 0; i < count; i++) {
    const radius = Math.pow(pseudoRandom(i * 6 + 1), 2) * 15;
    const theta = pseudoRandom(i * 6 + 2) * Math.PI * 2;
    const phi = Math.acos(2 * pseudoRandom(i * 6 + 3) - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    velocities[i * 3] = (pseudoRandom(i * 6 + 4) - 0.5) * 0.02;
    velocities[i * 3 + 1] = (pseudoRandom(i * 6 + 5) - 0.5) * 0.02;
    velocities[i * 3 + 2] = (pseudoRandom(i * 6 + 6) - 0.5) * 0.02;
  }

  return {
    count,
    maxConnections,
    positions,
    velocities,
    linePositions: new Float32Array(maxConnections * 6),
    lineOpacities: new Float32Array(maxConnections * 2),
  };
};

export function NeuralNetwork({ count = 400 }) {
  const { theme } = useTheme();
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const simulationRef = useRef<NetworkState | null>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update loop
  useFrame(() => {
    if (!nodesRef.current || !linesRef.current) return;
    const geometry = linesRef.current.geometry;
    let simulation = simulationRef.current;

    if (!simulation || simulation.count !== count) {
      simulation = createNetworkState(count);
      simulationRef.current = simulation;
      geometry.setAttribute('position', new THREE.BufferAttribute(simulation.linePositions, 3));
      geometry.setAttribute('opacity', new THREE.BufferAttribute(simulation.lineOpacities, 1));
      geometry.setDrawRange(0, 0);
    }

    const { positions, velocities, linePositions, lineOpacities, maxConnections } = simulation;
    
    let connectionIndex = 0;
    
    // Update node positions based on velocities
    for (let i = 0; i < count; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // Keep them constrained
      if (Math.abs(positions[i * 3]) > 20) velocities[i * 3] *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 20) velocities[i * 3 + 1] *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 20) velocities[i * 3 + 2] *= -1;

      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.updateMatrix();
      nodesRef.current.setMatrixAt(i, dummy.matrix);
    }
    nodesRef.current.instanceMatrix.needsUpdate = true;

    // Update lines (connections) based on distance
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (connectionIndex >= maxConnections) break;

        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 15) { // Connection threshold
          const alpha = 1.0 - distSq / 15;
          
          linePositions[connectionIndex * 6] = positions[i * 3];
          linePositions[connectionIndex * 6 + 1] = positions[i * 3 + 1];
          linePositions[connectionIndex * 6 + 2] = positions[i * 3 + 2];
          linePositions[connectionIndex * 6 + 3] = positions[j * 3];
          linePositions[connectionIndex * 6 + 4] = positions[j * 3 + 1];
          linePositions[connectionIndex * 6 + 5] = positions[j * 3 + 2];
          
          lineOpacities[connectionIndex * 2] = alpha;
          lineOpacities[connectionIndex * 2 + 1] = alpha;

          connectionIndex++;
        }
      }
    }

    // Hide unused lines
    for (let i = connectionIndex; i < maxConnections; i++) {
      linePositions[i * 6] = 0;
      linePositions[i * 6 + 1] = 0;
      linePositions[i * 6 + 2] = 0;
      linePositions[i * 6 + 3] = 0;
      linePositions[i * 6 + 4] = 0;
      linePositions[i * 6 + 5] = 0;
      lineOpacities[i * 2] = 0;
      lineOpacities[i * 2 + 1] = 0;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
    geometry.setDrawRange(0, connectionIndex * 2);
    
    // Slow rotation
    nodesRef.current.rotation.y += 0.001;
    linesRef.current.rotation.y += 0.001;
  });

  return (
    <group>
      {/* Nodes */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial 
          color={theme === 'light' ? "#00E676" : "#00C8FF"}
          transmission={0.9}
          thickness={1.2}
          roughness={theme === 'light' ? 0.05 : 0.15}
          metalness={0.0}
        />
      </instancedMesh>

      {/* Connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
          uniforms={{
            color: { value: new THREE.Color(theme === 'light' ? "#CBD5E1" : "#00F57A") }
          }}
          vertexShader={`
            attribute float opacity;
            varying float vOpacity;
            void main() {
              vOpacity = opacity;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 color;
            varying float vOpacity;
            void main() {
              gl_FragColor = vec4(color, vOpacity * (0.8));
            }
          `}
        />
      </lineSegments>
    </group>
  );
}

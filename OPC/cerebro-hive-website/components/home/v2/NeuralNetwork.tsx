import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function NeuralNetwork({ count = 400 }) {
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate nodes with higher density near center
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 2) * 15; // Power of 2 clusters them near center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  const maxConnections = count * 3;
  const linePositions = useMemo(() => new Float32Array(maxConnections * 6), [maxConnections]);
  const lineOpacities = useMemo(() => new Float32Array(maxConnections * 2), [maxConnections]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update loop
  useFrame(() => {
    if (!nodesRef.current || !linesRef.current) return;
    
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

    const geometry = linesRef.current.geometry as THREE.BufferGeometry;
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
          color="#00C8FF"
          transmission={0.9}
          thickness={1.2}
          roughness={0.15}
          metalness={0.0}
        />
      </instancedMesh>

      {/* Connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-opacity"
            args={[lineOpacities, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`
            attribute float opacity;
            varying float vOpacity;
            void main() {
              vOpacity = opacity;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying float vOpacity;
            void main() {
              gl_FragColor = vec4(0.0, 0.96, 0.478, vOpacity * 0.4); // #00F57A with opacity
            }
          `}
        />
      </lineSegments>
    </group>
  );
}

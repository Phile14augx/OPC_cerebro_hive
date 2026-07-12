"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { NeuralNetwork } from "./NeuralNetwork";
import { Particles } from "./Particles";
import { FloatingPanels } from "./FloatingPanels";
import { GradientBackground } from "./GradientBackground";
import * as THREE from "three";

function CameraRig() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.mouse.x * Math.PI) / 10, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.mouse.y * Math.PI) / 20, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export function Scene() {
  // Determine if high performance (this could be tied to an actual check or a global store later)
  const isHighTier = true; // Hardcoded for showcase for now

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 45 }}
      dpr={[1, 2]} // Optimize pixel ratio
      gl={{ antialias: false, powerPreference: "high-performance" }} // Antialias false because we use postprocessing
    >
      <color attach="background" args={["#07090D"]} />
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00F57A" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#00C8FF" />

      {/* Layer 1: Procedural Gradient */}
      <GradientBackground />

      {/* Layer 2 & 3: Neural Network and Data Flow */}
      <NeuralNetwork count={isHighTier ? 600 : 200} />

      {/* Layer 5: Ambient Particles */}
      <Particles count={isHighTier ? 3000 : 1000} />

      {/* Layer 4: Glass Panels */}
      {isHighTier && <FloatingPanels />}

      {/* Camera Movement */}
      <CameraRig />

      {/* Post Processing */}
      {isHighTier && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.8} />
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

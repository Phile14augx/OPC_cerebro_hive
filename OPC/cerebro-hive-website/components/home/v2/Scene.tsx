"use client";

import React, { useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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

/** Gate EffectComposer until the GL context render target is ready */
function PostEffects() {
  const { gl } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait one frame after mount — ensures the render target is initialised
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [gl]);

  if (!ready) return null;

  return (
    // multisampling={0} is required when gl.antialias is false —
    // otherwise postprocessing creates a multisampled render target whose
    // alpha buffer is null, causing the "Cannot read properties of null (reading 'alpha')" crash.
    // @ts-expect-error: Property 'disableNormalPass' might be missing from types but works at runtime
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom luminanceThreshold={0.4} mipmapBlur intensity={1.2} radius={0.7} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}

export function Scene() {
  const { theme } = useTheme();
  // Determine if high performance (this could be tied to an actual check or a global store later)
  const isHighTier = true; // Hardcoded for showcase for now
  
  const bgColor = theme === "light" ? "#F7F9FC" : "#050A0F";
  const lightColor1 = theme === "light" ? "#00E676" : "#00F57A";
  const lightColor2 = theme === "light" ? "#00B8FF" : "#00C8FF";

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 45 }}
      dpr={[1, 2]} // Optimize pixel ratio
      gl={{ antialias: false, powerPreference: "high-performance" }} // Antialias false because we use postprocessing
    >
      <color attach="background" args={[bgColor]} />
      
      {/* Lights */}
      <ambientLight intensity={theme === "light" ? 1.5 : 0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={lightColor1} />
      <pointLight position={[-10, -10, -10]} intensity={1} color={lightColor2} />

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

      {/* Post Processing — gated until GL context is ready */}
      {isHighTier && <PostEffects />}
    </Canvas>
  );
}

/**
 * Universe Canvas Component
 * Cinematic space exploration experience with persistent 3D universe
 * Mode-based rendering: LANDING (stars only) → EXPLORE (full experience)
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useUniverseStore } from '../../state/useUniverseStore.js';
import { useSettingsStore } from '../../state/useSettingsStore.js';
import { useExplorationStore, EXPLORATION_MODES } from '../../state/useExplorationStore.js';

// 3D Components
import Spaceship from './Spaceship.jsx';
import SpaceshipController from './SpaceshipController.jsx';
import EvolvingSolarSystem from './EvolvingSolarSystem.jsx';

const UniverseCanvas = () => {
  const { setSceneReady } = useUniverseStore();
  const { enableBloom, enablePostProcessing, bloomStrength } = useSettingsStore();
  const { scene, camera } = useThree();
  const { 
    mode, 
    spaceshipVisible, 
    spaceshipPosition, 
    spaceshipVelocity 
  } = useExplorationStore();
  
  // Performance: FPS monitoring
  const fpsRef = useRef(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  
  // Camera drift for landing mode
  const driftOffset = useRef(new THREE.Vector3());

  // Initialize scene
  useEffect(() => {
    setSceneReady(true);
    
    // Add atmospheric fog for depth (only in explore mode)
    if (mode === EXPLORATION_MODES.EXPLORE) {
      scene.fog = new THREE.Fog('#000011', 100, 600);
    } else {
      scene.fog = null;
    }
    
    return () => {
      scene.fog = null;
    };
  }, [setSceneReady, scene, mode]);

  // Performance monitoring and camera drift
  useFrame((state, delta) => {
    frameCount.current++;
    const now = Date.now();
    
    if (now - lastTime.current >= 1000) {
      fpsRef.current = frameCount.current;
      frameCount.current = 0;
      lastTime.current = now;
      
      // Log performance warnings
      if (fpsRef.current < 45) {
        console.warn(`Low FPS detected: ${fpsRef.current}fps`);
      }
    }
    
    // Landing mode: subtle camera drift
    if (mode === EXPLORATION_MODES.LANDING) {
      const time = state.clock.elapsedTime;
      
      // More organic, floating-in-space feeling
      driftOffset.current.x = Math.sin(time * 0.08) * 1.5 + Math.cos(time * 0.12) * 0.8;
      driftOffset.current.y = Math.cos(time * 0.1) * 1.2 + Math.sin(time * 0.07) * 0.6;
      driftOffset.current.z = Math.sin(time * 0.06) * 2 + Math.cos(time * 0.09) * 1;
      
      // Very gentle drift
      camera.position.add(driftOffset.current.clone().multiplyScalar(delta * 0.08));
      
      // Subtle rotation drift
      const rotationDrift = Math.sin(time * 0.05) * 0.002;
      camera.rotation.z += rotationDrift * delta;
      
      // Look into deep space
      const lookTarget = new THREE.Vector3(
        Math.sin(time * 0.03) * 10,
        Math.cos(time * 0.04) * 5,
        -200
      );
      camera.lookAt(lookTarget);
    }
  });

  return (
    <>
      {/* Spaceship Controller (handles movement and camera in explore mode) */}
      {mode === EXPLORATION_MODES.EXPLORE && <SpaceshipController />}
      
      {/* Basic OrbitControls for landing mode only */}
      {mode === EXPLORATION_MODES.LANDING && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          rotateSpeed={0.1}
          autoRotate={true}
          autoRotateSpeed={0.2}
        />
      )}
      
      {/* Professional Lighting Setup - Purple Neon Theme */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#9B5CFF" />
      <hemisphereLight intensity={0.3} color="#C77DFF" groundColor="#0B061A" />
      
      {/* Background Stars - Different density based on mode */}
      <Stars 
        radius={mode === EXPLORATION_MODES.LANDING ? 800 : 500} 
        depth={mode === EXPLORATION_MODES.LANDING ? 200 : 100} 
        count={mode === EXPLORATION_MODES.LANDING ? 5000 : 2000} 
        factor={mode === EXPLORATION_MODES.LANDING ? 8 : 6} 
        saturation={0} 
        fade 
        speed={mode === EXPLORATION_MODES.LANDING ? 0.1 : 0.2}
      />

      {/* Spaceship (only visible in explore mode) */}
      {spaceshipVisible && (
        <Spaceship
          position={spaceshipPosition}
          velocity={spaceshipVelocity}
          visible={spaceshipVisible}
        />
      )}
      
      {/* Evolving Solar System (only in explore mode) */}
      {mode === EXPLORATION_MODES.EXPLORE && <EvolvingSolarSystem />}

      {/* Performance-conscious post-processing */}
      {enablePostProcessing && fpsRef.current > 50 && (
        <EffectComposer 
          multisampling={0}
          disableNormalPass={true} // Performance optimization
        >
          {enableBloom && (
            <Bloom
              intensity={bloomStrength * 0.5} // Further reduced for performance
              luminanceThreshold={0.5} // Higher threshold = better performance
              luminanceSmoothing={0.9}
              mipmapBlur={true}
              radius={0.8} // Smaller radius = better performance
            />
          )}
        </EffectComposer>
      )}
    </>
  );
};

export default UniverseCanvas;
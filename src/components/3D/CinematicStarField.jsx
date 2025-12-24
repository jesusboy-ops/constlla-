/**
 * Cinematic Star Field Component - Optimized
 * Reduced star count and optimized twinkling to minimize performance impact
 * Phase-controlled twinkling intensity
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizationStore, MOTION_PHASES } from '../../state/useVisualizationStore.js';

const CinematicStarField = ({ count = 8000, radius = 2000 }) => {
  const meshRef = useRef();
  const { phase } = useVisualizationStore();
  
  // Reduced star count for better performance
  const actualCount = Math.min(count, 8000); // Cap at 8k stars
  
  // Create instanced star geometry and data
  const { geometry, matrices, colors, twinklePhases } = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.4, 4, 3); // Reduced geometry complexity
    const matricesArray = [];
    const colorsArray = new Float32Array(actualCount * 3);
    const twinklePhasesArray = new Float32Array(actualCount);
    
    // Star color palette (white, purple, blue)
    const starColors = [
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#e879f9'), // Purple
      new THREE.Color('#60a5fa'), // Blue
      new THREE.Color('#f8fafc'), // Bright white
      new THREE.Color('#c084fc'), // Light purple
      new THREE.Color('#93c5fd'), // Light blue
    ];
    
    for (let i = 0; i < actualCount; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.6 + Math.random() * 0.4); // Varied distances
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      // Varied star sizes (most small, some larger)
      const size = Math.random() < 0.92 ? 
        0.2 + Math.random() * 0.6 : // Small stars
        1.0 + Math.random() * 1.5; // Larger bright stars
      
      // Create transformation matrix
      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, y, z);
      matrix.scale(new THREE.Vector3(size, size, size));
      matricesArray.push(matrix);
      
      // Random star color
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;
      
      // Random twinkle phase for each star
      twinklePhasesArray[i] = Math.random() * Math.PI * 2;
    }
    
    return {
      geometry: geo,
      matrices: matricesArray,
      colors: colorsArray,
      twinklePhases: twinklePhasesArray
    };
  }, [actualCount, radius]);
  
  // Optimized twinkling animation with phase control
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Phase-dependent twinkling parameters
      let twinkleSpeed, twinkleIntensity, updateFrequency;
      
      switch (phase) {
        case MOTION_PHASES.FROZEN:
          // Minimal twinkling in frozen mode to reduce visual noise
          twinkleSpeed = 0.2;
          twinkleIntensity = 0.05;
          updateFrequency = 8; // Update every 8th frame
          break;
        case MOTION_PHASES.NORMAL:
          twinkleSpeed = 1.0;
          twinkleIntensity = 0.12;
          updateFrequency = 4; // Update every 4th frame
          break;
        case MOTION_PHASES.FROZEN:
          twinkleSpeed = 0.0; // No twinkling when frozen
          twinkleIntensity = 0.0;
          updateFrequency = 8; // Slower updates when frozen
          break;
        default:
          twinkleSpeed = 1.0;
          twinkleIntensity = 0.12;
          updateFrequency = 4;
      }
      
      // Optimize by only updating a subset of stars each frame
      const frameCount = Math.floor(time * 60); // Approximate frame count
      if (frameCount % updateFrequency !== 0) return;
      
      // Update stars in batches to spread load
      const batchSize = Math.floor(actualCount / updateFrequency);
      const startIndex = (frameCount / updateFrequency) % updateFrequency * batchSize;
      const endIndex = Math.min(startIndex + batchSize, actualCount);
      
      for (let i = startIndex; i < endIndex; i++) {
        const phase = twinklePhases[i];
        const baseMatrix = matrices[i];
        
        // Subtle twinkling (not blinking)
        const twinkle = Math.sin(time * twinkleSpeed + phase) * twinkleIntensity + (1 - twinkleIntensity);
        
        // Create new matrix with twinkling scale
        const matrix = baseMatrix.clone();
        const currentScale = new THREE.Vector3();
        matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), currentScale);
        
        const newScale = currentScale.clone().multiplyScalar(twinkle);
        matrix.scale(newScale.divide(currentScale));
        
        meshRef.current.setMatrixAt(i, matrix);
      }
      
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  // Initialize instance matrices
  useMemo(() => {
    if (meshRef.current) {
      matrices.forEach((matrix, i) => {
        meshRef.current.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [matrices]);
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, null, actualCount]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        transparent
        opacity={0.85}
      />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colors, 3]}
      />
    </instancedMesh>
  );
};

export default CinematicStarField;
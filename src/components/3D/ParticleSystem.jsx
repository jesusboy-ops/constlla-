/**
 * Particle System Component
 * 3D representation of transactions as animated particle trails
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mapTransactionToTrail } from '../../utils/mapBlockToStar.js';

const ParticleSystem = ({ transaction }) => {
  const pointsRef = useRef();
  const materialRef = useRef();
  
  // Map transaction to trail properties
  const trailData = mapTransactionToTrail(transaction);
  
  if (!trailData) return null;

  const { 
    startPosition, 
    endPosition, 
    thickness, 
    color, 
    intensity, 
    particleCount 
  } = trailData;

  // Generate particle positions along the trail
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1);
      
      // Interpolate position along the trail
      positions[i * 3] = startPosition[0] + (endPosition[0] - startPosition[0]) * t;
      positions[i * 3 + 1] = startPosition[1] + (endPosition[1] - startPosition[1]) * t;
      positions[i * 3 + 2] = startPosition[2] + (endPosition[2] - startPosition[2]) * t;
      
      // Set color with varying intensity
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
      
      // Varying particle sizes
      sizes[i] = thickness * (1 - t * 0.5); // Smaller towards the end
    }
    
    return { positions, colors, sizes };
  }, [startPosition, endPosition, particleCount, color, thickness]);

  // Animation
  useFrame((state) => {
    if (pointsRef.current && materialRef.current) {
      // Animate particle movement
      const time = state.clock.elapsedTime;
      const positions = pointsRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const t = (i / (particleCount - 1) + time * 2) % 1;
        
        positions[i * 3] = startPosition[0] + (endPosition[0] - startPosition[0]) * t;
        positions[i * 3 + 1] = startPosition[1] + (endPosition[1] - startPosition[1]) * t;
        positions[i * 3 + 2] = startPosition[2] + (endPosition[2] - startPosition[2]) * t;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Pulse opacity
      const pulse = Math.sin(time * 3) * 0.3 + 0.7;
      materialRef.current.opacity = intensity * pulse;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={2}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={intensity}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;
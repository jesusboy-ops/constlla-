/**
 * Modern Planet Component
 * Clean, high-quality 3D planet with proper lighting and subtle animations
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ModernPlanet = ({ 
  contract, 
  onClick, 
  position = [0, 0, 0],
  size = 2,
  emissiveColor = '#9B5CFF',
  rotationSpeed = 0.5
}) => {
  const meshRef = useRef();
  const groupRef = useRef();

  // Determine planet color based on contract properties
  const planetConfig = useMemo(() => {
    const functionCount = contract?.functions?.length || 0;
    const isVerified = contract?.isVerified || false;
    
    // Choose emissive color based on contract characteristics
    let color = emissiveColor;
    if (functionCount > 30) {
      color = '#FF4ECD'; // Magenta for complex contracts
    } else if (isVerified) {
      color = '#5EE7FF'; // Cyan for verified contracts
    } else if (functionCount > 15) {
      color = '#F5C77A'; // Gold for medium complexity
    }

    return {
      coreColor: '#1A1A2E', // Dark core
      emissiveColor: color,
      glowOpacity: 0.3,
      atmosphereOpacity: 0.15
    };
  }, [contract, emissiveColor]);

  // Subtle rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main Planet Sphere */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={planetConfig.coreColor}
          emissive={planetConfig.emissiveColor}
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Subtle Atmosphere Glow */}
      <mesh scale={size * 1.05}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={planetConfig.emissiveColor}
          transparent
          opacity={planetConfig.atmosphereOpacity}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Glow (very subtle) */}
      <mesh scale={size * 0.8}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={planetConfig.emissiveColor}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default ModernPlanet;


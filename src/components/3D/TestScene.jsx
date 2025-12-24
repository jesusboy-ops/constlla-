/**
 * Simple Test Scene
 * Basic 3D scene to test if Three.js is working
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TestScene = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Test Cube */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Test Spheres */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={`hsl(${i * 36}, 70%, 60%)`}
            emissive={`hsl(${i * 36}, 70%, 30%)`}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default TestScene;
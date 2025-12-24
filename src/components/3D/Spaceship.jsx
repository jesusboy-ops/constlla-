/**
 * Spaceship Component
 * Minimalist, abstract spaceship with emissive engine glow
 * Lightweight and performance-optimized
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Spaceship = ({ 
  position = [0, 0, 0], 
  velocity = [0, 0, 0],
  visible = true,
  enginePower = 0 
}) => {
  const groupRef = useRef();
  const engineRef = useRef();
  const trailRefs = useRef([]);
  
  // Shared geometries for performance
  const geometries = useMemo(() => ({
    hull: new THREE.ConeGeometry(0.8, 4, 6),
    engine: new THREE.SphereGeometry(0.3, 8, 6),
    wing: new THREE.BoxGeometry(2, 0.1, 1)
  }), []);
  
  // Shared materials for performance
  const materials = useMemo(() => ({
    hull: new THREE.MeshStandardMaterial({
      color: '#e0e0e0',
      metalness: 0.8,
      roughness: 0.2,
      emissive: '#001122',
      emissiveIntensity: 0.1
    }),
    engine: new THREE.MeshBasicMaterial({
      color: '#00aaff',
      transparent: true,
      opacity: 0.8
    }),
    engineGlow: new THREE.MeshBasicMaterial({
      color: '#0088ff',
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    }),
    wing: new THREE.MeshStandardMaterial({
      color: '#c0c0c0',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#000011',
      emissiveIntensity: 0.05
    }),
    trail: new THREE.MeshBasicMaterial({
      color: '#0066ff',
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
  }), []);
  
  // Animation and engine effects
  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;
    
    // Update position
    groupRef.current.position.set(...position);
    
    // Subtle ship movement based on velocity
    const speed = Math.sqrt(velocity[0]**2 + velocity[1]**2 + velocity[2]**2);
    const normalizedSpeed = Math.min(speed / 20, 1); // Normalize to 0-1
    
    // Engine glow intensity based on movement
    if (engineRef.current) {
      const baseIntensity = 0.3;
      const maxIntensity = 1.0;
      const intensity = baseIntensity + (normalizedSpeed * (maxIntensity - baseIntensity));
      
      engineRef.current.material.opacity = intensity;
      engineRef.current.scale.setScalar(0.8 + normalizedSpeed * 0.4);
    }
    
    // Subtle ship banking based on horizontal velocity
    const bankAngle = velocity[0] * 0.1;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z, 
      bankAngle, 
      delta * 3
    );
    
    // Engine trail effects
    trailRefs.current.forEach((trail, index) => {
      if (trail) {
        const trailIntensity = normalizedSpeed * (1 - index * 0.2);
        trail.material.opacity = Math.max(0, trailIntensity * 0.4);
        trail.position.z = 2 + index * 0.5;
        trail.scale.setScalar(0.5 + trailIntensity * 0.3);
      }
    });
    
    // Subtle idle animation
    const time = state.clock.elapsedTime;
    groupRef.current.position.y += Math.sin(time * 2) * 0.02;
    groupRef.current.rotation.y += Math.sin(time * 1.5) * 0.005;
  });
  
  if (!visible) return null;
  
  return (
    <group ref={groupRef}>
      {/* Main Hull - More abstract, light-based */}
      <mesh geometry={geometries.hull} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.9}
          roughness={0.1}
          emissive="#002244"
          emissiveIntensity={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Minimal Wing Struts */}
      <mesh 
        geometry={geometries.wing} 
        position={[0, 0, 1]}
        scale={[0.8, 0.05, 0.6]}
      >
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.95}
          roughness={0.05}
          emissive="#001133"
          emissiveIntensity={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Engine Core - Brighter, more prominent */}
      <mesh 
        geometry={geometries.engine} 
        material={materials.engine}
        position={[0, 0, 2.2]}
        scale={0.8}
      />
      
      {/* Engine Glow - Enhanced */}
      <mesh 
        ref={engineRef}
        geometry={geometries.engine} 
        material={materials.engineGlow}
        position={[0, 0, 2.2]}
        scale={1.5}
      />
      
      {/* Engine Trails - More ethereal */}
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(el) => trailRefs.current[index] = el}
          geometry={geometries.engine}
          position={[0, 0, 2.8 + index * 0.4]}
          scale={0.7 - index * 0.15}
        >
          <meshBasicMaterial
            color="#0088ff"
            transparent
            opacity={0.4 - index * 0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Subtle Navigation Lights - Smaller, more integrated */}
      <mesh position={[-0.6, 0, 0.5]} scale={0.06}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial 
          color="#ff3366" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      <mesh position={[0.6, 0, 0.5]} scale={0.06}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial 
          color="#33ff66" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default Spaceship;
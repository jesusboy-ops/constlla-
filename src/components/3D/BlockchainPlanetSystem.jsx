/**
 * Blockchain Planet System
 * Performance-optimized planet rendering with:
 * - Simple planet meshes for now (will add complexity gradually)
 * - Distance-based visibility culling
 * - Reused materials and geometries
 */

import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore } from '../../state/useCameraStore.js';
import { useAppStore } from '../../state/useAppStore.js';

// Performance constants
const MAX_VISIBLE_PLANETS = 8;
const LOD_DISTANCES = {
  HIGH: 50,    // Full detail
  MEDIUM: 150, // Reduced detail
  LOW: 300     // Minimal detail
};

// Reusable objects for performance
const tempVector = new THREE.Vector3();
const tempMatrix = new THREE.Matrix4();
const tempColor = new THREE.Color();

const BlockchainPlanetSystem = () => {
  // Simplified for initial testing
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  
  // Shared geometries and materials (performance optimization)
  const sharedGeometry = useMemo(() => ({
    planet: new THREE.SphereGeometry(1, 16, 12),
    moon: new THREE.SphereGeometry(0.1, 8, 6),
    ring: new THREE.RingGeometry(1.2, 1.25, 16)
  }), []);
  
  const sharedMaterials = useMemo(() => ({
    planet: new THREE.MeshStandardMaterial({
      color: '#ffcc99',
      emissive: '#331100',
      emissiveIntensity: 0.03,
      transparent: true,
      opacity: 0.8
    }),
    planetHover: new THREE.MeshStandardMaterial({
      color: '#ffaa77',
      emissive: '#442200', 
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.9
    }),
    moon: new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.6
    }),
    ring: new THREE.MeshBasicMaterial({
      color: '#ff8844',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    })
  }), []);
  
  // Generate blockchain planet data (performance: memoized)
  const planetData = useMemo(() => {
    const planets = [];
    
    // Generate fewer planets for better performance
    for (let i = 1; i <= 12; i++) {
      const blockNumber = 1000000 + i;
      const txCount = Math.floor(Math.random() * 500) + 50;
      const gasUsed = Math.random() * 8000000;
      
      planets.push({
        id: `block-${blockNumber}`,
        blockNumber,
        position: [
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 200, 
          (Math.random() - 0.5) * 400
        ],
        // Size based on transaction count
        size: Math.max(3, Math.min(8, txCount / 50)),
        // Color tint based on gas usage
        gasUsage: gasUsed,
        gasIntensity: Math.min(gasUsed / 8000000, 1),
        // Orbiting moons represent transactions (capped for performance)
        transactionCount: Math.min(txCount, 20),
        // Blockchain data
        hash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
        timestamp: Date.now() - (i * 15000),
        chain: 'ethereum',
        verified: Math.random() > 0.3
      });
    }
    
    return planets;
  }, []);
  
  // Simplified - just show first few planets
  const visiblePlanets = useMemo(() => {
    return planetData.slice(0, 5).map(planet => ({
      ...planet,
      lod: 'HIGH'
    }));
  }, [planetData]);
  
  return (
    <group>
      {visiblePlanets.map(planet => (
        <BlockchainPlanet
          key={planet.id}
          planet={planet}
          geometry={sharedGeometry}
          materials={sharedMaterials}
          isHovered={hoveredPlanet === planet.id}
          onHover={setHoveredPlanet}
        />
      ))}
    </group>
  );
};

/**
 * Individual Blockchain Planet Component
 * Represents a single block with transaction moons
 */
const BlockchainPlanet = ({ 
  planet, 
  geometry, 
  materials, 
  isHovered, 
  onHover
}) => {
  const groupRef = useRef();
  const planetRef = useRef();
  
  // Instanced moons for transactions (performance optimization)
  const moonInstances = useMemo(() => {
    const instances = [];
    const count = Math.min(planet.transactionCount, 15); // Cap for performance
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = planet.size * 1.5 + (i % 3) * 0.5;
      const height = (Math.random() - 0.5) * 2;
      
      instances.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        scale: 0.3 + Math.random() * 0.2,
        speed: 0.5 + Math.random() * 0.5
      });
    }
    
    return instances;
  }, [planet.transactionCount, planet.size]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.2;
      
      // Hover scale effect
      const targetScale = isHovered ? 1.1 : 1;
      planetRef.current.scale.lerp(tempVector.setScalar(targetScale), delta * 5);
    }
    
    // Simplified moon animation - will add back instancing later
    
    // Subtle group rotation for visual interest
    groupRef.current.rotation.y += delta * 0.05;
  });
  
  // Handle interactions - simplified for now
  const handleClick = () => {
    console.log('Planet clicked:', planet.blockNumber);
  };
  
  const handlePointerOver = () => {
    onHover(planet.id);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    onHover(null);
    document.body.style.cursor = 'default';
  };
  
  return (
    <group ref={groupRef} position={planet.position}>
      {/* Main Planet */}
      <mesh
        ref={planetRef}
        geometry={geometry.planet}
        material={isHovered ? materials.planetHover : materials.planet}
        scale={planet.size}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* Surface Glow (gas usage indicator) */}
      <mesh
        geometry={geometry.planet}
        scale={planet.size * 1.05}
      >
        <meshBasicMaterial
          color={tempColor.setHSL(0.1, 1, 0.5 + planet.gasIntensity * 0.3)}
          transparent
          opacity={planet.gasIntensity * 0.2 + (isHovered ? 0.1 : 0)}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Orbital Rings (verified blocks only) */}
      {planet.verified && planet.lod !== 'LOW' && (
        <mesh
          geometry={geometry.ring}
          material={materials.ring}
          scale={planet.size}
          rotation={[Math.PI / 2, 0, 0]}
        />
      )}
      
      {/* Transaction Moons (HIGH LOD only) - Simplified for now */}
      {planet.lod === 'HIGH' && moonInstances.slice(0, 5).map((moon, i) => (
        <mesh
          key={i}
          geometry={geometry.moon}
          material={materials.moon}
          position={moon.position}
          scale={moon.scale}
        />
      ))}
      
      {/* Hover HUD */}
      {isHovered && <PlanetHoverHUD planet={planet} />}
    </group>
  );
};

/**
 * Lightweight Hover HUD
 * Shows basic planet info on hover without blocking the screen
 */
const PlanetHoverHUD = ({ planet }) => {
  return (
    <group position={[0, planet.size + 2, 0]}>
      <mesh>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Text would be rendered via HTML overlay or Drei Text for performance */}
      {/* For now, just a simple indicator */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[7.5, 1.5]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

export default BlockchainPlanetSystem;
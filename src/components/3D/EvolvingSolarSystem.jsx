/**
 * Evolving Solar System
 * Performance-optimized planet system that spawns ahead and despawns behind
 * Each planet represents blockchain data with visual mapping
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useExplorationStore, EXPLORATION_MODES } from '../../state/useExplorationStore.js';

const EvolvingSolarSystem = () => {
  const { 
    mode, 
    activePlanets, 
    nearbyPlanets,
    scannerActive,
    scannerTarget 
  } = useExplorationStore();
  
  // Shared geometries and materials for performance
  const sharedResources = useMemo(() => ({
    geometry: {
      planet: new THREE.SphereGeometry(1, 24, 16),
      moon: new THREE.SphereGeometry(0.1, 8, 6),
      atmosphere: new THREE.SphereGeometry(1.1, 16, 12)
    },
    material: {
      planet: new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.1
      }),
      atmosphere: new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
      }),
      moon: new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.7
      })
    }
  }), []);
  
  if (mode !== EXPLORATION_MODES.EXPLORE) return null;
  
  return (
    <group>
      {Array.from(activePlanets.values()).map((planet) => (
        <BlockchainPlanet
          key={planet.id}
          planet={planet}
          resources={sharedResources}
          isNearby={nearbyPlanets.some(p => p.id === planet.id)}
          isScanning={scannerActive && scannerTarget?.id === planet.id}
        />
      ))}
      
      {/* Scanner Beam Effect */}
      {scannerActive && scannerTarget && (
        <ScannerBeam target={scannerTarget} />
      )}
    </group>
  );
};

/**
 * Individual Blockchain Planet
 * Represents a single block with transaction moons and visual effects
 */
const BlockchainPlanet = ({ planet, resources, isNearby, isScanning }) => {
  const groupRef = useRef();
  const planetRef = useRef();
  const atmosphereRef = useRef();
  const moonsRef = useRef([]);
  
  // Generate moons based on transaction count (capped for performance)
  const moons = useMemo(() => {
    const moonCount = Math.min(planet.transactions / 50, 8); // Max 8 moons
    const moonData = [];
    
    for (let i = 0; i < moonCount; i++) {
      const angle = (i / moonCount) * Math.PI * 2;
      const radius = planet.size * 2 + (i % 3) * 0.5;
      
      moonData.push({
        angle,
        radius,
        speed: 0.5 + Math.random() * 0.5,
        size: 0.1 + Math.random() * 0.1
      });
    }
    
    return moonData;
  }, [planet.transactions, planet.size]);
  
  // Animation and effects
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Position planet
    groupRef.current.position.set(...planet.position);
    
    // Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.3;
      planetRef.current.rotation.x += delta * 0.1;
      
      // Scale based on proximity
      const targetScale = isNearby ? planet.size * 1.1 : planet.size;
      planetRef.current.scale.lerp(
        { x: targetScale, y: targetScale, z: targetScale },
        delta * 3
      );
    }
    
    // Atmosphere pulsing
    if (atmosphereRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      atmosphereRef.current.scale.setScalar(pulse * (isNearby ? 1.2 : 1));
      
      // Increase glow when nearby
      atmosphereRef.current.material.opacity = isNearby ? 0.3 : 0.1;
    }
    
    // Moon orbits
    moons.forEach((moon, index) => {
      const moonMesh = moonsRef.current[index];
      if (moonMesh) {
        const time = state.clock.elapsedTime * moon.speed;
        const x = Math.cos(moon.angle + time) * moon.radius;
        const z = Math.sin(moon.angle + time) * moon.radius;
        const y = Math.sin(time * 2) * 0.5;
        
        moonMesh.position.set(x, y, z);
      }
    });
    
    // Scanning effect
    if (isScanning) {
      const scanPulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
      if (planetRef.current) {
        planetRef.current.material.emissiveIntensity = 0.3 + scanPulse * 0.2;
      }
    } else if (planetRef.current) {
      planetRef.current.material.emissiveIntensity = planet.gasIntensity * 0.1;
    }
    
    // Dissolution effect
    if (planet.dissolving && planetRef.current) {
      const dissolveProgress = (Date.now() - planet.scannedAt) / 2000;
      planetRef.current.material.opacity = Math.max(0, 1 - dissolveProgress);
      planetRef.current.scale.multiplyScalar(1 + dissolveProgress * 0.5);
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Main Planet */}
      <mesh 
        ref={planetRef}
        geometry={resources.geometry.planet}
        scale={planet.size}
      >
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={planet.gasIntensity * 0.1}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh 
        ref={atmosphereRef}
        geometry={resources.geometry.atmosphere}
        scale={planet.size}
      >
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Transaction Moons */}
      {moons.map((moon, index) => (
        <mesh
          key={index}
          ref={(el) => moonsRef.current[index] = el}
          geometry={resources.geometry.moon}
          material={resources.material.moon}
          scale={moon.size}
        />
      ))}
      
      {/* Proximity Notification */}
      {isNearby && !planet.scanned && (
        <Html position={[0, planet.size + 2, 0]} center>
          <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 backdrop-blur-md border border-blue-400/20 rounded-full px-4 py-2 text-blue-200 text-xs font-light tracking-wide animate-pulse shadow-lg">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-ping"></span>
            Blockchain data detected
          </div>
        </Html>
      )}
    </group>
  );
};

/**
 * Scanner Beam Effect
 * Gentle data extraction beam - not a weapon
 */
const ScannerBeam = ({ target }) => {
  const beamRef = useRef();
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (beamRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 6) * 0.3 + 0.7;
      beamRef.current.material.opacity = pulse * 0.4;
      
      // Gentle scanning wave effect
      const wave = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 0.9;
      beamRef.current.scale.x = wave;
      beamRef.current.scale.z = wave;
    }
    
    if (particlesRef.current) {
      // Data particle effect
      particlesRef.current.rotation.y += 0.02;
      const sparkle = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
      particlesRef.current.material.opacity = sparkle * 0.6;
    }
  });
  
  return (
    <group>
      {/* Main scanning beam */}
      <mesh
        ref={beamRef}
        position={[
          target.position[0] * 0.5,
          target.position[1] * 0.5,
          target.position[2] * 0.5
        ]}
        lookAt={target.position}
      >
        <cylinderGeometry args={[0.05, 0.3, 50, 12]} />
        <meshBasicMaterial
          color="#66ccff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Data extraction particles */}
      <mesh
        ref={particlesRef}
        position={target.position}
      >
        <sphereGeometry args={[target.size * 1.2, 16, 8]} />
        <meshBasicMaterial
          color="#88ddff"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          wireframe
        />
      </mesh>
    </group>
  );
};

export default EvolvingSolarSystem;
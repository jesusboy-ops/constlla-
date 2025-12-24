/**
 * High-Quality Planet Component
 * Immersive, alive planets with purple neon sci-fi aesthetic
 * Features: smooth geometry, emissive glow, atmosphere, organic movement
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HighQualityPlanet = ({ 
  planet,
  onHover = null,
  onClick = null
}) => {
  const planetGroupRef = useRef();
  const planetRef = useRef();
  const atmosphereRef = useRef();
  const glowRef = useRef();
  
  // High-quality geometries (64+ segments for smoothness)
  const geometries = useMemo(() => ({
    planet: new THREE.SphereGeometry(1, 64, 32),
    atmosphere: new THREE.SphereGeometry(1.1, 32, 16),
    glow: new THREE.SphereGeometry(1.3, 24, 12)
  }), []);
  
  // Purple neon sci-fi color palette
  const planetColors = useMemo(() => {
    const coreColors = [
      '#1a0d2e', // Deep purple
      '#16213e', // Dark blue-purple
      '#0f1419', // Almost black
      '#2d1b3d', // Dark magenta
      '#1e1a2e', // Dark slate purple
    ];
    
    const accentColors = [
      '#8b5cf6', // Bright purple
      '#a855f7', // Violet
      '#c084fc', // Light purple
      '#e879f9', // Magenta
      '#f0abfc', // Pink-purple
      '#06b6d4', // Cyan accent
      '#10b981', // Emerald accent
    ];
    
    return {
      core: coreColors[Math.floor(Math.random() * coreColors.length)],
      accent: accentColors[Math.floor(Math.random() * accentColors.length)]
    };
  }, []);
  
  // Organic movement parameters
  const movement = useMemo(() => ({
    rotationSpeed: 0.3 + Math.random() * 0.7, // 0.3-1.0
    wobbleSpeed: 0.1 + Math.random() * 0.3, // 0.1-0.4
    wobbleAmount: 0.02 + Math.random() * 0.03, // 0.02-0.05
    pulseSpeed: 0.5 + Math.random() * 1.0, // 0.5-1.5
    pulseAmount: 0.05 + Math.random() * 0.1, // 0.05-0.15
    phaseOffset: Math.random() * Math.PI * 2
  }), []);
  
  // Animate the planet
  useFrame((state, delta) => {
    if (!planetGroupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Asynchronous rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * movement.rotationSpeed;
      planetRef.current.rotation.x += delta * movement.rotationSpeed * 0.3;
    }
    
    // Subtle wobble for life
    const wobbleX = Math.sin(time * movement.wobbleSpeed + movement.phaseOffset) * movement.wobbleAmount;
    const wobbleY = Math.cos(time * movement.wobbleSpeed * 1.3 + movement.phaseOffset) * movement.wobbleAmount;
    const wobbleZ = Math.sin(time * movement.wobbleSpeed * 0.7 + movement.phaseOffset) * movement.wobbleAmount;
    
    planetGroupRef.current.rotation.x = wobbleX;
    planetGroupRef.current.rotation.z = wobbleZ;
    planetGroupRef.current.position.y = wobbleY * 0.5;
    
    // Breathing/pulsing effect
    const pulse = Math.sin(time * movement.pulseSpeed + movement.phaseOffset) * movement.pulseAmount + 1;
    if (planetRef.current) {
      planetRef.current.scale.setScalar(pulse);
    }
    
    // Atmosphere animation
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.2; // Counter-rotate atmosphere
      const atmPulse = Math.sin(time * 0.8 + movement.phaseOffset) * 0.1 + 0.9;
      atmosphereRef.current.scale.setScalar(atmPulse);
    }
    
    // Glow animation
    if (glowRef.current) {
      const glowPulse = Math.sin(time * 1.2 + movement.phaseOffset) * 0.3 + 0.7;
      glowRef.current.material.opacity = glowPulse * 0.4;
      glowRef.current.scale.setScalar(1 + glowPulse * 0.2);
    }
  });
  
  return (
    <group 
      ref={planetGroupRef}
      position={planet.position}
      onPointerEnter={() => onHover && onHover(planet)}
      onPointerLeave={() => onHover && onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(planet);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Main Planet - Dark core with subtle texture */}
      <mesh 
        ref={planetRef}
        geometry={geometries.planet}
        scale={planet.radius}
      >
        <meshStandardMaterial
          color={planetColors.core}
          emissive={planetColors.accent}
          emissiveIntensity={0.1}
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Atmosphere Layer */}
      <mesh 
        ref={atmosphereRef}
        geometry={geometries.atmosphere}
        scale={planet.radius}
      >
        <meshBasicMaterial
          color={planetColors.accent}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer Glow */}
      <mesh 
        ref={glowRef}
        geometry={geometries.glow}
        scale={planet.radius}
      >
        <meshBasicMaterial
          color={planetColors.accent}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Neon Ring Accents (for some planets) */}
      {planet.rings > 0 && (
        <NeonRings 
          planet={planet} 
          accentColor={planetColors.accent}
          phaseOffset={movement.phaseOffset}
        />
      )}
    </group>
  );
};

/**
 * Neon Ring System Component
 */
const NeonRings = ({ planet, accentColor, phaseOffset }) => {
  const ringsRef = useRef([]);
  
  useFrame((state, delta) => {
    ringsRef.current.forEach((ring, index) => {
      if (ring) {
        ring.rotation.z += delta * (0.5 + index * 0.2);
        
        // Pulsing ring opacity
        const time = state.clock.elapsedTime;
        const pulse = Math.sin(time * 2 + phaseOffset + index) * 0.3 + 0.7;
        ring.material.opacity = pulse * 0.6;
      }
    });
  });
  
  return (
    <>
      {Array.from({ length: planet.rings }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => ringsRef.current[i] = el}
          rotation={[Math.PI / 2 + i * 0.1, 0, 0]}
          scale={planet.radius}
        >
          <ringGeometry args={[1.4 + i * 0.2, 1.6 + i * 0.2, 32]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
};

export default HighQualityPlanet;
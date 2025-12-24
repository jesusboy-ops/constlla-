/**
 * Enhanced Meridian Planet - Dimmed Purple Neon Theme
 * Smooth, highly rounded planets with reduced brightness and subtle effects
 * Phase-controlled motion with proper visual balance
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MOTION_PHASES } from '../../state/useVisualizationStore.js';

const MeridianPlanet = ({ 
  radius = 5,
  onHover = null,
  onClick = null,
  planet = null,
  phase = MOTION_PHASES.NORMAL
}) => {
  const groupRef = useRef();
  const linesRef = useRef();
  const coreRef = useRef();
  const glowRef = useRef();
  const backlightRef = useRef();
  const atmosphereRef = useRef();
  
  // Static rotation parameters - NO randomness in useFrame
  const rotationParams = useMemo(() => ({
    baseSpeed: 0.01 + Math.random() * 0.015, // Slower rotation
    wobbleSpeed: 0.005 + Math.random() * 0.008, // Reduced wobble
    wobblePhase: Math.random() * Math.PI * 2,
    tiltPhase: Math.random() * Math.PI * 2,
    pulsePhase: Math.random() * Math.PI * 2
  }), []);
  
  // Ultra-high density meridian line geometry for perfectly circular planets
  const { linesGeometry, coreGeometry, glowGeometry, atmosphereGeometry } = useMemo(() => {
    const meridianCount = 32; // Reduced from 64 for better performance
    const pointsPerMeridian = 48; // Reduced from 96 for better performance
    
    // Meridian lines geometry
    const positions = [];
    const indices = [];
    
    for (let m = 0; m < meridianCount; m++) {
      const longitude = (m / meridianCount) * Math.PI * 2;
      
      // Create points from north pole to south pole with perfect spherical math
      for (let p = 0; p <= pointsPerMeridian; p++) {
        const latitude = (p / pointsPerMeridian) * Math.PI - Math.PI / 2;
        
        // Perfect spherical coordinates for circular appearance
        const x = radius * Math.cos(latitude) * Math.cos(longitude);
        const y = radius * Math.sin(latitude);
        const z = radius * Math.cos(latitude) * Math.sin(longitude);
        
        positions.push(x, y, z);
      }
      
      // Create line indices for this meridian
      const startIndex = m * (pointsPerMeridian + 1);
      for (let p = 0; p < pointsPerMeridian; p++) {
        indices.push(startIndex + p, startIndex + p + 1);
      }
    }
    
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setIndex(indices);
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Optimized sphere geometries for better performance
    const coreGeo = new THREE.SphereGeometry(radius * 0.95, 32, 24); // Reduced segments
    
    // Glow sphere geometry (optimized)
    const glowGeo = new THREE.SphereGeometry(radius * 1.08, 24, 18); // Reduced resolution
    
    // Atmosphere sphere geometry (optimized)
    const atmosphereGeo = new THREE.SphereGeometry(radius * 1.15, 20, 16); // Reduced resolution
    
    return { 
      linesGeometry: linesGeo, 
      coreGeometry: coreGeo,
      glowGeometry: glowGeo,
      atmosphereGeometry: atmosphereGeo
    };
  }, [radius]);
  
  // Phase-controlled animation system with reduced intensity
  useFrame((state, delta) => {
    // FROZEN phase: Stop all planet motion completely
    if (phase === MOTION_PHASES.FROZEN) {
      if (groupRef.current) {
        groupRef.current.rotation.set(0, 0, 0);
      }
      // Keep all effects solid and visible when frozen
      if (glowRef.current) {
        // Keep solid - no changes needed
      }
      if (backlightRef.current) {
        // Keep solid - no changes needed
      }
      if (atmosphereRef.current) {
        // Keep solid - no changes needed
      }
      if (linesRef.current) {
        // Keep solid - no changes needed
      }
      if (coreRef.current) {
        // Keep solid - no changes needed
      }
      return;
    }
    
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Phase-dependent motion parameters (reduced intensity)
      let rotationMultiplier, wobbleMultiplier;
      
      switch (phase) {
        case MOTION_PHASES.NORMAL:
          rotationMultiplier = 1.0;
          wobbleMultiplier = 0.5; // Reduced wobble
          break;
        case MOTION_PHASES.FROZEN:
          rotationMultiplier = 0.0; // No rotation when frozen
          wobbleMultiplier = 0.0; // No wobble when frozen
          break;
        default:
          rotationMultiplier = 1.0;
          wobbleMultiplier = 0.5;
      }
      
      // Smooth rotation on Y axis
      groupRef.current.rotation.y += delta * rotationParams.baseSpeed * rotationMultiplier;
      
      // Very subtle wobble for organic feel
      const wobbleTime = time * rotationParams.wobbleSpeed * wobbleMultiplier + rotationParams.wobblePhase;
      const tiltTime = time * rotationParams.wobbleSpeed * wobbleMultiplier * 0.7 + rotationParams.tiltPhase;
      
      const wobbleAmount = 0.01; // Consistent subtle wobble
      const tiltAmount = 0.008; // Consistent subtle tilt
      
      groupRef.current.rotation.x = Math.sin(wobbleTime) * wobbleAmount;
      groupRef.current.rotation.z = Math.cos(tiltTime) * tiltAmount;
    }
    
    // Simplified animation - no opacity changes, just rotation
    if (glowRef.current) {
      // No opacity changes - keep solid
    }
    
    // No backlight animation - keep solid
    if (backlightRef.current) {
      // No opacity changes - keep solid
    }
    
    // No atmospheric animation - keep solid
    if (atmosphereRef.current) {
      // No opacity changes - keep solid
    }
    
    // No line animation - keep solid
    if (linesRef.current) {
      // No opacity changes - keep solid
    }
    
    // No core animation - keep solid
    if (coreRef.current) {
      // No opacity changes - keep solid
    }
  });
  
  return (
    <group 
      onPointerDown={(e) => {
        e.stopPropagation();
        console.log('Planet clicked:', planet.planetName);
        onClick && onClick(planet);
      }}
    >
      <group ref={groupRef}>
        {/* Atmospheric Glow - Solid visible outermost layer */}
        <mesh ref={atmosphereRef} geometry={atmosphereGeometry}>
          <meshBasicMaterial
            color="#8b5cf6"
            transparent={false}
            opacity={1.0}
          />
        </mesh>
        
        {/* White Backlight - Solid visible inner glow */}
        <mesh ref={backlightRef} geometry={glowGeometry} scale={0.98}>
          <meshBasicMaterial
            color="#ffffff"
            transparent={false}
            opacity={1.0}
          />
        </mesh>
        
        {/* Core Sphere - Solid visible rounded base */}
        <mesh ref={coreRef} geometry={coreGeometry}>
          <meshBasicMaterial
            color="#1a0030"
            transparent={false}
            opacity={1.0}
          />
        </mesh>
        
        {/* Meridian Lines - Solid Purple Neon */}
        <lineSegments ref={linesRef} geometry={linesGeometry}>
          <lineBasicMaterial
            color="#7c3aed"
            transparent={false}
            opacity={1.0}
            linewidth={2.0}
          />
        </lineSegments>
        
        {/* Primary Glow - Solid purple sphere */}
        <mesh ref={glowRef} geometry={glowGeometry}>
          <meshBasicMaterial
            color="#8b5cf6"
            transparent={false}
            opacity={1.0}
          />
        </mesh>
      </group>
    </group>
  );
};

export default MeridianPlanet;
/**
 * Simple Purple Planet System - Instant Loading
 * Purple spheres with planet names and click functionality
 * No complex components - just basic Three.js primitives
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useVisualizationStore } from '../../state/useVisualizationStore.js';

const SimplePlanetSystem = () => {
  const { planets, setHoveredEntity, setSelectedEntity } = useVisualizationStore();
  
  console.log('SimplePlanetSystem: Rendering', planets.size, 'simple purple planets');
  
  if (planets.size === 0) {
    console.log('SimplePlanetSystem: No planets to render');
    return null;
  }
  
  // Debug: Log first planet data
  const firstPlanet = Array.from(planets.values())[0];
  if (firstPlanet) {
    console.log('SimplePlanetSystem: First planet data:', {
      id: firstPlanet.id,
      position: firstPlanet.position,
      planetName: firstPlanet.planetName,
      radius: firstPlanet.radius,
      color: firstPlanet.color
    });
  }
  
  return (
    <group>
      {Array.from(planets.values()).map((planet) => (
        <SimplePurplePlanet
          key={planet.id}
          planet={planet}
          onHover={setHoveredEntity}
          onClick={setSelectedEntity}
        />
      ))}
    </group>
  );
};

const SimplePurplePlanet = ({ planet, onHover, onClick }) => {
  const meshRef = useRef();
  const textGroupRef = useRef();
  
  // Simple rotation animation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += (planet.rotationSpeed || 0.5) * delta;
    }
    // Make text always face camera
    if (textGroupRef.current) {
      textGroupRef.current.lookAt(0, 0, 0);
    }
  });
  
  // Handle planet interaction
  const handleClick = (event) => {
    event.stopPropagation();
    console.log('SimplePurplePlanet: Clicked planet:', planet.planetName);
    onClick(planet);
  };
  
  const handlePointerOver = (event) => {
    event.stopPropagation();
    onHover(planet);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    onHover(null);
    document.body.style.cursor = 'default';
  };
  
  // Ensure we have valid position and radius
  const position = planet.position || [0, 0, 0];
  const radius = planet.radius || 10;
  const color = planet.color || '#8B5CF6';
  const planetName = planet.planetName || 'Unknown Planet';
  
  return (
    <group position={position}>
      {/* Simple Purple Planet Sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Purple glow effect */}
      <mesh>
        <sphereGeometry args={[radius * 1.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
        />
      </mesh>
      
      {/* Planet Name Text */}
      <group ref={textGroupRef} position={[0, radius + 15, 0]}>
        <Text
          fontSize={6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.5}
          outlineColor="#000000"
        >
          {planetName}
        </Text>
        
        {/* Click for Data text */}
        <Text
          position={[0, -8, 0]}
          fontSize={3}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.3}
          outlineColor="#000000"
        >
          Click for Data
        </Text>
      </group>
    </group>
  );
};

export default SimplePlanetSystem;
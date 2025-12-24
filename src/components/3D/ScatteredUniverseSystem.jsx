/**
 * Scattered Universe System - Fixed Planet Distribution with Smooth Motion
 * Planets have fixed positions but gentle floating motion for life-like feel
 * Optimized for performance with subtle animations
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';
import MeridianPlanet from './MeridianPlanet.jsx';
import SimplePlanetLabel from './PlanetNameLabel.jsx';

const ScatteredUniverseSystem = ({ 
  planets, 
  onHover, 
  onClick
}) => {
  const universeGroupRef = useRef();
  const { mode, phase } = useVisualizationStore();
  
  // Enhanced planets with motion parameters for smooth floating
  const enhancedPlanets = useMemo(() => {
    const planetsArray = Array.from(planets.values());
    
    console.log(`ScatteredUniverseSystem: Using ${planetsArray.length} planets with smooth floating motion`);
    
    // Add motion parameters to each planet
    return planetsArray.map((planet, index) => {
      if (index < 3) {
        console.log(`Enhanced planet ${index} (${planet.planetName}): position [${planet.position[0]}, ${planet.position[1]}, ${planet.position[2]}], radius: ${planet.radius}`);
      }
      
      return {
        ...planet,
        // Base position (never changes)
        basePosition: new THREE.Vector3(planet.position[0], planet.position[1], planet.position[2]),
        // Motion parameters for smooth floating
        motionParams: {
          floatSpeed: 0.3 + Math.random() * 0.4, // 0.3-0.7 speed variation
          floatAmplitude: 2 + Math.random() * 3, // 2-5 units floating range
          phaseOffset: Math.random() * Math.PI * 2, // Random starting phase
          driftSpeed: 0.1 + Math.random() * 0.2, // Slow horizontal drift
          driftRadius: 5 + Math.random() * 10 // 5-15 units drift range
        }
      };
    });
  }, [planets]);
  
  // Handle planet click - simple click-only interaction
  const handlePlanetClick = (planet) => {
    console.log('ScatteredUniverseSystem: Planet clicked:', planet.planetName);
    console.log('ScatteredUniverseSystem: onClick function:', onClick);
    
    if (onClick) {
      onClick(planet);
      console.log('ScatteredUniverseSystem: onClick called with planet:', planet);
    } else {
      console.log('ScatteredUniverseSystem: No onClick handler provided');
    }
  };
  
  // Smooth floating animation for all planets
  useFrame((state) => {
    if (mode !== VISUALIZATION_MODES.EXPLORE) return;
    
    const time = state.clock.elapsedTime;
    
    // Universe group stays at origin
    if (universeGroupRef.current) {
      universeGroupRef.current.position.set(0, 0, 0);
      universeGroupRef.current.rotation.set(0, 0, 0);
    }
  });
  
  return (
    <group ref={universeGroupRef}>
      {console.log(`ScatteredUniverseSystem: Rendering ${enhancedPlanets.length} planets with smooth floating motion`)}
      
      {enhancedPlanets
        .filter(planet => planet.visible !== false)
        .map((planet) => {
          const distance = Math.sqrt(planet.position[0]**2 + planet.position[1]**2 + planet.position[2]**2);
          
          return (
            <FloatingPlanet
              key={planet.id}
              planet={planet}
              onPlanetClick={handlePlanetClick}
              showLabel={distance < 2500}
            />
          );
        })}
    </group>
  );
};

// Floating Planet Component with Smooth Motion
const FloatingPlanet = ({ planet, onPlanetClick, showLabel }) => {
  const planetGroupRef = useRef();
  
  // Smooth floating animation
  useFrame((state) => {
    if (!planetGroupRef.current) return;
    
    const time = state.clock.elapsedTime;
    const { motionParams, basePosition } = planet;
    
    // Gentle vertical floating
    const floatY = Math.sin(time * motionParams.floatSpeed + motionParams.phaseOffset) * motionParams.floatAmplitude;
    
    // Subtle horizontal drift in a small circle
    const driftX = Math.cos(time * motionParams.driftSpeed + motionParams.phaseOffset) * motionParams.driftRadius;
    const driftZ = Math.sin(time * motionParams.driftSpeed + motionParams.phaseOffset * 1.3) * motionParams.driftRadius;
    
    // Apply smooth motion to planet position
    planetGroupRef.current.position.set(
      basePosition.x + driftX,
      basePosition.y + floatY,
      basePosition.z + driftZ
    );
  });
  
  return (
    <group ref={planetGroupRef}>
      {/* Planet with smooth motion */}
      <MeridianPlanet
        radius={planet.radius}
        onHover={null}
        onClick={onPlanetClick}
        planet={planet}
        phase={planet.phase}
      />
      
      {/* Label follows planet motion */}
      {showLabel && (
        <SimplePlanetLabel
          planetName={planet.planetName}
          position={[0, 0, 0]} // Relative to planet group
          planetRadius={planet.radius}
          onClick={() => onPlanetClick(planet)}
        />
      )}
    </group>
  );
};

export default ScatteredUniverseSystem;
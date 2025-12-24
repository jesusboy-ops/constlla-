/**
 * Immersive Universe Canvas - WASD Exploration Mode with 120 Planets
 * Landing page: Stars only with gentle camera drift
 * Explorer page: WASD controls for exploring 120 scattered planets
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUniverseStore } from '../../state/useUniverseStore.js';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';

// 3D Components
import CinematicCameraSystem from './CinematicCameraSystem.jsx';
import WASDCameraController from './WASDCameraController.jsx';
import OptimizedStarField from './OptimizedStarField.jsx';
import MassivePlanetSystem from './MassivePlanetSystem.jsx';


const ImmersiveUniverseCanvas = ({ responsive, onPlanetsUpdate, onCameraUpdate }) => {
  const { setSceneReady } = useUniverseStore();
  const { mode, planets, setSelectedEntity } = useVisualizationStore();
  
  // Initialize scene - fast setup
  useEffect(() => {
    console.log('ImmersiveUniverseCanvas: Setting scene ready');
    setSceneReady(true);
  }, [setSceneReady]);
  
  // Handle planet interactions
  const handlePlanetClick = (planet) => {
    console.log('Planet clicked in canvas:', planet?.planetName);
    // Set the selected entity to show in the data panel
    setSelectedEntity({
      ...planet,
      type: planet.systemType || 'Blockchain Node',
      name: planet.planetName,
      contractAddress: planet.hash, // Use block hash as address
      dailyTransactions: planet.transactions
    });
  };

  // Handle planets data update
  const handlePlanetsUpdate = (planetsData) => {
    if (onPlanetsUpdate) {
      onPlanetsUpdate(planetsData);
    }
  };
  
  console.log('ImmersiveUniverseCanvas: Rendering with mode:', mode, 'planets:', planets.size);
  
  return (
    <>
      {/* Professional lighting system */}
      <ambientLight intensity={0.15} color="#0f172a" />
      <directionalLight 
        position={[500, 300, 400]} 
        intensity={0.4} 
        color="#1e40af"
        castShadow={false}
      />
      <pointLight 
        position={[-300, 200, -200]} 
        intensity={0.3} 
        color="#3b82f6"
        distance={2000}
        decay={2}
      />
      <pointLight 
        position={[200, -150, 300]} 
        intensity={0.25} 
        color="#6366f1"
        distance={1500}
        decay={2}
      />
      
      {/* Professional starfield */}
      <OptimizedStarField 
        count={responsive.isMobile ? 1200 : 3000}
        radius={5000}
      />
      
      {/* Massive 120-planet system - only in Explorer mode */}
      {mode === VISUALIZATION_MODES.EXPLORE && (
        <MassivePlanetSystem 
          onPlanetHover={(planet) => {
            // Handle planet hover if needed
            if (planet) {
              console.log('Planet hovered:', planet?.planetName);
            }
          }}
          onPlanetClick={handlePlanetClick}
          onPlanetsUpdate={handlePlanetsUpdate}
        />
      )}
      
      {/* Camera controller */}
      {mode === VISUALIZATION_MODES.EXPLORE ? (
        <WASDCameraController onCameraUpdate={onCameraUpdate} />
      ) : (
        <CinematicCameraSystem />
      )}
    </>
  );
};

export default ImmersiveUniverseCanvas;
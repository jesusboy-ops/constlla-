/**
 * Data-Driven Universe
 * Premium cinematic space visualization with scattered meridian planets
 * Purple neon aesthetic with curved system-wide motion
 */

import { useVisualizationStore } from '../../state/useVisualizationStore.js';
import ScatteredUniverseSystem from './ScatteredUniverseSystem.jsx';

const DataDrivenUniverse = () => {
  const { 
    planets, 
    lodLevel,
    setHoveredEntity,
    setSelectedEntity
  } = useVisualizationStore();
  
  // Debug: Log planets data
  console.log('DataDrivenUniverse: Planets count:', planets.size);
  console.log('DataDrivenUniverse: Planets data:', Array.from(planets.values()).slice(0, 3));
  
  // Handle planet click - sets selected entity for ContextualDataPanel
  const handlePlanetClick = (planet) => {
    console.log('DataDrivenUniverse: handlePlanetClick called with:', planet);
    console.log('DataDrivenUniverse: Planet data:', {
      id: planet.id,
      planetName: planet.planetName,
      position: planet.position,
      type: planet.type
    });
    setSelectedEntity(planet);
    console.log('DataDrivenUniverse: setSelectedEntity called');
  };
  
  return (
    <group>
      {/* Scattered Universe System with Curved Motion */}
      <ScatteredUniverseSystem
        planets={planets}
        onHover={setHoveredEntity}
        onClick={handlePlanetClick}
        lodLevel={lodLevel}
      />
    </group>
  );
};

export default DataDrivenUniverse;
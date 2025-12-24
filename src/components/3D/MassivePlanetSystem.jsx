/**
 * Massive Planet System - 120 Professional Planets
 * Immersive technical visualization with scattered distribution
 */

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';

// Real planet names from our solar system and known exoplanets
const REAL_PLANET_NAMES = [
  // Our Solar System
  'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
  
  // Famous Exoplanets
  'Proxima Centauri b', 'Kepler-452b', 'TRAPPIST-1e', 'TRAPPIST-1f', 'TRAPPIST-1g',
  'Kepler-442b', 'Kepler-438b', 'Kepler-296e', 'Kepler-296f', 'Wolf 1061c',
  'Gliese 667C c', 'Gliese 667C f', 'HD 40307 g', 'Kepler-62e', 'Kepler-62f',
  'Kepler-186f', 'Kepler-283c', 'Kepler-296e', 'Kepler-440b', 'Kepler-438b',
  
  // More Exoplanets
  'K2-18b', 'TOI-715b', 'LHS 1140b', 'WASP-96b', 'HD 209458b', 'TrES-2b',
  'WASP-12b', 'WASP-17b', 'HAT-P-7b', 'CoRoT-7b', 'Gliese 581g', 'Gliese 581d',
  'HD 85512b', 'Kepler-22b', 'Kepler-69c', 'Kepler-452b', 'Kepler-1649c',
  
  // Additional Real Planets
  'Ross 128 b', 'Tau Ceti e', 'Tau Ceti f', 'YZ Ceti b', 'YZ Ceti c', 'YZ Ceti d',
  'EPIC 201367065 d', 'K2-3d', 'K2-72e', 'LP 890-9c', 'TOI-175b', 'TOI-270d',
  'GJ 357 d', 'GJ 180 d', 'GJ 273 b', 'GJ 625 b', 'GJ 832 c', 'GJ 876 d',
  
  // More Discovered Planets
  'HD 164595 b', 'HD 219134 b', 'HD 219134 c', 'Kapteyn b', 'Kapteyn c',
  'L 98-59 b', 'L 98-59 c', 'L 98-59 d', 'LTT 1445A b', 'Pi Mensae c',
  'TOI-849 b', 'TOI-1231 b', 'TOI-1452 b', 'TOI-2109 b', 'WASP-189b',
  
  // Final Set of Real Planets
  'AU Microscopii b', 'AU Microscopii c', 'BD+20 307 b', 'COCONUTS-2b',
  'GJ 1002 b', 'GJ 1002 c', 'GJ 3470 b', 'GJ 3929 b', 'HAT-P-11b',
  'HD 106906 b', 'HD 131399 Ab', 'HD 164595 b', 'HR 5183 b', 'K2-33b',
  'Kepler-1708 b', 'LP 791-18 d', 'Qatar-1b', 'TIC 172900988 b', 'WASP-178b',
  
  // Extended Real Planet Names
  'Barnard\'s Star b', 'Wolf 359 b', 'Lalande 21185 b', 'Sirius B b', 'Procyon b',
  'Altair b', 'Vega b', 'Arcturus b', 'Capella b', 'Rigel b', 'Betelgeuse b',
  'Aldebaran b', 'Antares b', 'Spica b', 'Pollux b', 'Regulus b', 'Canopus b'
];

const MassivePlanetSystem = ({ onPlanetHover, onPlanetClick, onPlanetsUpdate }) => {
  const groupRef = useRef();
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  // Generate 120 planets with enhanced distribution
  const planets = useMemo(() => {
    const planetData = [];
    
    for (let i = 1; i <= 120; i++) {
      const blockNumber = 1000000 + i;
      const txCount = Math.floor(Math.random() * 800) + 100;
      const gasUsed = Math.random() * 12000000;
      const value = Math.random() * 2000;
      
      // Enhanced 3D distribution - much larger space with better spacing
      const phi = Math.random() * Math.PI * 2; // Azimuth
      const theta = Math.random() * Math.PI; // Polar
      const radius = 500 + Math.random() * 2000; // Much larger distance for better spacing
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = (Math.random() - 0.5) * 1200; // Much larger vertical spread
      const z = radius * Math.sin(theta) * Math.sin(phi);
      
      planetData.push({
        id: `planet-${i}`,
        planetName: REAL_PLANET_NAMES[i - 1] || `Planet-${i}`,
        blockNumber,
        position: [x, y, z],
        size: 3 + Math.random() * 4, // Increased size: 3-7 units for better visibility
        color: '#C084FC', // Very bright purple color for all planets
        
        // Enhanced blockchain data
        hash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
        timestamp: Date.now() - (i * 12000),
        transactions: txCount,
        gasUsed: Math.floor(gasUsed),
        gasPrice: (15 + Math.random() * 80).toFixed(1),
        difficulty: (Math.random() * 5000000000000).toExponential(2),
        totalValue: value.toFixed(4),
        miner: `0x${Math.random().toString(16).substring(2, 42)}`,
        parentHash: `0x${(blockNumber - 1).toString(16).padStart(64, '0')}`,
        nonce: Math.floor(Math.random() * 2000000000),
        blockSize: (Math.random() * 80 + 20).toFixed(1),
        reward: (2.0 + Math.random() * 1.5).toFixed(4),
        
        // Enhanced motion properties
        rotationSpeed: 0.3 + Math.random() * 1.2,
        orbitSpeed: 0.05 + Math.random() * 0.2,
        orbitRadius: 30 + Math.random() * 80,
        
        // Technical properties
        securityLevel: Math.floor(Math.random() * 10) + 1,
        networkLatency: (Math.random() * 50 + 5).toFixed(1),
        uptime: (95 + Math.random() * 5).toFixed(2)
      });
    }
    
    return planetData;
  }, []);

  // Notify parent component about planets data
  useEffect(() => {
    if (onPlanetsUpdate) {
      onPlanetsUpdate(planets);
    }
  }, [planets, onPlanetsUpdate]);

  // Smooth universe rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.015;
      groupRef.current.rotation.x += delta * 0.005;
    }
  });

  const handlePlanetHover = (planet, isHovering) => {
    setHoveredPlanet(isHovering ? planet : null);
    onPlanetHover?.(isHovering ? planet : null);
  };

  const handlePlanetClick = (planet) => {
    console.log('Planet clicked:', planet.planetName);
    setSelectedPlanet(planet);
    onPlanetClick?.(planet);
  };

  const handleClosePanel = () => {
    setSelectedPlanet(null);
  };

  return (
    <group ref={groupRef}>
      {planets.map((planet) => (
        <TechnicalPlanet
          key={planet.id}
          planet={planet}
          isHovered={hoveredPlanet?.id === planet.id}
          isSelected={selectedPlanet?.id === planet.id}
          onHover={handlePlanetHover}
          onClick={handlePlanetClick}
          onClosePanel={handleClosePanel}
        />
      ))}
    </group>
  );
};

/**
 * Technical Planet Component with Professional Styling
 */
const TechnicalPlanet = ({ planet, isHovered, isSelected, onHover, onClick, onClosePanel }) => {
  const meshRef = useRef();
  const labelGroupRef = useRef();
  const { camera, size } = useThree();

  // Calculate smart panel position based on screen coordinates
  const getSmartPanelPosition = useCallback(() => {
    if (!meshRef.current) return [0, planet.size + 8, 0];

    try {
      // Get world position of planet
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);

      // Project to screen coordinates
      const screenPosition = worldPosition.clone().project(camera);
      
      // Convert to normalized device coordinates (-1 to 1)
      const x = screenPosition.x;
      const y = screenPosition.y;

      // Simple positioning logic
      let offsetX = 0;
      let offsetY = planet.size + 8;

      // Horizontal positioning - if too far right, move left
      if (x > 0.3) {
        offsetX = -50; // Move panel to the left
      } else if (x < -0.3) {
        offsetX = 50; // Move panel to the right
      }

      // Vertical positioning - if too high, move down
      if (y > 0.3) {
        offsetY = -(planet.size + 15); // Move panel below
      } else if (y < -0.3) {
        offsetY = planet.size + 20; // Move panel above
      }

      return [offsetX, offsetY, 0];
    } catch (error) {
      console.warn('Error calculating panel position:', error);
      return [0, planet.size + 8, 0]; // Fallback position
    }
  }, [camera, planet.size]);

  // Simple planet animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed;
      meshRef.current.rotation.x += delta * (planet.rotationSpeed * 0.2);
      
      // Subtle hover scaling
      const targetScale = isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale), 
        delta * 6
      );
    }
    
    // Label always faces camera
    if (labelGroupRef.current) {
      labelGroupRef.current.lookAt(state.camera.position);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(planet);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    onHover(planet, true);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    onHover(planet, false);
  };

  return (
    <group position={planet.position}>
      {/* Main Planet - Simple purple sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerDown={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        style={{ cursor: 'pointer' }}
      >
        <sphereGeometry args={[planet.size, 32, 24]} />
        <meshStandardMaterial
          color="#C084FC"
          emissive="#C084FC"
          emissiveIntensity={0.15}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Planet Labels - Optimally Positioned and Highly Visible */}
      <group ref={labelGroupRef}>
        {/* Planet Name - Large and Clear */}
        <Text
          position={[0, planet.size + 65, 0]} // Adjusted for larger planets
          fontSize={10.0}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={1.5}
          outlineColor="#000000"
          material-transparent={false}
          material-depthTest={false}
          material-depthWrite={false}
          material-renderOrder={1000}
          maxWidth={150}
          textAlign="center"
        >
          {planet.planetName}
        </Text>
        
        {/* Click for Data Button - Bright and Clickable */}
        <Text
          position={[0, planet.size + 45, 0]} // Adjusted for larger planets
          fontSize={6.0}
          color="#00FFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={1.0}
          outlineColor="#000000"
          material-transparent={false}
          material-depthTest={false}
          material-depthWrite={false}
          material-renderOrder={1000}
          maxWidth={120}
          textAlign="center"
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(planet);
          }}
        >
          ⭐ CLICK FOR DATA ⭐
        </Text>
      </group>
      
      {/* Data Panel when selected */}
      {isSelected && (
        <Html 
          position={getSmartPanelPosition()} 
          center
          style={{
            pointerEvents: 'auto',
            zIndex: 1000
          }}
        >
          <TechnicalDataPanel planet={planet} onClose={onClosePanel} />
        </Html>
      )}
    </group>
  );
};

/**
 * Professional Technical Data Panel
 */
const TechnicalDataPanel = ({ planet, onClose }) => {
  return (
    <div 
      className="bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-xl border border-cyan-400/40 rounded-2xl p-4 min-w-72 max-w-80 pointer-events-auto shadow-2xl"
      style={{
        boxShadow: '0 20px 60px rgba(0, 255, 136, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        animation: 'technicalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1000,
        // Ensure panel stays within viewport
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
          <span className="text-white font-bold text-lg tracking-wide">{planet.planetName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-purple-400 text-sm font-mono">
            PLANET
          </div>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 hover:border-red-400/60 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-200 group"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <span className="text-sm group-hover:scale-110 transition-transform duration-200">✕</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Technical Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Block Height</span>
          <div className="text-white font-mono text-lg">{planet.blockNumber.toLocaleString()}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Transactions</span>
          <div className="text-cyan-400 font-mono text-lg">{planet.transactions}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Gas Used</span>
          <div className="text-orange-400 font-mono">{(planet.gasUsed / 1000000).toFixed(2)}M</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Total Value</span>
          <div className="text-green-400 font-mono">{planet.totalValue} ETH</div>
        </div>
      </div>
      
      {/* System Status */}
      <div className="bg-slate-800/30 rounded-lg p-3 mb-4 border border-slate-700/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-xs uppercase tracking-wider">System Status</span>
          <span className="text-green-400 text-xs">OPERATIONAL</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Security:</span>
            <div className="text-white font-mono">Level {planet.securityLevel}</div>
          </div>
          <div>
            <span className="text-slate-500">Latency:</span>
            <div className="text-yellow-400 font-mono">{planet.networkLatency}ms</div>
          </div>
          <div>
            <span className="text-slate-500">Uptime:</span>
            <div className="text-green-400 font-mono">{planet.uptime}%</div>
          </div>
        </div>
      </div>
      
      {/* Hash Display */}
      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Block Hash</span>
        <div className="text-white font-mono text-xs break-all mt-1 opacity-80">
          {planet.hash}
        </div>
      </div>
      
      {/* Action Hint */}
      <div className="mt-4 text-center">
        <span className="text-purple-400 text-sm font-medium">
          🪐 Click planet for detailed data
        </span>
      </div>
    </div>
  );
};

export default MassivePlanetSystem;
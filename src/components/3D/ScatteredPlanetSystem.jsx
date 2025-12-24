/**
 * Scattered Planet System
 * 50 rounded planets with blockchain data, hover effects, and infinite motion
 */

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const ScatteredPlanetSystem = ({ onPlanetHover, onPlanetClick }) => {
  const groupRef = useRef();
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  // Generate 50 planets with blockchain data
  const planets = useMemo(() => {
    const planetData = [];
    
    for (let i = 1; i <= 50; i++) {
      const blockNumber = 1000000 + i;
      const txCount = Math.floor(Math.random() * 500) + 50;
      const gasUsed = Math.random() * 8000000;
      const value = Math.random() * 1000;
      
      planetData.push({
        id: `planet-${i}`,
        blockNumber,
        position: [
          (Math.random() - 0.5) * 800, // Wider spread
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 800
        ],
        size: 3 + Math.random() * 4, // Size 3-7
        color: `hsl(${30 + Math.random() * 60}, 70%, ${60 + Math.random() * 20}%)`, // Peach variations
        
        // Blockchain data
        hash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
        timestamp: Date.now() - (i * 15000),
        transactions: txCount,
        gasUsed: Math.floor(gasUsed),
        gasPrice: (20 + Math.random() * 50).toFixed(1),
        difficulty: (Math.random() * 1000000000000).toExponential(2),
        totalValue: value.toFixed(3),
        miner: `0x${Math.random().toString(16).substr(2, 40)}`,
        parentHash: `0x${(blockNumber - 1).toString(16).padStart(64, '0')}`,
        nonce: Math.floor(Math.random() * 1000000000),
        size: (Math.random() * 50 + 10).toFixed(1),
        reward: (2.5 + Math.random() * 0.5).toFixed(4),
        
        // Motion properties
        rotationSpeed: 0.5 + Math.random() * 1.5,
        orbitSpeed: 0.1 + Math.random() * 0.3,
        orbitRadius: 50 + Math.random() * 100
      });
    }
    
    return planetData;
  }, []);

  // Infinite motion animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow group rotation for universe feel
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const handlePlanetHover = (planet, isHovering) => {
    setHoveredPlanet(isHovering ? planet : null);
    onPlanetHover?.(isHovering ? planet : null);
  };

  const handlePlanetClick = (planet) => {
    onPlanetClick?.(planet);
  };

  return (
    <group ref={groupRef}>
      {planets.map((planet) => (
        <Planet
          key={planet.id}
          planet={planet}
          isHovered={hoveredPlanet?.id === planet.id}
          onHover={handlePlanetHover}
          onClick={handlePlanetClick}
        />
      ))}
    </group>
  );
};

/**
 * Individual Planet Component
 */
const Planet = ({ planet, isHovered, onHover, onClick }) => {
  const meshRef = useRef();
  const glowRef = useRef();

  // Planet animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Planet rotation
      meshRef.current.rotation.y += delta * planet.rotationSpeed;
      meshRef.current.rotation.x += delta * (planet.rotationSpeed * 0.3);
      
      // Hover scale effect
      const targetScale = isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        { x: targetScale, y: targetScale, z: targetScale }, 
        delta * 8
      );
    }
    
    if (glowRef.current) {
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse * (isHovered ? 1.3 : 1.1));
    }
  });

  // Mobile-friendly click handler
  const handleClick = (e) => {
    e.stopPropagation();
    console.log('Planet clicked (mobile-friendly):', planet.planetName || planet.id);
    onClick(planet);
  };

  // Mobile-friendly hover handlers (for desktop)
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
      {/* Main Planet */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerDown={handleClick} // Better for mobile
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        style={{ cursor: 'pointer' }}
      >
        <sphereGeometry args={[planet.size, 32, 24]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={isHovered ? 0.1 : 0.05}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Glow Effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[planet.size * 1.1, 16, 12]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={isHovered ? 0.3 : 0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Hover Data Block */}
      {isHovered && (
        <Html position={[0, planet.size + 3, 0]} center>
          <HoverDataBlock planet={planet} />
        </Html>
      )}
    </group>
  );
};

/**
 * Hover Data Block Component
 */
const HoverDataBlock = ({ planet }) => {
  return (
    <div 
      className="bg-black/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 min-w-64 pointer-events-none"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        animation: 'fadeInScale 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white font-bold">Block #{planet.blockNumber}</span>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-white/60">Transactions:</span>
          <div className="text-white font-mono">{planet.transactions}</div>
        </div>
        <div>
          <span className="text-white/60">Gas Used:</span>
          <div className="text-white font-mono">{(planet.gasUsed / 1000000).toFixed(1)}M</div>
        </div>
        <div>
          <span className="text-white/60">Value:</span>
          <div className="text-green-400 font-mono">{planet.totalValue} ETH</div>
        </div>
        <div>
          <span className="text-white/60">Gas Price:</span>
          <div className="text-blue-400 font-mono">{planet.gasPrice} gwei</div>
        </div>
      </div>
      
      {/* Hash */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <span className="text-white/60 text-xs">Hash:</span>
        <div className="text-white font-mono text-xs truncate">
          {planet.hash}
        </div>
      </div>
      
      {/* Click hint */}
      <div className="mt-2 text-center">
        <span className="text-blue-400 text-xs">Click for detailed analytics</span>
      </div>
    </div>
  );
};

export default ScatteredPlanetSystem;
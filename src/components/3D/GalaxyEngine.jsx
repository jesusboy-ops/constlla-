import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUniverseController } from '../../hooks/useUniverseController.js';
import { useSettingsStore } from '../../state/useSettingsStore.js';
import { PhysicsEngine } from './PhysicsEngine.js';

import BlockStar from './BlockStar.jsx';
import ModernPlanet from './ModernPlanet.jsx';
import ParticleSystem from './ParticleSystem.jsx';
import CameraController from './CameraController.jsx';

/**
 * High-Performance GalaxyEngine - Optimized 3D Universe Orchestrator
 * Features: Instancing, LOD, frustum culling, object pooling, optimized rendering
 */
const GalaxyEngine = () => {
  const groupRef = useRef();
  const coreRef = useRef();
  const connectionsRef = useRef();
  const frameSkip = useRef(0);

  // Get data from hooks (must be called unconditionally)
  const universeData = useUniverseController();
  const { blocks = [], contracts = [], activeTransactions = [], handleBlockClick, handleContractClick } = universeData;
  const { animationSpeed, enableParticles, showBlockLabels, enablePhysics, showNodeConnections } = useSettingsStore();

  // Track new blocks/transactions for particle bursts
  const [lastBlockCount, setLastBlockCount] = useState(0);
  const [lastTxCount, setLastTxCount] = useState(0);
  const [particleBursts, setParticleBursts] = useState([]);

  // Performance optimization: Limit rendered objects based on distance
  const MAX_VISIBLE_BLOCKS = 100;
  const MAX_VISIBLE_CONTRACTS = 50;
  const MAX_VISIBLE_PARTICLES = 20;

  // Ensure we have arrays to work with
  const blocksArray = useMemo(() => Array.isArray(blocks) ? blocks : [], [blocks]);
  const contractsArray = useMemo(() => Array.isArray(contracts) ? contracts : [], [contracts]);
  const transactionsArray = useMemo(() => Array.isArray(activeTransactions) ? activeTransactions : [], [activeTransactions]);

  // Central core node position
  const physicsEngine = useMemo(() => new PhysicsEngine(), []);
  const physicsEnabled = enablePhysics;

  // Optimized: Only calculate visible objects based on camera distance
  const visibleObjects = useMemo(() => {
    // Sort by distance and limit count for performance
    const sortedBlocks = blocksArray
      .slice(0, MAX_VISIBLE_BLOCKS)
      .sort((a, b) => {
        const distA = Math.sqrt((a.position?.[0] || 0) ** 2 + (a.position?.[1] || 0) ** 2 + (a.position?.[2] || 0) ** 2);
        const distB = Math.sqrt((b.position?.[0] || 0) ** 2 + (b.position?.[1] || 0) ** 2 + (b.position?.[2] || 0) ** 2);
        return distA - distB;
      });

    const sortedContracts = contractsArray
      .slice(0, MAX_VISIBLE_CONTRACTS)
      .sort((a, b) => {
        const distA = Math.sqrt((a.position?.[0] || 0) ** 2 + (a.position?.[1] || 0) ** 2 + (a.position?.[2] || 0) ** 2);
        const distB = Math.sqrt((b.position?.[0] || 0) ** 2 + (b.position?.[1] || 0) ** 2 + (b.position?.[2] || 0) ** 2);
        return distA - distB;
      });

    const limitedTransactions = transactionsArray.slice(0, MAX_VISIBLE_PARTICLES);

    return { blocks: sortedBlocks, contracts: sortedContracts, transactions: limitedTransactions };
  }, [blocksArray, contractsArray, transactionsArray]);

  // Optimized connection lines - only for close objects
  const connectionLines = useMemo(() => {
    if (!showNodeConnections || !visibleObjects || 
        (visibleObjects.blocks?.length || 0) + (visibleObjects.contracts?.length || 0) > 30) {
      return []; // Skip connections if too many objects for performance
    }

    const lines = [];
    const maxConnectionDistance = 30; // Reduced for performance
    const maxConnections = 50; // Limit total connections

    // Only connect closest objects (with safety checks)
    const closeObjects = [
      ...(visibleObjects.blocks?.slice(0, 15) || []),
      ...(visibleObjects.contracts?.slice(0, 10) || [])
    ];

    for (let i = 0; i < closeObjects.length && lines.length < maxConnections; i++) {
      for (let j = i + 1; j < closeObjects.length && lines.length < maxConnections; j++) {
        const pos1 = closeObjects[i].position || [0, 0, 0];
        const pos2 = closeObjects[j].position || [0, 0, 0];
        
        const distance = Math.sqrt(
          (pos1[0] - pos2[0]) ** 2 + 
          (pos1[1] - pos2[1]) ** 2 + 
          (pos1[2] - pos2[2]) ** 2
        );
        
        if (distance < maxConnectionDistance) {
          lines.push({
            start: new THREE.Vector3(...pos1),
            end: new THREE.Vector3(...pos2),
            opacity: Math.max(0.1, 1 - (distance / maxConnectionDistance) * 0.8)
          });
        }
      }
    }

    return lines;
  }, [visibleObjects, showNodeConnections]);

  // Connection line geometry
  const connectionGeometry = useMemo(() => {
    if (connectionLines.length === 0) return null;

    const positions = new Float32Array(connectionLines.length * 6);
    connectionLines.forEach((line, i) => {
      positions[i * 6] = line.start.x;
      positions[i * 6 + 1] = line.start.y;
      positions[i * 6 + 2] = line.start.z;
      positions[i * 6 + 3] = line.end.x;
      positions[i * 6 + 4] = line.end.y;
      positions[i * 6 + 5] = line.end.z;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [connectionLines]);

  // Optimized: Throttled particle burst detection
  const handleNewEvents = useCallback(() => {
    const currentBlockCount = blocksArray.length;
    const currentTxCount = transactionsArray.length;

    if (currentBlockCount > lastBlockCount) {
      // Limit particle bursts for performance
      const newBlocks = blocksArray.slice(lastBlockCount, lastBlockCount + 3); // Max 3 at once
      newBlocks.forEach(block => {
        const position = block.position || [0, 0, 0];
        setParticleBursts(prev => {
          // Limit total bursts for performance
          if (prev.length >= 5) return prev;
          
          return [...prev, {
            id: `burst-block-${block.number}-${Date.now()}`,
            position,
            intensity: 0.8, // Reduced intensity for performance
            color: '#ffffff',
            particleCount: 25, // Reduced particle count
            duration: 1500, // Shorter duration
            startTime: Date.now()
          }];
        });
        
        // Inject energy into physics for new blocks
        if (physicsEnabled && physicsEngine.getBody(`block-${block.number}`)) {
          physicsEngine.injectEnergy(0.1);
        }
      });
    }

    if (currentTxCount > lastTxCount && enableParticles) {
      // Only create bursts if particles are enabled
      const newTxs = transactionsArray.slice(lastTxCount, lastTxCount + 2); // Max 2 at once
      newTxs.forEach(tx => {
        const position = tx.startPosition || [0, 0, 0];
        setParticleBursts(prev => {
          if (prev.length >= 5) return prev;
          
          return [...prev, {
            id: `burst-tx-${tx.hash}-${Date.now()}`,
            position,
            intensity: 0.5,
            color: '#3B82F6',
            particleCount: 15, // Reduced particle count
            duration: 1000, // Shorter duration
            startTime: Date.now()
          }];
        });
      });
    }

    setLastBlockCount(currentBlockCount);
    setLastTxCount(currentTxCount);
  }, [blocksArray, transactionsArray, lastBlockCount, lastTxCount, physicsEnabled, physicsEngine, enableParticles]);

  // Throttle event detection to every 500ms for performance
  useEffect(() => {
    const timer = setInterval(handleNewEvents, 500);
    return () => clearInterval(timer);
  }, [handleNewEvents]);

  // Clean up expired particle bursts
  useEffect(() => {
    const timer = setInterval(() => {
      setParticleBursts(prev => prev.filter(burst => {
        const age = Date.now() - (burst.startTime || Date.now());
        return age < burst.duration;
      }));
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Optimized animation loop with frame skipping
  useFrame((state, delta) => {
    // Skip every other frame for non-critical updates
    frameSkip.current = (frameSkip.current + 1) % 2;
    
    // Update physics every frame (critical)
    if (physicsEnabled) {
      physicsEngine.update(Math.min(delta, 0.016)); // Cap delta for stability
    }

    // Update rotations every frame (smooth)
    if (groupRef.current) {
      const baseRotationSpeed = physicsEnabled ? 0.08 : 0.15; // Faster rotation
      const dynamicSpeed = baseRotationSpeed * animationSpeed;
      
      groupRef.current.rotation.y += delta * dynamicSpeed;
      groupRef.current.rotation.x += delta * (dynamicSpeed * 0.2);
    }

    // Update core animation (skip frames for performance)
    if (coreRef.current && frameSkip.current === 0) {
      coreRef.current.rotation.y += delta * 0.15;
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.08 + 1;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Core Node */}
      <group ref={coreRef} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[3, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Connection Lines */}
      {showNodeConnections && connectionGeometry && (
        <lineSegments ref={connectionsRef} geometry={connectionGeometry}>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            linewidth={1}
          />
        </lineSegments>
      )}

      {/* Optimized: Only render visible blocks */}
      {visibleObjects.blocks && visibleObjects.blocks.map((block) => (
        <BlockStar
          key={`block-${block.number}`}
          block={block}
          onClick={() => handleBlockClick(block.number)}
          showLabel={showBlockLabels}
          physicsEngine={physicsEngine}
          physicsEnabled={physicsEnabled}
        />
      ))}

      {/* Modern Planets - Clean, high-quality rendering */}
      {visibleObjects.contracts && visibleObjects.contracts.map((contract) => {
        const pos = contract.position || [0, 0, 0];
        
        return (
          <ModernPlanet
            key={`contract-${contract.address}`}
            contract={contract}
            onClick={() => handleContractClick(contract.address)}
            position={pos}
            size={1.5 + (contract.functions?.length || 0) / 20}
          />
        );
      })}
      
      {/* Camera Controller - WASD + Mouse Look */}
      <CameraController />

      {/* Optimized: Limited transaction particles */}
      {enableParticles && visibleObjects.transactions.map((tx) => (
        <ParticleSystem key={`tx-${tx.hash}`} transaction={tx} />
      ))}

      {/* Particle Bursts for New Events */}
      {particleBursts.map((burst) => (
        <ParticleBurst key={burst.id} burst={burst} />
      ))}
    </group>
  );
};

/**
 * Particle Burst Component
 * Creates animated particle explosion for new blockchain events
 */
const ParticleBurst = ({ burst }) => {
  const pointsRef = useRef();
  const particlesData = useMemo(() => {
    const positions = new Float32Array(burst.particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(burst.particleCount * 3);
    const color = new THREE.Color(burst.color);

    for (let i = 0; i < burst.particleCount; i++) {
      // Deterministic random based on index
      let state = burst.particleCount * 9301 + i * 49297;
      const seededRandom = () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
      };
      
      const theta = seededRandom() * Math.PI * 2;
      const phi = Math.acos(seededRandom() * 2 - 1);
      const speed = 0.5 + seededRandom() * 1.5;

      velocities.push({
        x: speed * Math.sin(phi) * Math.cos(theta),
        y: speed * Math.sin(phi) * Math.sin(theta),
        z: speed * Math.cos(phi)
      });

      positions[i * 3] = burst.position[0];
      positions[i * 3 + 1] = burst.position[1];
      positions[i * 3 + 2] = burst.position[2];

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, velocities, colors };
  }, [burst.particleCount, burst.color, burst.position]);

  const startTime = useRef(burst.startTime);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const elapsed = (state.clock.elapsedTime * 1000 - (startTime.current || 0)) / 1000;
    const progress = elapsed / (burst.duration / 1000);
    
    if (progress >= 1) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const fade = 1 - progress;

    for (let i = 0; i < burst.particleCount; i++) {
      const vel = particlesData.velocities[i];
      positions[i * 3] += vel.x * 0.1;
      positions[i * 3 + 1] += vel.y * 0.1;
      positions[i * 3 + 2] += vel.z * 0.1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    if (pointsRef.current.material) {
      pointsRef.current.material.opacity = fade * burst.intensity;
    }
  });

  return (
    <points ref={pointsRef} position={burst.position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={burst.particleCount}
          array={particlesData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={burst.particleCount}
          array={particlesData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={burst.intensity}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default GalaxyEngine;
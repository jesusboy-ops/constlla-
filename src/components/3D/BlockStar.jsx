/**
 * Enhanced Block Star Component with Validator Integration
 * 3D representation with validator info, staking data, and performance metrics
 */

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { mapBlockToStar } from '../../utils/mapBlockToStar.js';
import { formatNumber, formatTimeAgo } from '../../utils/formatters.js';
import { useValidators } from '../../hooks/useValidators.js';

const BlockStar = ({ block, onClick, showLabel = true, physicsEngine, physicsEnabled = true, lodLevel = 'high' }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const coronaRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Get validator information for this block (with error handling)
  const { getValidator } = useValidators();
  const validator = useMemo(() => {
    try {
      // Simulate validator assignment for blocks
      const validatorAddress = `validator${(block.number % 297).toString().padStart(3, '0')}`;
      return getValidator ? getValidator(validatorAddress) : null;
    } catch (error) {
      console.warn('Error getting validator for block:', error);
      return null;
    }
  }, [block.number, getValidator]);
  
  // Map block data to visual properties
  const starData = mapBlockToStar(block);
  
  if (!starData) return null;

  const { position, size, brightness, color, glowIntensity, pulseSpeed } = starData;
  
  // Physics body reference
  const physicsBodyRef = useRef(null);
  const currentPosition = useRef(new THREE.Vector3(...position));
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  // LOD-based geometry detail
  const geometryDetail = useMemo(() => {
    switch (lodLevel) {
      case 'low': return 8;
      case 'medium': return 16;
      case 'high': return 32;
      default: return 32;
    }
  }, [lodLevel]);

  // Enhanced materials with validator status indicators
  const starMaterial = useMemo(() => {
    // Modify color based on validator status
    let finalColor = color;
    let emissiveIntensity = brightness;
    
    if (validator) {
      switch (validator.status) {
        case 'active':
          finalColor = '#10B981'; // Green for active validators
          emissiveIntensity = brightness * 1.2;
          break;
        case 'inactive':
          finalColor = '#F59E0B'; // Yellow for inactive
          emissiveIntensity = brightness * 0.8;
          break;
        case 'slashed':
          finalColor = '#EF4444'; // Red for slashed
          emissiveIntensity = brightness * 0.6;
          break;
        default:
          finalColor = color;
      }
    }
    
    return new THREE.MeshStandardMaterial({
      color: finalColor,
      emissive: finalColor,
      emissiveIntensity: emissiveIntensity,
      transparent: true,
      opacity: 0.9,
    });
  }, [color, brightness, validator]);

  const glowMaterial = useMemo(() => {
    let glowColor = color;
    if (validator) {
      switch (validator.status) {
        case 'active': glowColor = '#10B981'; break;
        case 'inactive': glowColor = '#F59E0B'; break;
        case 'slashed': glowColor = '#EF4444'; break;
      }
    }
    
    return new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
  }, [color, validator]);

  const coronaMaterial = useMemo(() => {
    let coronaColor = color;
    if (validator) {
      switch (validator.status) {
        case 'active': coronaColor = '#10B981'; break;
        case 'inactive': coronaColor = '#F59E0B'; break;
        case 'slashed': coronaColor = '#EF4444'; break;
      }
    }
    
    return new THREE.MeshBasicMaterial({
      color: coronaColor,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
  }, [color, validator]);

  // Create particle corona for high-activity blocks
  const particleCorona = useMemo(() => {
    if (block.transactionCount < 10) return null;
    
    const particleCount = Math.min(block.transactionCount * 2, 200);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere around the star
      const radius = size * (2 + Math.random() * 2);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    return { positions, colors, sizes, count: particleCount };
  }, [block.transactionCount, size, color]);

  // Initialize physics body
  useEffect(() => {
    if (physicsEngine && physicsEnabled) {
      const mass = Math.max(0.5, size * 2); // Mass based on block size
      physicsBodyRef.current = physicsEngine.addBody(`block-${block.number}`, position, mass);
      
      // Inject energy for new blocks
      if (block.timestamp && Date.now() / 1000 - block.timestamp < 60) {
        physicsBodyRef.current.injectEnergy(0.3);
      }
    }
    
    return () => {
      if (physicsEngine && physicsBodyRef.current) {
        physicsEngine.removeBody(`block-${block.number}`);
      }
    };
  }, [physicsEngine, physicsEnabled, block.number, position, size, block.timestamp]);

  // Animation loop with physics integration
  useFrame((state, delta) => {
    // Update physics position
    if (physicsEngine && physicsBodyRef.current && groupRef.current) {
      const physicsPos = physicsBodyRef.current.position;
      currentPosition.current.lerp(physicsPos, 0.1); // Smooth interpolation
      groupRef.current.position.copy(currentPosition.current);
    }

    // Smooth scale animation for hover effect
    targetScale.current = hovered ? 1.3 : 1;
    currentScale.current += (targetScale.current - currentScale.current) * 0.1;

    if (meshRef.current) {
      // Enhanced pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.4 + 0.6;
      meshRef.current.material.emissiveIntensity = glowIntensity * pulse;
      
      // Gentle rotation with slight wobble
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
      meshRef.current.rotation.z += 0.003;
      
      // Apply smooth scale
      meshRef.current.scale.setScalar(currentScale.current);
    }

    // Animate glow layers
    if (glowRef.current) {
      const glowPulse = Math.sin(state.clock.elapsedTime * pulseSpeed * 0.8) * 0.2 + 0.3;
      glowRef.current.material.opacity = glowPulse;
      glowRef.current.rotation.x -= 0.002;
      glowRef.current.rotation.y += 0.003;
      glowRef.current.scale.setScalar(currentScale.current);
    }

    if (coronaRef.current) {
      const coronaPulse = Math.sin(state.clock.elapsedTime * pulseSpeed * 0.5) * 0.05 + 0.1;
      coronaRef.current.material.opacity = coronaPulse;
      coronaRef.current.rotation.x += 0.001;
      coronaRef.current.rotation.y -= 0.002;
      coronaRef.current.scale.setScalar(currentScale.current);
    }
  });

  return (
    <group ref={groupRef} position={physicsEnabled ? [0, 0, 0] : position}>
      {/* Particle Corona for high-activity blocks */}
      {particleCorona && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCorona.count}
              array={particleCorona.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particleCorona.count}
              array={particleCorona.colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={particleCorona.count}
              array={particleCorona.sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            sizeAttenuation={true}
            vertexColors={true}
            transparent={true}
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Main Star Core - LOD optimized */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        material={starMaterial}
      >
        <sphereGeometry args={[size, geometryDetail, geometryDetail]} />
      </mesh>

      {/* Inner Glow - Only for high LOD */}
      {lodLevel === 'high' && (
        <mesh ref={glowRef} material={glowMaterial}>
          <sphereGeometry args={[size * 1.3, 8, 8]} />
        </mesh>
      )}

      {/* Outer Corona - Only for high LOD */}
      {lodLevel === 'high' && (
        <mesh ref={coronaRef} material={coronaMaterial}>
          <sphereGeometry args={[size * 2, 8, 8]} />
        </mesh>
      )}

      {/* Enhanced Labels */}
      {showLabel && (hovered || block.number % 5 === 0) && (
        <Text
          position={[0, size + 3, 0]}
          fontSize={1.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="black"
        >
          {`Block #${formatNumber(block.number)}`}
        </Text>
      )}

      {/* Detailed Info on Hover */}
      {hovered && (
        <group position={[0, size + 5, 0]}>
          <Text
            fontSize={1}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="black"
          >
            {`${formatNumber(block.transactionCount)} Transactions`}
          </Text>
          <Text
            position={[0, -1.8, 0]}
            fontSize={0.7}
            color="rgba(255,255,255,0.8)"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="black"
          >
            {formatTimeAgo(block.timestamp)}
          </Text>
          <Text
            position={[0, -3.2, 0]}
            fontSize={0.6}
            color="rgba(255,255,255,0.6)"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {`Gas: ${((parseFloat(block.gasUsed) / parseFloat(block.gasLimit)) * 100).toFixed(1)}%`}
          </Text>
        </group>
      )}

      {/* Lens flare effect for bright stars */}
      {brightness > 0.7 && (
        <mesh>
          <sphereGeometry args={[size * 3, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.02}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

export default BlockStar;
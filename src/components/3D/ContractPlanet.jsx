import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Enhanced ContractPlanet Component
 * Renders a stunning, highly detailed cosmic planet with multiple visual effects
 */
const ContractPlanet = ({ contract, onClick, physicsEngine, physicsEnabled }) => {
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const glowRef = useRef();
  const ringsRef = useRef([]);
  const [hovered, setHovered] = useState(false);

  // Planet size based on contract data
  const planetSize = useMemo(() => {
    const baseSize = 3;
    const scaleFactor = Math.min(6, Math.max(2, (contract.transactionCount || 100) / 1000));
    return baseSize * scaleFactor;
  }, [contract.transactionCount]);

  // Procedural planet surface texture
  const surfaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // White base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    // Add procedural clouds and patterns
    for (let i = 0; i < 20; i++) {
      const x = Math.sin(i * 0.5) * 256 + 256;
      const y = Math.cos(i * 0.3) * 256 + 256;
      const size = Math.sin(i * 0.7) * 100 + 150;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add cyan glow streaks
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 - i * 0.03})`;
      ctx.lineWidth = 20 - i * 3;
      ctx.beginPath();
      ctx.arc(256, 256, 150 + i * 40, i * 0.5, i * 0.5 + Math.PI / 2);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Ring count and style
  const ringCount = useMemo(() => {
    const hash = contract.address || '';
    return 1 + (hash.charCodeAt(0) % 3);
  }, [contract.address]);

  // Ring rotations (deterministic based on contract address)
  const ringRotations = useMemo(() => {
    const hash = contract.address || '';
    const rotations = [];
    for (let i = 0; i < 3; i++) {
      const seed = hash.charCodeAt(i % hash.length) + hash.charCodeAt((i + 1) % hash.length);
      rotations.push({
        x: Math.PI / (4 + i * 0.5),
        y: (seed / 256) * Math.PI,
        z: 0
      });
    }
    return rotations;
  }, [contract.address]);

  // Physics setup
  useMemo(() => {
    if (physicsEnabled && physicsEngine) {
      const position = contract.position || [0, 0, 0];
      physicsEngine.addBody(`contract-${contract.address}`, {
        position: new THREE.Vector3(...position),
        mass: planetSize * 10,
        radius: planetSize,
        type: 'planet'
      });
    }
  }, [contract, physicsEngine, physicsEnabled, planetSize]);

  // Animation loop - Advanced rotation, pulsing, and effects
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.z += delta * 0.05;

      // Hover scale animation
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Subtle bobbing motion
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * delta * 0.5;
    }

    if (atmosphereRef.current) {
      // Counter-rotate atmosphere
      atmosphereRef.current.rotation.y -= delta * 0.1;
      
      // Pulse effect
      const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 + 1.15;
      atmosphereRef.current.scale.setScalar(pulse);
    }

    if (glowRef.current) {
      // Glow pulse animation
      const glowPulse = Math.sin(state.clock.elapsedTime * 1.2) * 0.3 + 0.8;
      glowRef.current.material.opacity = glowPulse * (hovered ? 0.6 : 0.3);
    }

    // Animate rings
    ringsRef.current.forEach((ring, index) => {
      if (ring) {
        ring.rotation.z += delta * (0.3 + index * 0.2);
        ring.rotation.x += delta * 0.05;
      }
    });

    // Update physics
    if (physicsEnabled && physicsEngine) {
      const position = contract.position || [0, 0, 0];
      physicsEngine.updateBody(`contract-${contract.address}`, new THREE.Vector3(...position));
    }
  });

  const handleHover = (hovering) => {
    setHovered(hovering);
    document.body.style.cursor = hovering ? 'pointer' : 'default';
  };

  return (
    <group position={contract.position}>
      {/* Main planet */}
      <mesh 
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => handleHover(true)}
        onPointerOut={() => handleHover(false)}
        scale={planetSize}
      >
        <icosahedronGeometry args={[1, 5]} />
        <meshStandardMaterial
          map={surfaceTexture}
          emissive="#00ffff"
          emissiveIntensity={hovered ? 0.5 : 0.15}
          metalness={0.3}
          roughness={0.6}
          flatShading={false}
        />
      </mesh>

      {/* Glowing atmosphere */}
      <mesh ref={glowRef} scale={planetSize}>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer atmosphere haze */}
      <mesh scale={planetSize}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          fog={false}
        />
      </mesh>

      {/* Core glow point light */}
      <pointLight
        color="#00ffff"
        intensity={hovered ? 3 : 1.5}
        distance={200}
        decay={2}
      />

      {/* Orbital rings */}
      {Array.from({ length: ringCount }).map((_, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) ringsRef.current[index] = el;
          }}
          rotation={[
            ringRotations[index]?.x || Math.PI / (4 + index * 0.5),
            ringRotations[index]?.y || 0,
            ringRotations[index]?.z || 0
          ]}
          scale={planetSize}
        >
          <ringGeometry 
            args={[
              1.4 + index * 0.3,
              1.8 + index * 0.35,
              128,
              16
            ]}
          />
          <meshBasicMaterial
            color={index === 0 ? '#00ffff' : index === 1 ? '#00ff88' : '#7c3aed'}
            transparent
            opacity={0.6 - index * 0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Ring edge glow */}
      {Array.from({ length: ringCount }).map((_, index) => (
        <mesh
          key={`glow-${index}`}
          rotation={[
            ringRotations[index]?.x || Math.PI / (4 + index * 0.5),
            ringRotations[index]?.y || 0,
            ringRotations[index]?.z || 0
          ]}
          scale={planetSize}
        >
          <ringGeometry 
            args={[
              1.75 + index * 0.325,
              1.85 + index * 0.365,
              128,
              8
            ]}
          />
          <meshBasicMaterial
            color={index === 0 ? '#00ffff' : index === 1 ? '#00ff88' : '#7c3aed'}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            wireframe={hovered}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ContractPlanet;
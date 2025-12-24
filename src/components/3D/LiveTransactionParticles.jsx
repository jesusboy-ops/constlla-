/**
 * Live Transaction Particles
 * Real-time animated particles representing blockchain transactions
 * Particles burst and flow based on live transaction data
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRealtimeBlockchain } from '../../hooks/useRealtimeBlockchain.js';

const LiveTransactionParticles = ({ enabled = true }) => {
  const particlesRef = useRef();
  const { getTransactionAnimations, isConnected } = useRealtimeBlockchain();
  
  // Particle system configuration - Reduced for better performance
  const particleCount = 500; // Reduced from 2000 to 500
  const particleSystem = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);
    const ages = new Float32Array(particleCount);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random starting positions in sphere
      const radius = Math.random() * 1000 + 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 20;
      velocities[i3 + 1] = (Math.random() - 0.5) * 20;
      velocities[i3 + 2] = (Math.random() - 0.5) * 20;
      
      // Default colors (blue)
      colors[i3] = 0.4;     // R
      colors[i3 + 1] = 0.7; // G
      colors[i3 + 2] = 1.0; // B
      
      sizes[i] = Math.random() * 3 + 1;
      lifetimes[i] = Math.random() * 5 + 2; // 2-7 seconds
      ages[i] = Math.random() * lifetimes[i]; // Random starting age
    }
    
    return {
      positions,
      velocities,
      colors,
      sizes,
      lifetimes,
      ages,
      activeParticles: 0
    };
  }, [particleCount]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!enabled || !isConnected || !particlesRef.current) return;
    
    const { positions, velocities, colors, sizes, lifetimes, ages } = particleSystem;
    const transactions = getTransactionAnimations();
    
    // Update existing particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Age particles
      ages[i] += delta;
      
      // Reset dead particles
      if (ages[i] >= lifetimes[i]) {
        // Check if we have new transaction data to spawn from
        if (transactions.length > 0) {
          const tx = transactions[Math.floor(Math.random() * transactions.length)];
          
          // Spawn near a planet (contract) or at origin (new block)
          const spawnRadius = 50 + Math.random() * 100;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          positions[i3] = spawnRadius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = spawnRadius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = spawnRadius * Math.cos(phi);
          
          // Set velocity based on transaction value
          const speed = 10 + tx.intensity * 50;
          const direction = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();
          
          velocities[i3] = direction.x * speed;
          velocities[i3 + 1] = direction.y * speed;
          velocities[i3 + 2] = direction.z * speed;
          
          // Set color based on transaction gas price
          const color = new THREE.Color(tx.color);
          colors[i3] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
          
          // Set size based on transaction value
          sizes[i] = 1 + tx.intensity * 4;
          
          // Reset age and lifetime
          ages[i] = 0;
          lifetimes[i] = 3 + Math.random() * 4; // 3-7 seconds
        } else {
          // No transaction data, reset to dormant state
          ages[i] = 0;
          lifetimes[i] = Math.random() * 10 + 5; // Longer dormant period
          
          // Move to edge of space
          const radius = 2000 + Math.random() * 1000;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);
          
          // Minimal velocity
          velocities[i3] = (Math.random() - 0.5) * 2;
          velocities[i3 + 1] = (Math.random() - 0.5) * 2;
          velocities[i3 + 2] = (Math.random() - 0.5) * 2;
          
          // Dim blue color
          colors[i3] = 0.2;
          colors[i3 + 1] = 0.4;
          colors[i3 + 2] = 0.8;
          
          sizes[i] = 0.5 + Math.random() * 1;
        }
      }
      
      // Update positions
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Apply gravity towards center for some particles
      if (Math.random() < 0.1) {
        const centerForce = 0.5;
        const distance = Math.sqrt(
          positions[i3] ** 2 + 
          positions[i3 + 1] ** 2 + 
          positions[i3 + 2] ** 2
        );
        
        if (distance > 0) {
          velocities[i3] -= (positions[i3] / distance) * centerForce * delta;
          velocities[i3 + 1] -= (positions[i3 + 1] / distance) * centerForce * delta;
          velocities[i3 + 2] -= (positions[i3 + 2] / distance) * centerForce * delta;
        }
      }
      
      // Fade particles based on age
      const fadeRatio = 1 - (ages[i] / lifetimes[i]);
      const originalR = colors[i3];
      const originalG = colors[i3 + 1];
      const originalB = colors[i3 + 2];
      
      colors[i3] = originalR * fadeRatio;
      colors[i3 + 1] = originalG * fadeRatio;
      colors[i3 + 2] = originalB * fadeRatio;
      
      sizes[i] = sizes[i] * fadeRatio;
    }
    
    // Update geometry attributes
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
    particlesRef.current.geometry.attributes.size.needsUpdate = true;
  });
  
  if (!enabled) return null;
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particleSystem.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particleSystem.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={particleSystem.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default LiveTransactionParticles;
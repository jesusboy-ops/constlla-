/**
 * Spaceship Controller
 * Handles spaceship movement, camera follow, and scanner mechanics
 * Performance-optimized with smooth damping and auto-stabilization
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExplorationStore, EXPLORATION_MODES } from '../../state/useExplorationStore.js';

const SpaceshipController = () => {
  const { camera } = useThree();
  const { 
    mode, 
    spaceshipVisible,
    updateSpaceshipPosition,
    updateSpaceshipVelocity,
    updateNearbyPlanets,
    cleanupDistantPlanets,
    activateScanner
  } = useExplorationStore();
  
  // Movement state
  const [keys, setKeys] = useState({
    w: false, a: false, s: false, d: false,
    space: false, shift: false
  });
  
  // Spaceship physics (reusable objects for performance)
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const acceleration = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Euler());
  
  // Camera follow system
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3(0, 5, 15));
  const cameraLookAt = useRef(new THREE.Vector3());
  
  // Scanner system
  const scannerDirection = useRef(new THREE.Vector3(0, 0, -1));
  
  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat || mode !== EXPLORATION_MODES.EXPLORE) return;
      
      switch (event.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, w: true }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, a: true }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, s: true }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, d: true }));
          break;
        case 'Space':
          event.preventDefault();
          // Activate scanner
          activateScanner([
            scannerDirection.current.x,
            scannerDirection.current.y,
            scannerDirection.current.z
          ]);
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys(prev => ({ ...prev, shift: true }));
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, w: false }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, a: false }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, s: false }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, d: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys(prev => ({ ...prev, shift: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, activateScanner]);
  
  // Mouse steering (gentle influence)
  useEffect(() => {
    let mouseInfluence = { x: 0, y: 0 };
    
    const handleMouseMove = (event) => {
      if (mode !== EXPLORATION_MODES.EXPLORE) return;
      
      // Gentle mouse steering influence
      mouseInfluence.x = (event.movementX || 0) * 0.001;
      mouseInfluence.y = (event.movementY || 0) * 0.001;
      
      // Apply to target rotation
      targetRotation.current.y -= mouseInfluence.x;
      targetRotation.current.x -= mouseInfluence.y;
      
      // Clamp rotation
      targetRotation.current.x = Math.max(-0.3, Math.min(0.3, targetRotation.current.x));
      targetRotation.current.y = Math.max(-0.5, Math.min(0.5, targetRotation.current.y));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mode]);
  
  // Main update loop
  useFrame((state, delta) => {
    if (mode !== EXPLORATION_MODES.EXPLORE || !spaceshipVisible) return;
    
    // Physics constants
    const maxSpeed = 25;
    const acceleration_force = 40;
    const damping = 0.92;
    const autoStabilization = 0.98;
    
    // Reset acceleration
    acceleration.current.set(0, 0, 0);
    
    // WASD movement (smooth and damped)
    if (keys.w) acceleration.current.z -= acceleration_force;
    if (keys.s) acceleration.current.z += acceleration_force * 0.6; // Slower reverse
    if (keys.a) acceleration.current.x -= acceleration_force * 0.8;
    if (keys.d) acceleration.current.x += acceleration_force * 0.8;
    if (keys.shift) acceleration.current.y -= acceleration_force * 0.6; // Down
    
    // Apply acceleration to velocity
    velocity.current.add(
      acceleration.current.clone().multiplyScalar(delta)
    );
    
    // Apply damping
    velocity.current.multiplyScalar(damping);
    
    // Auto-stabilization when no input
    const hasInput = keys.w || keys.a || keys.s || keys.d || keys.shift;
    if (!hasInput) {
      velocity.current.multiplyScalar(autoStabilization);
      targetRotation.current.multiplyScalar(0.95); // Return to center
    }
    
    // Clamp max speed
    if (velocity.current.length() > maxSpeed) {
      velocity.current.normalize().multiplyScalar(maxSpeed);
    }
    
    // Update position
    position.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Update scanner direction (forward from ship)
    scannerDirection.current.set(0, 0, -1);
    
    // Third-person camera follow (cinematic)
    const baseOffset = new THREE.Vector3(0, 8, 20);
    
    // Add subtle camera sway based on velocity
    const velocityInfluence = velocity.current.clone().multiplyScalar(0.3);
    const dynamicOffset = baseOffset.clone().add(velocityInfluence);
    
    // Smooth camera positioning
    const cameraSmoothing = 0.08;
    cameraTarget.current.copy(position.current).add(dynamicOffset);
    cameraPosition.current.lerp(cameraTarget.current, cameraSmoothing);
    
    // Dynamic look-ahead based on movement
    const lookAhead = velocity.current.clone().multiplyScalar(2);
    cameraLookAt.current.copy(position.current).add(lookAhead).add(new THREE.Vector3(0, 0, -5));
    
    // Apply to Three.js camera with smooth interpolation
    camera.position.lerp(cameraPosition.current, cameraSmoothing);
    
    // Smooth camera rotation
    const targetQuaternion = new THREE.Quaternion();
    camera.lookAt(cameraLookAt.current);
    targetQuaternion.copy(camera.quaternion);
    camera.quaternion.slerp(targetQuaternion, cameraSmoothing * 0.5);
    
    // Update exploration store
    updateSpaceshipPosition([
      position.current.x,
      position.current.y,
      position.current.z
    ]);
    
    updateSpaceshipVelocity([
      velocity.current.x,
      velocity.current.y,
      velocity.current.z
    ]);
    
    // Update nearby planets (proximity detection)
    updateNearbyPlanets([
      position.current.x,
      position.current.y,
      position.current.z
    ]);
    
    // Cleanup distant planets (performance)
    cleanupDistantPlanets([
      position.current.x,
      position.current.y,
      position.current.z
    ]);
  });
  
  return null; // This component only handles logic
};

export default SpaceshipController;
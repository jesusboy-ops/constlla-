/**
 * Camera State Store
 * Manages immersive space-travel camera system with 3 modes:
 * - FREE_TRAVEL: Slow forward drift with WASD nudges
 * - ASSISTED_FOCUS: Camera assists in focusing on objects
 * - DOCKED_ORBIT: Orbiting around selected planet
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

// Camera modes
export const CAMERA_MODES = {
  FREE_TRAVEL: 'FREE_TRAVEL',
  ASSISTED_FOCUS: 'ASSISTED_FOCUS', 
  DOCKED_ORBIT: 'DOCKED_ORBIT'
};

// Reusable vectors for performance (no allocations in render loop)
const tempVector1 = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();
const tempVector3 = new THREE.Vector3();

export const useCameraStore = create(
  subscribeWithSelector((set, get) => ({
    // Camera mode state
    mode: CAMERA_MODES.FREE_TRAVEL,
    previousMode: CAMERA_MODES.FREE_TRAVEL,
    
    // Camera transform
    position: new THREE.Vector3(0, 0, 100),
    target: new THREE.Vector3(0, 0, 0),
    up: new THREE.Vector3(0, 1, 0),
    
    // Movement state
    velocity: new THREE.Vector3(0, 0, -2), // Slow forward drift
    acceleration: new THREE.Vector3(),
    
    // Input state
    keys: {
      w: false, a: false, s: false, d: false,
      space: false, shift: false
    },
    mouseInput: { x: 0, y: 0 },
    
    // Docking state
    dockedPlanet: null,
    orbitRadius: 25,
    orbitSpeed: 0.5,
    orbitAngle: 0,
    
    // Animation state
    isTransitioning: false,
    transitionProgress: 0,
    transitionDuration: 2000, // 2 seconds
    
    // Performance settings
    dampingFactor: 0.95,
    maxSpeed: 20,
    nudgeStrength: 8,
    mouseInfluence: 0.3,
    
    // Actions
    setMode: (mode) => {
      const currentMode = get().mode;
      if (currentMode !== mode) {
        set({ 
          previousMode: currentMode,
          mode,
          isTransitioning: true,
          transitionProgress: 0
        });
      }
    },
    
    setKeys: (keys) => set({ keys }),
    
    setMouseInput: (mouseInput) => set({ mouseInput }),
    
    // Dock to a planet (enters DOCKED_ORBIT mode)
    dockToPlanet: (planet) => {
      const { position } = get();
      const planetPos = new THREE.Vector3(...planet.position);
      
      // Calculate orbit position
      const direction = tempVector1.copy(position).sub(planetPos).normalize();
      const orbitPos = tempVector2.copy(planetPos).add(direction.multiplyScalar(25));
      
      set({
        mode: CAMERA_MODES.DOCKED_ORBIT,
        dockedPlanet: planet,
        target: planetPos.clone(),
        orbitAngle: Math.atan2(direction.x, direction.z),
        isTransitioning: true,
        transitionProgress: 0
      });
    },
    
    // Undock from planet (returns to FREE_TRAVEL)
    undock: () => {
      set({
        mode: CAMERA_MODES.FREE_TRAVEL,
        dockedPlanet: null,
        velocity: tempVector1.set(0, 0, -2), // Resume forward drift
        isTransitioning: true,
        transitionProgress: 0
      });
    },
    
    // Update camera physics (called every frame)
    updateCamera: (delta, camera) => {
      const state = get();
      const { 
        mode, keys, mouseInput, velocity, acceleration, 
        dampingFactor, maxSpeed, nudgeStrength, mouseInfluence,
        dockedPlanet, orbitRadius, orbitSpeed, orbitAngle,
        isTransitioning, transitionProgress, transitionDuration
      } = state;
      
      // Handle transitions
      if (isTransitioning) {
        const newProgress = Math.min(transitionProgress + (delta * 1000) / transitionDuration, 1);
        set({ transitionProgress: newProgress });
        
        if (newProgress >= 1) {
          set({ isTransitioning: false });
        }
      }
      
      switch (mode) {
        case CAMERA_MODES.FREE_TRAVEL:
          get().updateFreeTravelCamera(delta, camera);
          break;
          
        case CAMERA_MODES.ASSISTED_FOCUS:
          get().updateAssistedFocusCamera(delta, camera);
          break;
          
        case CAMERA_MODES.DOCKED_ORBIT:
          get().updateDockedOrbitCamera(delta, camera);
          break;
      }
    },
    
    // Free travel mode: slow drift + WASD nudges + mouse steering
    updateFreeTravelCamera: (delta, camera) => {
      const { keys, mouseInput, velocity, acceleration, dampingFactor, maxSpeed, nudgeStrength, mouseInfluence } = get();
      
      // Reset acceleration
      acceleration.set(0, 0, 0);
      
      // WASD nudges (gentle directional influence)
      if (keys.w) acceleration.z -= nudgeStrength;
      if (keys.s) acceleration.z += nudgeStrength * 0.5; // Slower backward
      if (keys.a) acceleration.x -= nudgeStrength * 0.7;
      if (keys.d) acceleration.x += nudgeStrength * 0.7;
      if (keys.space) acceleration.y += nudgeStrength * 0.7;
      if (keys.shift) acceleration.y -= nudgeStrength * 0.7;
      
      // Mouse steering influence (subtle)
      acceleration.x += mouseInput.x * mouseInfluence;
      acceleration.y -= mouseInput.y * mouseInfluence;
      
      // Apply acceleration to velocity
      velocity.add(tempVector1.copy(acceleration).multiplyScalar(delta));
      
      // Apply damping
      velocity.multiplyScalar(dampingFactor);
      
      // Clamp max speed
      if (velocity.length() > maxSpeed) {
        velocity.normalize().multiplyScalar(maxSpeed);
      }
      
      // Ensure minimum forward drift
      if (velocity.z > -0.5) {
        velocity.z = -0.5;
      }
      
      // Update camera position
      const newPosition = tempVector2.copy(get().position).add(tempVector3.copy(velocity).multiplyScalar(delta));
      
      // Update target to maintain forward look
      const newTarget = tempVector3.copy(newPosition).add(tempVector1.set(0, 0, -10));
      
      // Subtle sway (no nausea)
      const time = Date.now() * 0.0005;
      newPosition.y += Math.sin(time) * 0.1;
      newTarget.x += Math.sin(time * 0.7) * 0.2;
      
      set({ 
        position: newPosition.clone(),
        target: newTarget.clone(),
        velocity: velocity.clone()
      });
      
      // Apply to Three.js camera
      camera.position.copy(newPosition);
      camera.lookAt(newTarget);
    },
    
    // Assisted focus mode: helps focus on nearby objects
    updateAssistedFocusCamera: (delta, camera) => {
      // Similar to free travel but with object attraction
      get().updateFreeTravelCamera(delta, camera);
      
      // TODO: Add object attraction logic when hovering
    },
    
    // Docked orbit mode: orbit around selected planet
    updateDockedOrbitCamera: (delta, camera) => {
      const { dockedPlanet, orbitRadius, orbitSpeed, orbitAngle, isTransitioning, transitionProgress } = get();
      
      if (!dockedPlanet) {
        get().setMode(CAMERA_MODES.FREE_TRAVEL);
        return;
      }
      
      const planetPos = tempVector1.set(...dockedPlanet.position);
      
      // Update orbit angle
      const newOrbitAngle = orbitAngle + orbitSpeed * delta;
      
      // Calculate orbit position
      const orbitX = planetPos.x + Math.sin(newOrbitAngle) * orbitRadius;
      const orbitZ = planetPos.z + Math.cos(newOrbitAngle) * orbitRadius;
      const orbitY = planetPos.y + Math.sin(newOrbitAngle * 0.3) * 5; // Slight vertical movement
      
      const orbitPosition = tempVector2.set(orbitX, orbitY, orbitZ);
      
      // Smooth transition if transitioning
      if (isTransitioning) {
        const currentPos = get().position;
        orbitPosition.lerp(currentPos, 1 - transitionProgress);
      }
      
      set({
        position: orbitPosition.clone(),
        target: planetPos.clone(),
        orbitAngle: newOrbitAngle
      });
      
      // Apply to Three.js camera
      camera.position.copy(orbitPosition);
      camera.lookAt(planetPos);
    },
    
    // Get current camera state for UI
    getCameraState: () => {
      const { mode, dockedPlanet, isTransitioning } = get();
      return {
        mode,
        isDockedToPlanet: mode === CAMERA_MODES.DOCKED_ORBIT && dockedPlanet,
        planetName: dockedPlanet?.contractName || dockedPlanet?.title,
        isTransitioning
      };
    },
    
    // Reset camera to initial state
    reset: () => {
      set({
        mode: CAMERA_MODES.FREE_TRAVEL,
        position: new THREE.Vector3(0, 0, 100),
        target: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(0, 0, -2),
        acceleration: new THREE.Vector3(),
        dockedPlanet: null,
        orbitAngle: 0,
        isTransitioning: false,
        transitionProgress: 0
      });
    }
  }))
);